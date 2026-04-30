"""
schemas/auth.py

リクエスト・レスポンスで別スキーマを定義する理由：
- UserCreate はパスワード（平文）を含む → APIレスポンスには絶対に使わない
- UserResponse はパスワードを含まない → 外部に返して安全なデータのみ
- この分離をスキーマレベルで強制することで、
  「うっかりパスワードを返す」バグをコンパイル時に防げる
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    """ユーザー登録リクエスト"""
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        # 最低限のバリデーション。本番ではより厳格にすること
        if len(v) < 8:
            raise ValueError("パスワードは8文字以上にしてください")
        return v


class UserLogin(BaseModel):
    """ログインリクエスト"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """APIレスポンスに含めるユーザー情報（パスワード含まず）"""
    id: uuid.UUID
    email: str
    created_at: datetime

    # SQLAlchemyのORMオブジェクトを直接受け取れるようにする
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT発行レスポンス"""
    access_token: str
    token_type: str = "bearer"