import uuid
from datetime import datetime
from pydantic import BaseModel


class UserDishCreate(BaseModel):
    dish_id: uuid.UUID


class UserDishResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    dish_id: uuid.UUID
    cooked_at: datetime

    model_config = {"from_attributes": True}


class UserDishListResponse(BaseModel):
    """
    「作った！」一覧のカード表示用レスポンス。
    UserDish と Dish を JOIN した結果を返すので、
    Dish の情報もここに含める。
    """
    id: uuid.UUID
    dish_id: uuid.UUID
    cooked_at: datetime

    # Dish の情報（カード表示に必要なもの）
    # なぜ Dish をネストしないか：
    # フロントエンドがフラットな構造の方が扱いやすく、
    # カード表示に必要なフィールドだけに絞れる
    name: str
    country: str
    difficulty: int
    unsplash_image_url: str | None

    model_config = {"from_attributes": True}