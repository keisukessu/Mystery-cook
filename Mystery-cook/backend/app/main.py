from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import router as api_v1_router
from app.core.config import settings
from app.db.session import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    アプリのライフサイクル管理。

    FastAPI の推奨する起動・終了処理の書き方。
    yield の前が起動時処理、yield の後が終了時処理。

    開発環境ではDBテーブルを自動作成する。
    本番環境では Alembic のマイグレーションで管理するため実行しない。
    """
    if not settings.is_production:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    # アプリ終了時にDB接続プールを解放する
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    # 本番環境では Swagger UI を非公開にする（セキュリティ対策）
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

# CORS設定：Next.js フロントエンドからのリクエストを許可する
# allow_credentials=True が必要な理由：認証クッキーをリクエストに含めるため
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# /api/v1 プレフィックスで v1 ルーターをマウント
# バージョンをURLに含めることで、将来 v2 を追加しても v1 を壊さずに済む
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """
    ヘルスチェックエンドポイント。
    Railway や Docker のヘルスチェック、監視ツールから定期的に呼ばれる。
    """
    return {"status": "ok", "environment": settings.environment}