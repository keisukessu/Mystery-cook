"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCredentials = async () => {
        setIsLoading(true);
        setError("");

        if (mode === "register") {
            // 新規登録：バックエンドの /auth/register を叩く
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                }
            );

            if (!res.ok) {
                const data = await res.json();
                setError(data.detail ?? "登録に失敗しました");
                setIsLoading(false);
                return;
            }

            // 登録成功後そのままログイン
            await signIn("credentials", { email, password, callbackUrl: "/" });
        } else {
            // ログイン
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            setIsLoading(false);
            if (result?.error) {
                setError("メールアドレスまたはパスワードが間違っています");
            } else {
                window.location.href = "/";
            }
        }
    };

    const handleGoogle = async () => {
        await signIn("google", { callbackUrl: "/" });
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-bg-cream px-6 relative">
            {/* 左上のホームに戻るボタン */}
            <div className="absolute top-4 left-4">
                <a
                    href="/"
                    className="flex items-center gap-1.5 font-noto text-[12px] text-[#9A8060] hover:text-text-dark-brown transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M5 12l7-7M5 12l7 7" />
                    </svg>
                    ホームへ
                </a>
            </div>

            <main className="flex flex-col items-center gap-6 w-full max-w-sm">
                <p className="font-playfair text-[11px] tracking-widest text-[#9A8060]">
                    — Mystery Cook —
                </p>
                <div className="w-12 border-t border-border-linen" />

                {/* モード切り替えタブ */}
                <div className="flex w-full border border-border-linen rounded-pill overflow-hidden">
                    <button
                        onClick={() => { setMode("login"); setError(""); }}
                        className={`flex-1 py-2 font-noto text-[14px] transition-colors cursor-pointer ${mode === "login"
                            ? "bg-text-dark-brown text-bg-cream"
                            : "bg-white text-text-dark-brown"
                            }`}
                    >
                        ログイン
                    </button>
                    <button
                        onClick={() => { setMode("register"); setError(""); }}
                        className={`flex-1 py-2 font-noto text-[14px] transition-colors cursor-pointer ${mode === "register"
                            ? "bg-text-dark-brown text-bg-cream"
                            : "bg-white text-text-dark-brown"
                            }`}
                    >
                        新規登録
                    </button>
                </div>

                {error && (
                    <p className="font-noto text-[13px] text-accent-spice-orange">
                        {error}
                    </p>
                )}

                {/* Googleログイン */}
                <button
                    onClick={handleGoogle}
                    className="w-full rounded-pill border border-border-linen bg-white py-3 font-noto text-[14px] text-text-dark-brown transition-opacity hover:opacity-80 cursor-pointer flex items-center justify-center gap-2"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
                        <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z" />
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
                    </svg>
                    Googleで{mode === "login" ? "ログイン" : "登録"}
                </button>

                <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 border-t border-border-linen" />
                    <p className="font-noto text-[11px] text-[#9A8060]">または</p>
                    <div className="flex-1 border-t border-border-linen" />
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <input
                        type="email"
                        placeholder="メールアドレス"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-border-linen bg-white px-4 py-3 font-noto text-[14px] text-text-dark-brown outline-none focus:border-text-dark-brown"
                    />
                    <input
                        type="password"
                        placeholder="パスワード"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-border-linen bg-white px-4 py-3 font-noto text-[14px] text-text-dark-brown outline-none focus:border-text-dark-brown"
                    />
                </div>

                <button
                    onClick={handleCredentials}
                    disabled={isLoading}
                    className="w-full rounded-pill bg-text-dark-brown py-3 font-noto text-[16px] text-bg-cream transition-opacity hover:opacity-80 cursor-pointer disabled:opacity-50"
                >
                    {isLoading ? "処理中..." : mode === "login" ? "ログイン" : "新規登録"}
                </button>

                <div className="w-12 border-t border-border-linen" />
                <p className="font-playfair text-[11px] tracking-widest text-[#9A8060]">
                    Chef&apos;s Table
                </p>
            </main>
        </div>
    );
}