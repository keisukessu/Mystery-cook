"""
models/base.py

なぜ Base を session.py からインポートするか：
- Base（DeclarativeBase）は「どのテーブルが存在するか」を管理する
  メタデータレジストリ。
- main.py の lifespan で `Base.metadata.create_all` を呼んでいるのは
  session.py の Base なので、モデルも必ず同じ Base を継承しなければならない。
- 2つの Base が存在すると、片方に登録されたモデルがもう片方から見えず、
  テーブルが作成されないサイレントバグになる。
- そのため Base の定義は session.py に1箇所だけ置き、
  ここではそれを再エクスポートするだけにする。
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

# session.py が唯一の Base 定義元。ここでは再エクスポートのみ。
from app.db.session import Base  # noqa: F401

__all__ = ["Base", "TimestampMixin", "UUIDMixin"]


class TimestampMixin:
    """
    created_at を持つモデルに mixin として使う。

    server_default=func.now() を使う理由：
    Pythonレイヤーで datetime.now() を渡すと、アプリサーバーの時刻に依存してしまう。
    DBサーバー側で生成することで、タイムゾーン設定の差異による不整合を防げる。
    """
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


class UUIDMixin:
    """
    UUID主キーを持つモデルに mixin として使う。

    連番（SERIAL）ではなくUUIDを使う理由：
    連番だと「自分が1000番目のユーザー」と件数が推測できてしまう。
    UUIDなら予測不能で、将来の分散DB移行にも対応しやすい。
    """
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,  # INSERT時にPython側でUUIDを生成
    )