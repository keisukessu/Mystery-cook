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