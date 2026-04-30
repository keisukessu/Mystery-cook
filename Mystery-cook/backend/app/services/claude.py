"""
services/claude.py

なぜサービス層としてAPIロジックを切り出すか：
- エンドポイント（gacha.py）がAPIの呼び出し詳細を知らなくていい
- テスト時にこのクラスをモックするだけで済む
- Claude以外のAIに差し替えるときも、ここだけ変えればいい
"""

import json
import logging

import anthropic
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)


class GeneratedDish(BaseModel):
    """
    Claude APIから返ってくることを期待するデータ構造。
    Pydanticで受け取ることで、Claude出力の不正な形式を早期に検出できる。
    """
    name: str
    country: str
    difficulty: int  # 1〜5
    cook_time_minutes: int
    description: str
    ingredients: list[str]
    steps: list[str]


SYSTEM_PROMPT = """
あなたは世界中の料理に詳しいシェフです。
ユーザーが知らないような、珍しい・マイナーな料理を紹介します。

以下のJSON形式のみで回答してください。前置き・後書き・コードブロックは不要です。

{
  "name": "料理名（英語）",
  "country": "発祥国・地域名（英語）",
  "difficulty": 難易度（1〜5の整数）,
  "cook_time_minutes": 調理時間（分・整数）,
  "description": "料理の概要（日本語・100文字程度）",
  "ingredients": ["材料1（分量付き）", "材料2", ...],
  "steps": ["手順1", "手順2", ...]
}
"""


class ClaudeService:
    def __init__(self) -> None:
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    def generate_dish(self, exclude_names: list[str] | None = None) -> GeneratedDish:
        """
        Claude APIを呼び出してランダムな料理を生成する。

        exclude_names: すでに「作った！」した料理名のリスト。
        プロンプトに含めることで、ガチャの重複を減らす。
        （完全な保証ではなく、ベストエフォート）
        """
        user_message = "ランダムに1つの料理を紹介してください。"

        if exclude_names:
            # あまり長くなりすぎないよう直近20件だけ除外リストに含める
            recent_excluded = exclude_names[-20:]
            exclusion_text = "、".join(recent_excluded)
            user_message += f"\n以下の料理は除外してください：{exclusion_text}"

        try:
            response = self.client.messages.create(
                model="claude-haiku-4-5",
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_message}],
            )

            raw_text = response.content[0].text

            # Claudeがたまにコードブロックで囲んで返すことがあるので除去する
            clean_text = (
                raw_text.strip()
                .removeprefix("```json")
                .removeprefix("```")
                .removesuffix("```")
                .strip()
            )

            dish_data = json.loads(clean_text)
            return GeneratedDish(**dish_data)

        except json.JSONDecodeError as e:
            logger.error("Claude APIのレスポンスがJSONでない: %s", raw_text)
            raise ValueError(f"Claude APIの出力をJSONとしてパースできませんでした: {e}") from e

        except anthropic.APIError as e:
            logger.error("Claude API呼び出しエラー: %s", e)
            raise