from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# 非同期エンジンを作成。接続はアプリ起動時に1度だけ行われる。
# pool_pre_ping=True：接続が切れていた場合に自動で再接続を試みる
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
)

# セッションファクトリ。
# expire_on_commit=False：commit後もオブジェクトの属性にアクセスできるようにする
# （FastAPIの非同期処理ではcommit後にアクセスするケースが多いため）
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """全モデルの基底クラス。全テーブル定義はこれを継承する。"""
    pass


async def get_db() -> AsyncSession:
    """
    DBセッションを生成するジェネレータ関数。

    FastAPIのDependency Injection（依存性注入）として使用する。
    リクエストごとにセッションを生成し、終了時に必ずcloseする。
    エラーが発生した場合はロールバックしてデータの整合性を保つ。

    Usage:
        @router.get("/example")
        async def example(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()