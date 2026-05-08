from fastapi import APIRouter

from app.api.v1.endpoints import gacha, auth, user_dishes

router = APIRouter()
router.include_router(gacha.router, prefix="/gacha", tags=["gacha"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(user_dishes.router, prefix="/user-dishes", tags=["user-dishes"])