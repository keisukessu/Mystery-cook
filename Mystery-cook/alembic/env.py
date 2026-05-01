"""
alembic/env.py

なぜ非同期対応の env.py が必要か：
FastAPIでは asyncpg（非同期ドライバ）を使うが、
Alembicのデフォルトは同期ドライバを想定している。
run_async_migrations() でイベントループを明示的に扱うことで、
同じDB接続設定を使いながらマイグレーションを実行できる。
"""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# Base は session.py が唯一の定義元なのでそこからインポートする。
# app.models を import することで各モデルが Base.metadata に登録される（副作用が目的）。
# この2行がないと autogenerate が「差分なし」と判定してしまう。
from app.db.session import Base  # noqa: F401
import app.models  # noqa: F401
from app.core.config import settings

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# マイグレーション対象のメタデータ
target_metadata = Base.metadata

# alembic.ini の sqlalchemy.url を環境変数で上書きする
# 理由：.ini にDB URLをハードコードするとGitに秘密情報が漏れるリスクがある
config.set_main_option("sqlalchemy.url", settings.database_url)


def run_migrations_offline() -> None:
    """
    オフラインモード：DBに接続せずSQLを生成するだけのモード。
    `alembic upgrade head --sql` で使われる。
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    非同期エンジンでマイグレーションを実行する。
    NullPool を使う理由：
    マイグレーションは短命なプロセスなのでコネクションプールは不要。
    NullPool にすることで接続を使い捨てにし、
    プロセス終了後に接続が残らないようにする。
    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    """オンラインモード（通常はこちら）"""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()