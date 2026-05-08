"""
api/v1/endpoints/auth.py

認証エンドポイント。
- POST /auth/register : 新規ユーザー登録
- POST /auth/login    : ログイン（JWTトークン返却）
"""

import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/register", response_model=TokenResponse)
async def register(
    body: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    新規ユーザー登録。
    メールアドレスが既に存在する場合は 400 を返す。
    """
    # 既存ユーザーチェック
    result = await db.execute(select(User).where(User.email == body.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="このメールアドレスは既に登録されています")

    # パスワードをハッシュ化してDB保存
    new_user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id)})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(
    body: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """
    ログイン。
    メールアドレス・パスワードを照合してJWTトークンを返す。
    """
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    # ユーザーが存在しない・パスワードが違う場合は同じエラーを返す
    # → どちらが間違いか教えないことでセキュリティを高める
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが間違っています",
        )

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)