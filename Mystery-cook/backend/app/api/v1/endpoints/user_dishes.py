"""
api/v1/endpoints/user_dishes.py

「作った！」の記録を管理するエンドポイント。
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user_dish import UserDish
from app.models.dish import Dish
from app.schemas.user_dish import UserDishCreate, UserDishResponse
from app.core.deps import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=UserDishResponse)
async def create_user_dish(
    body: UserDishCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    「作った！」を記録する。
    同じ料理を複数回記録できる（何回作ったかを記録できる設計）。
    """
    # 料理が存在するか確認
    result = await db.execute(select(Dish).where(Dish.id == body.dish_id))
    dish = result.scalar_one_or_none()
    if not dish:
        raise HTTPException(status_code=404, detail="料理が見つかりません")

    user_dish = UserDish(
        user_id=current_user.id,
        dish_id=body.dish_id,
    )
    db.add(user_dish)
    await db.commit()
    await db.refresh(user_dish)

    return user_dish