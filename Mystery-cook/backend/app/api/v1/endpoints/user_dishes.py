"""
api/v1/endpoints/user_dishes.py

「作った！」の記録を管理するエンドポイント。
"""

import logging
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.dish import Dish
from app.models.user_dish import UserDish
from app.schemas.user_dish import UserDishCreate, UserDishResponse, UserDishListResponse
from app.core.deps import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc, desc, select
from sqlalchemy.orm import selectinload


router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=list[UserDishListResponse])
async def list_user_dishes(
    sort_by: Literal["cooked_at", "name", "country", "difficulty"] = Query(
        default="cooked_at",
        description="ソートキー",
    ),
    order: Literal["asc", "desc"] = Query(
        default="desc",
        description="昇順・降順",
    ),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    ログインユーザーの「作った！」一覧を返す。

    なぜ Dish と JOIN するか：
    ソートキーの name・country・difficulty は Dish テーブルのカラムなので、
    UserDish だけでは取得できない。JOIN することでまとめて取れる。
    """
    # ソートキーのカラムを解決する
    # なぜ辞書で管理するか：
    # if/elif で書くより追加・変更が簡単で、不正な値も弾きやすい
    sort_column_map = {
        "cooked_at": UserDish.cooked_at,
        "name": Dish.name,
        "country": Dish.country,
        "difficulty": Dish.difficulty,
    }
    sort_column = sort_column_map[sort_by]
    order_func = desc if order == "desc" else asc

    result = await db.execute(
        select(UserDish)
        .join(Dish, Dish.id == UserDish.dish_id)
        .options(selectinload(UserDish.dish))  
        .where(UserDish.user_id == current_user.id)
        .order_by(order_func(sort_column))
    )
    user_dishes = result.scalars().all()

    return user_dishes


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