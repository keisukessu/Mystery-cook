"""
services/unsplash.py

なぜ httpx を使うか（requests ではなく）：
FastAPI は非同期フレームワークなので、I/O待ちのある外部API呼び出しは
async/await で書くことでイベントループをブロックしない。
requests は同期ライブラリなので FastAPI と相性が悪い。
httpx は requests に近いAPIで非同期にも対応している。
"""

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

UNSPLASH_API_BASE = "https://api.unsplash.com"


class UnsplashService:
    async def search_food_image(self, dish_name_en: str) -> str | None:
        """
        料理名（英語）でUnsplashを検索し、最初の写真URLを返す。
        取得失敗時は None を返す（写真なしでもアプリは動く設計）。

        なぜ food クエリを付け足すか：
        料理名だけで検索すると地名や人物の写真が混ざることがある。
        "dish_name food" とすることで食べ物写真に絞れる確率が上がる。
        """
        query = f"{dish_name_en} food"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{UNSPLASH_API_BASE}/search/photos",
                    headers={"Authorization": f"Client-ID {settings.unsplash_access_key}"},
                    params={
                        "query": query,
                        "per_page": 1,
                        "orientation": "landscape",  # 料理カード表示に横長が適している
                    },
                )
                response.raise_for_status()
                data = response.json()

                results = data.get("results", [])
                if not results:
                    logger.warning("Unsplash: '%s' の検索結果が0件", dish_name_en)
                    return None

                # regular サイズを使う理由：
                # full は高解像度すぎてWebで遅い。thumb は荒すぎる。
                # regular（1080px幅）がWebアプリにちょうどいい。
                return results[0]["urls"]["regular"]

        except httpx.HTTPStatusError as e:
            logger.error("Unsplash APIエラー: status=%s", e.response.status_code)
            return None
        except httpx.RequestError as e:
            logger.error("Unsplash ネットワークエラー: %s", e)
            return None