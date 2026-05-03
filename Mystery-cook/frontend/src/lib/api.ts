// APIレスポンスの型定義
// バックエンドのスキーマと1対1で対応させる
export type Dish = {
    id: string;
    name: string;
    country: string;
    difficulty: number;
    cook_time_minutes: number;
    description: string;
    ingredients: string[];
    steps: string[];
    unsplash_image_url: string | null; // Unsplash失敗時はnullになる
    created_at: string;
};

export type SpinResponse = {
    dish: Dish;
    is_cached: boolean;
};

// ガチャを回すAPI呼び出し
// → バックエンドはlocalhost:8000で動いている
export async function spinGacha(): Promise<SpinResponse> {
    const res = await fetch("http://localhost:8000/api/v1/gacha/spin", {
        method: "POST",
    });

    if (!res.ok) {
        throw new Error(`APIエラー: ${res.status}`);
    }

    return res.json();
}