"""
models/user_dish.py

なぜ純粋な多対多テーブルではなくモデルとして定義するか：
「いつ作ったか（cooked_at）」という属性を持つため、
これは単なる関連ではなく「調理した記録」というエンティティ。
属性を持つ中間テーブルは、独立したモデルとして扱うのが設計上の正解。
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class UserDish(Base):
    __tablename__ = "user_dishes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="CASCADE: ユーザー削除時に調理記録も連鎖削除",
    )
    dish_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("dishes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    cooked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # リレーション
    user: Mapped["User"] = relationship("User", back_populates="user_dishes")
    dish: Mapped["Dish"] = relationship("Dish", back_populates="user_dishes")

    def __repr__(self) -> str:
        return f"<UserDish user={self.user_id} dish={self.dish_id}>"