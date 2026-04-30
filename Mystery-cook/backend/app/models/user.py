"""
models/user.py

なぜ email に unique=True + index=True を両方つけるか：
- unique制約はDBの整合性保証（重複登録の防止）
- Indexはログイン時の「email で検索」を高速化するため
  （unique制約だけでもDBによってはインデックスが作られるが、明示することで意図を伝える）
"""

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="bcryptハッシュ済みパスワード。平文は絶対に保存しない",
    )

    # リレーション：Userが持つ「作った料理」の記録
    # lazy="selectin" を使う理由：
    # デフォルトの lazy="select" だと N+1問題が起きやすい。
    # selectin は「必要なときに IN句でまとめて取得」するので効率的。
    user_dishes: Mapped[list["UserDish"]] = relationship(
        "UserDish",
        back_populates="user",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"