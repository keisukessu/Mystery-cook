import uuid
from datetime import datetime
from pydantic import BaseModel



class UserDishCreate(BaseModel):
    dish_id: uuid.UUID





class UserDishListResponse(BaseModel):
    """
    「作った！」一覧のカード表示用レスポンス。
    フロントのカードに必要な情報を dish にネストして返す。
    """
    id: uuid.UUID
    cooked_at: datetime
    dish: DishResponse  # UserDish.dish リレーションから取得

    model_config = {"from_attributes": True}