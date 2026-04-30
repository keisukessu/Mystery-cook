from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    アプリ全体の設定を管理するクラス。

    pydantic-settings により .env ファイルと環境変数を自動で読み込む。
    型アノテーションでバリデーションも自動実行されるため、
    設定ミスを起動時に検出できる。
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,  # DATABASE_URL と database_url を同一視する
    )

    # --- アプリ基本設定 ---
    app_name: str = "Mystery-cook API"
    environment: str = "development"
    debug: bool = True  # SQLAlchemy のクエリログ出力に使用

    # --- データベース ---
    # 非同期接続のため asyncpg ドライバを使用（postgresql+asyncpg://...）
    database_url: str

    # --- 認証 ---
    secret_key: str  # JWT署名に使用。本番では必ず強力なランダム文字列に変更
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7日間

    # --- 外部API ---
    anthropic_api_key: str
    unsplash_access_key: str

    # --- CORS ---
    # フロントエンド（Next.js）からのリクエストを許可するオリジン一覧
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @property
    def is_production(self) -> bool:
        """本番環境かどうかを判定。Swagger UIの表示制御などに使用する。"""
        return self.environment == "production"


# モジュールレベルでインスタンス化し、アプリ全体でこの1つをimportして使う
settings = Settings()