"""
models/dish.py

Dish は「Claude APIが生成した料理」のキャッシュテーブル。

なぜキャッシュが必要か：
同じ料理名が何度もガチャで出る可能性があり、
そのたびにClaude APIを叩くとコストが増える。
一度生成した料理は dishes テーブルに保存し、
次回は DB から返すことでAPI呼び出しを節約する。
"""

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class Dish(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "dishes"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment="料理名（英語）。Unsplash検索キーにもなる",
    )
    country: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="発祥国・地域名",
    )
    difficulty: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="難易度 1〜5。Claude APIが返す整数値をそのまま保存",
    )
    cook_time_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="調理時間（分）",
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="料理の概要説明（Claude生成）",
    )
    ingredients: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="材料リスト。JSON文字列として保存する",
    )
    steps: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="調理手順。JSON文字列として保存する",
    )
    unsplash_image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="Unsplashから取得した写真URL。取得失敗時はNullを許容",
    )

    # リレーション
    user_dishes: Mapped[list["UserDish"]] = relationship(
        "UserDish",
        back_populates="dish",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Dish id={self.id} name={self.name} country={self.country}>"