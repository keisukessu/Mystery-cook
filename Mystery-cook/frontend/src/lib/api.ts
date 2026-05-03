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
    // 開発時はNEXT_PUBLIC_API_URLが未設定なのでlocalhost:8000にフォールバック
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    const res = await fetch(`${baseUrl}/api/v1/gacha/spin`, {
        method: "POST",
    });

    if (!res.ok) {
        throw new Error(`APIエラー: ${res.status}`);
    }

    return res.json();
}