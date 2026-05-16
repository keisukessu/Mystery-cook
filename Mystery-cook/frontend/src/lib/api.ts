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

// 「作った！」を記録する
export async function recordCooked(
    dishId: string,
    accessToken: string
): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    const res = await fetch(`${baseUrl}/api/v1/user-dishes/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // JWTトークンをAuthorizationヘッダーに乗せる
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ dish_id: dishId }),
    });

    if (!res.ok) {
        throw new Error(`APIエラー: ${res.status}`);
    }
}

// 「作った！」一覧のレスポンス型
export type UserDish = {
    id: string;
    cooked_at: string;
    dish: Dish;
};

export async function getUserDishes(
    accessToken: string,
    sortBy: "cooked_at" | "name" | "country" | "difficulty" = "cooked_at",
    order: "asc" | "desc" = "desc"
): Promise<UserDish[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

    const params = new URLSearchParams({ sort_by: sortBy, order });

    const res = await fetch(`${baseUrl}/api/v1/user-dishes/?${params}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error(`APIエラー: ${res.status}`);
    }

    return res.json();
}