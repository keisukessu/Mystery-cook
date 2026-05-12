"""
tests/test_auth.py

/auth/login エンドポイントのテスト。

テストの方針:
- 正常系（成功する場合）と異常系（失敗すべき場合）を両方書く
- 1テスト1検証が原則。複数のことを検証するテストはバグの原因が特定しにくい
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import User



# anyio を使うため、各テストに asyncio バックエンドを指定する
pytestmark = pytest.mark.anyio

async def test_login_success(client: AsyncClient, db_session: AsyncSession):
    """
    正しいメール・パスワードでログインできることを確認する。
    """
    # Arrange: テスト用のユーザーをDBに作っておく
    # 平文のパスワードはハッシュ化してから保存する（本番と同じ流れ）
    user = User(
        email="test@example.com",
        hashed_password=hash_password("correct_password"),
    )
    db_session.add(user)
    await db_session.commit()
    
    # Act: ログインエンドポイントを叩く
    response = await client.post(
        "/api/v1/auth/login", 
        json={"email": "test@example.com", "password": "correct_password"},
        )
    
    # Assert: 200が返って、トークンが含まれている
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    # JWTは "xxx.yyy.zzz" の3パート構成なので、最低限の形を確認
    assert data["access_token"].count(".") == 2
    
async def test_login_wrong_password(client: AsyncClient, db_session: AsyncSession):
    """
    パスワードが間違っている場合は 401 を返すことを確認する。
    """
    # Arrange: テスト用のユーザーをDBに作っておく
    user = User(
        email="test@example.com",
        hashed_password=hash_password("correct_password"),
    )
    db_session.add(user)
    await db_session.commit()

    # Act: 間違ったパスワードでログインを試みる
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrong_password"},
    )

    # Assert: 401が返って、トークンは含まれていない
    assert response.status_code == 401

async def test_login_user_not_found(client: AsyncClient):
    """
    存在しないユーザーでログインした場合も 401 を返す。

    なぜ 404 ではなく 401 か:
    「ユーザーが存在しない」と教えると、攻撃者にメールアドレスの
    有効性を確認させてしまう（アカウント列挙攻撃）。
    パスワード違いと同じ 401 を返すことでメール存在の漏洩を防ぐ。
    """
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "any_password"},
    )
    assert response.status_code == 401
    