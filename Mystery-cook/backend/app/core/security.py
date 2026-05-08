"""
core/security.py

パスワードのハッシュ化・JWT生成を担当。
なぜここに切り出すか：
- エンドポイントがセキュリティの実装詳細を知らなくていい
- テスト時にモックしやすい
"""

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(data: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {**data, "exp": expire},
        settings.secret_key,
        algorithm=settings.algorithm,
    )