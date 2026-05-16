import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.dish import DishResponse


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
    フロントのカードに必要な情報を dish にネストして返す。
    """
    id: uuid.UUID
    cooked_at: datetime
    dish: DishResponse

    model_config = {"from_attributes": True}