"""
api/v1/endpoints/gacha.py

なぜ ClaudeService を同期呼び出しのまま使うか：
anthropic の公式クライアントは同期・非同期両対応だが、
run_in_executor でスレッドプールに逃がすことで
FastAPI のイベントループへの影響を最小限にする。
"""

import json
import logging
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.dish import Dish
from app.models.user_dish import UserDish
from app.schemas.dish import DishResponse, GachaSpinResponse
from app.services.claude import ClaudeService
from app.services.unsplash import UnsplashService

router = APIRouter()
logger = logging.getLogger(__name__)

_executor = ThreadPoolExecutor(max_workers=4)


@router.post("/spin", response_model=GachaSpinResponse)
async def gacha_spin(
    user_id: str | None = None,  # TODO: Phase 4で認証後は Depends(get_current_user) に変える
    db: AsyncSession = Depends(get_db),
):
    """
    ガチャを1回回す。

    処理フロー：
    1. ユーザーの「作った料理」リストを取得（除外リスト）
    2. Claude API で料理を生成
    3. DBキャッシュ確認（同じ料理名があれば再利用）
    4. Unsplash API で写真を取得
    5. dishes テーブルに保存
    6. レスポンス返却
    """

    # Step 1: 除外リスト取得（認証前は空リスト）
    exclude_names: list[str] = []
    if user_id:
        result = await db.execute(
            select(Dish.name)
            .join(UserDish, UserDish.dish_id == Dish.id)
            .where(UserDish.user_id == user_id)
        )
        exclude_names = list(result.scalars().all())

    # Step 2: Claude API 呼び出し
    # 同期関数を非同期コンテキストで安全に実行するため run_in_executor を使う
    import asyncio
    loop = asyncio.get_event_loop()
    claude_service = ClaudeService()

    try:
        generated = await loop.run_in_executor(
            _executor,
            lambda: claude_service.generate_dish(exclude_names=exclude_names),
        )
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"AI生成エラー: {e}")
    except Exception as e:
        logger.error("Claude API予期しないエラー: %s", e)
        raise HTTPException(status_code=502, detail="料理の生成に失敗しました")

    # Step 3: DBキャッシュ確認
    existing = await db.execute(
        select(Dish).where(Dish.name == generated.name)
    )
    cached_dish = existing.scalar_one_or_none()

    if cached_dish:
        logger.info("キャッシュヒット: %s", generated.name)
        return GachaSpinResponse(
            dish=DishResponse.model_validate(cached_dish),
            is_cached=True,
        )

    # Step 4: Unsplash で写真取得
    unsplash_service = UnsplashService()
    image_url = await unsplash_service.search_food_image(generated.name)

    # Step 5: DBに保存
    new_dish = Dish(
        name=generated.name,
        country=generated.country,
        difficulty=generated.difficulty,
        cook_time_minutes=generated.cook_time_minutes,
        description=generated.description,
        ingredients=json.dumps(generated.ingredients, ensure_ascii=False),
        steps=json.dumps(generated.steps, ensure_ascii=False),
        unsplash_image_url=image_url,
    )
    db.add(new_dish)
    await db.commit()
    await db.refresh(new_dish)

    # Step 6: レスポンス返却
    return GachaSpinResponse(
        dish=DishResponse.model_validate(new_dish),
        is_cached=False,
    )