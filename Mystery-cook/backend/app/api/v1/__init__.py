from fastapi import APIRouter

from app.api.v1.endpoints import gacha

router = APIRouter()
router.include_router(gacha.router, prefix="/gacha", tags=["gacha"])