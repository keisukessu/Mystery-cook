"""
tests/test_gacha.py

なぜ dependency_overrides を使うか：
ClaudeService・UnsplashService をモックに差し替えることで、
実際の API を叩かずにエンドポイントの振る舞いだけをテストできる。
「外部 API が落ちてもテストは通る」状態が理想。
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from app.main import app  

from app.api.v1.endpoints.gacha import get_claude_service, get_unsplash_service
from app.services.claude import GeneratedDish

pytestmark = pytest.mark.anyio


# テスト用のダミー料理データ
# なぜ fixture にするか：複数テストで同じデータを使い回せるから
@pytest.fixture
def dummy_dish():
    return GeneratedDish(
        name="テスト料理",
        name_en="Test Dish",
        country="テスト国",
        country_en="Testland",
        difficulty=3,
        cook_time_minutes=30,
        description="テスト用の料理です。",
        ingredients=["材料A 100g", "材料B 少々"],
        steps=["手順1", "手順2"],
    )
    
@pytest.fixture
def mock_claude(dummy_dish: GeneratedDish) -> MagicMock:
    """
    ClaudeService をモックに差し替えるフィクスチャ。
    どのテストでも「ガチャを回すとこの料理が出る」状態になる。
    """
    mock = MagicMock()
    mock.generate_dish.return_value = dummy_dish
    return mock

@pytest.fixture
def mock_unsplash() -> AsyncMock:
    """
    UnsplashService のモック。
    search_food_image は async メソッドなので AsyncMock が必要。
    MagicMock だと await できずにエラーになる。
    """
    mock = AsyncMock()
    mock.search_food_image.return_value = "https://example.com/test.jpg"
    return mock

class TestGachaSpin:
    """
    /gacha/spin エンドポイントのテスト。

    dependency_overrides の差し替えは各テストの前後で確実にリセットする。
    リセットしないと他のテストに副作用が出る。
    """
    
    async def test_gacha_spin_success(
        self, 
        client: AsyncMock, 
        mock_claude: MagicMock, 
        mock_unsplash: AsyncMock,
    ):
        """
        正常系：料理が生成されて返ってくる。
        """
        # モックを差し替え
        app.dependency_overrides[get_claude_service] = lambda: mock_claude
        app.dependency_overrides[get_unsplash_service] = lambda: mock_unsplash
        
        try:
            response = await client.post("api/v1/gacha/spin")
        finally:
            # テスト後は必ずリセット（他のテストへの影響を防ぐ）
            app.dependency_overrides.clear()
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["dish"]["name"] == "テスト料理"
        assert data["dish"]["country"] == "テスト国"
        assert data["dish"]["difficulty"] == 3
        assert data["is_cached"] is False
        
        # Claude と Unsplash が1回ずつ呼ばれたか確認
        mock_claude.generate_dish.assert_called_once()
        mock_unsplash.search_food_image.assert_called_once_with("Test Dish")
    
    async def test_spin_unsplash_failure_still_returns_dish(
        self,
        client,
        mock_claude: MagicMock,
        mock_unsplash: AsyncMock,
    ):
        """
        フォールバック設計の検証：
        Unsplash が失敗（None を返す）しても料理は返ってくること。
        画像なしでもアプリが壊れない設計になっているかを確認する。
        """
        # Unsplash が失敗するケースをシミュレート
        mock_unsplash.search_food_image.return_value = None

        app.dependency_overrides[get_claude_service] = lambda: mock_claude
        app.dependency_overrides[get_unsplash_service] = lambda: mock_unsplash
        
        try:
            response = await client.post("/api/v1/gacha/spin")
        finally:
            app.dependency_overrides.clear()

        assert response.status_code == 200
        data = response.json()

        # 料理自体は返ってきている
        assert data["dish"]["name"] == "テスト料理"
        # 画像URLは None（またはフィールドが存在しない）
        assert data["dish"].get("unsplash_image_url") is None
    
    async def test_spin_claude_failure_returns_502(
        self,
        client,
        mock_claude: MagicMock,
        mock_unsplash: AsyncMock,
    ):
        """
        Claude API が落ちたとき 502 を返すこと。
        外部 API 障害をクライアントに適切に伝えられるかを確認する。
        """
        # Claude が例外を投げるケースをシミュレート
        mock_claude.generate_dish.side_effect = Exception("API down")
        
        app.dependency_overrides[get_claude_service] = lambda: mock_claude
        app.dependency_overrides[get_unsplash_service] = lambda: mock_unsplash

        try:
            response = await client.post("/api/v1/gacha/spin")
        finally:
            app.dependency_overrides.clear()

        assert response.status_code == 502