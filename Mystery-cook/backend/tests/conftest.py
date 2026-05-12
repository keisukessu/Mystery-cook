"""
tests/conftest.py

pytest のフィクスチャ定義。

設計判断:
pytest-asyncio ではなく anyio を使う。
pytest-asyncio + SQLAlchemy async + asyncpg の組み合わせは
イベントループのスコープ管理で頻繁に "attached to a different loop"
エラーを起こすため、SQLAlchemy 公式が推奨する anyio に統一する。

anyio の特徴:
- 1テスト = 1イベントループ という単純なモデル
- @pytest.fixture をそのまま async で書ける（pytest_asyncio.fixture 不要）
- バックエンドは asyncio に固定する（anyio_backend フィクスチャで指定）
"""

import os
from typing import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# 環境変数 TEST_DATABASE_URL があればそれを使う。なければローカルDocker用のデフォルト
# - ローカル: docker-compose の db サービスを指す
# - CI: GitHub Actions service コンテナを localhost で指す
TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://gacha:gacha_pass@db:5432/mystery_cook_test",
)

# アプリの import より先に環境変数を上書きする必要がある
# （config.py が起動時に環境変数を読み込むため）
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["SECRET_KEY"] = "test_secret_key_for_pytest"
os.environ["ANTHROPIC_API_KEY"] = "test_dummy_key"
os.environ["UNSPLASH_ACCESS_KEY"] = "test_dummy_key"

from app.db.session import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def anyio_backend():
    """
    anyio に「asyncio バックエンドで動かして」と伝える。
    これがないと anyio は asyncio と trio の両方でテストを動かそうとする。
    """
    return "asyncio"


@pytest.fixture
async def db_session(anyio_backend) -> AsyncGenerator[AsyncSession, None]:
    """
    各テスト関数に新しいエンジンとセッションを提供する。

    エンジンを毎回作り直すのは非効率に見えるが、
    pytest-asyncio で詰まったループ問題を物理的に回避できるメリットが大きい。
    テスト数が増えてきたら最適化を検討する。
    """
    engine = create_async_engine(TEST_DATABASE_URL)

    # テーブル作成
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with session_factory() as session:
        yield session

    # テスト後の片付け: 全テーブルの中身を消す
    async with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(
                text(f"TRUNCATE TABLE {table.name} RESTART IDENTITY CASCADE")
            )

    await engine.dispose()


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    テスト用 HTTP クライアント。
    FastAPI の get_db 依存を、テスト用セッションに差し替える。
    """

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()