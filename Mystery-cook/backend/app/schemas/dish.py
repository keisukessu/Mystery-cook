"""
schemas/dish.py

ingredientsとstepsをDBにはJSON文字列で保存しているが、
スキーマレベルでは list[str] として扱う。

なぜDBでJSONテキスト保存にしたか（PostgreSQLのJSON型を使わない理由）：
- この規模のアプリでは JSONB のインデックスや演算子は不要
- マイグレーション・型変換がシンプルになる
- Python側で json.dumps / json.loads するだけで完結する
"""

import json
import uuid
from datetime import datetime

from pydantic import BaseModel, field_validator


class DishResponse(BaseModel):
    """料理詳細レスポンス"""
    id: uuid.UUID
    name: str
    country: str
    difficulty: int
    cook_time_minutes: int
    description: str
    ingredients: list[str]
    steps: list[str]
    unsplash_image_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("ingredients", "steps", mode="before")
    @classmethod
    def parse_json_string(cls, v: str | list) -> list[str]:
        """
        DBから来る文字列をリストに変換する。
        ORMオブジェクトから直接来た場合は文字列、
        すでにリストの場合はそのまま返す。
        """
        if isinstance(v, str):
            return json.loads(v)
        return v


class GachaSpinResponse(BaseModel):
    """ガチャ1回分のレスポンス"""
    dish: DishResponse
    is_cached: bool  # DBキャッシュから返したか、新規生成かをフロントに伝える


class UserDishResponse(BaseModel):
    """ユーザーの調理記録レスポンス"""
    id: uuid.UUID
    dish: DishResponse
    cooked_at: datetime

    model_config = {"from_attributes": True}