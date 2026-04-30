"""
models/__init__.py

なぜここで全モデルをインポートするか：
Alembicがマイグレーション生成時に「どのモデルが存在するか」を
Base.metadata から読み取る仕組みになっている。
モデルファイルが import されていないと Base.metadata に登録されず、
autogenerate が空のマイグレーションを生成してしまう。
"""

from app.models.base import Base
from app.models.dish import Dish
from app.models.user import User
from app.models.user_dish import UserDish

__all__ = ["Base", "User", "Dish", "UserDish"]