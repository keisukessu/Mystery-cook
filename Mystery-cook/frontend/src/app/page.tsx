"use client";

import { useState, useEffect } from "react";
import Cloche from "@/components/Cloche";
import { spinGacha, recordCooked, getUserDishes, type Dish, type UserDish } from "@/lib/api";
import RecipeModal from "@/components/RecipeModal";
import { useSession, signOut } from "next-auth/react";

type Screen = "top" | "gacha" | "result" | "cooked";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("top");
  const [dish, setDish] = useState<Dish | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const data = await spinGacha();
      setDish(data.dish);
      setScreen("gacha");
    } catch (e) {
      alert("料理の取得に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const showTab = screen === "top" || screen === "cooked";

  // ローディング中は全画面ローディングを表示
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col flex-1">
        {screen === "top" && (
          <TopScreen onStart={handleStart} isLoading={isLoading} session={session} />
        )}
        {screen === "gacha" && dish && (
          <GachaScreen dish={dish} onReveal={() => setScreen("result")} />
        )}
        {screen === "result" && dish && (
          <ResultScreen dish={dish} onRetry={() => {
            setDish(null);
            setScreen("top");
          }} />
        )}
        {screen === "cooked" && (
          <CookedScreen session={session} />
        )}
      </div>

      {showTab && (
        <BottomTab current={screen} onChange={(s) => setScreen(s as Screen)} />
      )}
    </div>
  );
}



// 01_トップ画面
function TopScreen({ onStart, isLoading, session }: { onStart: () => void; isLoading: boolean; session: any }) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-bg-cream px-6 relative">
      {/* 右上のログインボタン */}
      <div className="absolute top-4 right-4">
        {session ? (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 font-noto text-[12px] text-[#9A8060] hover:text-text-dark-brown transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            ログアウト
          </button>
        ) : (
          <a
            href="/login"
            className="flex items-center gap-1.5 font-noto text-[12px] text-[#9A8060] hover:text-text-dark-brown transition-colors border border-border-linen rounded-full px-3 py-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            ログイン / 登録
          </a>
        )}
      </div>

      <main className="flex flex-col items-center gap-6 w-full max-w-sm text-center">
        <p className="font-playfair text-[11px] tracking-widest text-[#9A8060]">
          — Chef&apos;s Table —
        </p>
        <div className="w-12 border-t border-border-linen" />
        <h1 className="font-noto text-[30px] font-bold leading-tight text-text-dark-brown whitespace-nowrap">
          世界の<span style={{ color: "#B85C2A" }}>謎</span>の一皿と出会う
        </h1>
        <p className="font-noto text-[13px] text-[#6B5A3A]">
          世界の料理がランダムで1つ表示されます。
        </p>
        <Cloche isOpened={false} />
        <div className="w-12 border-t border-border-linen" />
        <button
          onClick={onStart}
          disabled={isLoading}
          className="w-full rounded-pill bg-text-dark-brown px-8 py-3 font-noto text-[16px] text-bg-cream transition-opacity hover:opacity-80 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? "料理を探しています..." : "ガチャを回す"}
        </button>
        <div className="w-12 border-t border-border-linen" />
        <p className="font-playfair text-[11px] tracking-widest text-[#9A8060]">
          Mystery Cook
        </p>
      </main>
    </div>
  );
}

// 02_ガチャ画面
function GachaScreen({ dish, onReveal }: { dish: Dish; onReveal: () => void }) {
  const [isOpened, setIsOpened] = useState(false);
  // 画像フェードイン用：蓋が上がりきってから画像を表示するため少し遅らせる
  const [showImage, setShowImage] = useState(false);

  const handleTap = () => {
    if (!isOpened) {
      console.log("image_url:", dish.unsplash_image_url);
      setIsOpened(true);
      // 蓋のアニメーション(0.6s)が終わってから画像をフェードイン
      setTimeout(() => setShowImage(true), 1000);
    } else {
      onReveal();
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#1A0E06] px-6">
      <main className="flex flex-col items-center gap-6 w-full max-w-sm text-center">

        <p className="font-playfair text-[10px] tracking-widest text-[#6B5A3A]">
          Tonight&apos;s Mystery
        </p>
        {showImage ? (
          <div className="flex flex-col items-center gap-1">
            <p className="font-playfair text-[26px] text-bg-cream">
              {dish.name}
            </p>
            <p className="font-noto text-[11px] text-accent-spice-orange mb-2">
              {dish.country}
            </p>
          </div>
        ) : (
          <p className="font-noto text-[15px] text-[#D4C5A9]">
            何の料理が出てくるかな？
          </p>
        )}

        <div
          className="relative flex items-center justify-center cursor-pointer"
          onClick={handleTap}
        >
          {/* パーティクル：蓋が開いた瞬間に発生 */}
          {/* <Particles trigger={isOpened} /> */}

          {/* 背景文字 */}
          <p
            className="absolute font-playfair text-[48px] tracking-[0.3em] text-white select-none"
            style={{ opacity: 0.2 }}
          >
            MYSTERY
          </p>

          {/* 料理画像 */}
          {dish.unsplash_image_url && (
            <div
              className="absolute w-54 h-36 rounded-lg overflow-hidden transition-opacity duration-700"
              style={{ opacity: showImage ? 1 : 0 }}
            >
              <img
                src={dish.unsplash_image_url}
                alt={dish.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* クローシュ */}
          <div
            className="transition-opacity duration-300"
            style={{ opacity: showImage ? 0 : 1 }}
          >
            <Cloche isOpened={isOpened} />
          </div>
        </div>

        {!isOpened && (
          <p className="font-noto text-[12px] text-[#6B5A3A]">
            — タップして蓋を開ける —
          </p>
        )}

        {isOpened && (
          <div className="flex flex-col items-center gap-2 transition-opacity duration-700">

            <p className="font-noto text-[11px] text-[#6B5A3A] mt-6">
              — タップしてレシピカードを見る —
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

function ResultScreen({ dish, onRetry }: { dish: Dish; onRetry: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [cookedMessage, setCookedMessage] = useState("");
  const [hasCooked, setHasCooked] = useState(false); // 追加
  const { data: session } = useSession();

  const handleCooked = async () => {
    if (!session) {
      setCookedMessage("ログインすると「作った！」を記録できます");
      return;
    }
    try {
      await recordCooked(dish.id, (session as any).accessToken);
      setCookedMessage("記録しました！");
      setHasCooked(true); // 追加
    } catch (e) {
      setCookedMessage("記録に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <>
      {showModal && (
        <RecipeModal dish={dish} onClose={() => setShowModal(false)} />
      )}
      <div className="flex flex-col flex-1 items-center justify-center bg-bg-cream px-6 py-12">
        <main className="flex flex-col items-center gap-6 w-full max-w-sm">
          <p className="font-playfair text-[10px] tracking-widest text-[#9A8060]">
            — 今夜の一皿 —
          </p>
          <div className="w-full bg-white rounded-2xl border border-border-linen overflow-hidden">
            {dish.unsplash_image_url ? (
              <img src={dish.unsplash_image_url} alt={dish.name} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-text-dark-brown" />
            )}
            <div className="flex flex-col gap-3 p-4">
              <div className="flex gap-2 flex-wrap">
                <span className="font-noto text-[11px] text-white bg-accent-spice-orange rounded px-2 py-0.5">
                  {dish.country}
                </span>
                <span className="font-noto text-[11px] text-text-dark-brown bg-[#EDE5D8] border border-border-linen rounded px-2 py-0.5">
                  難易度：{dish.difficulty}
                </span>
                <span className="font-noto text-[11px] text-text-dark-brown bg-[#EDE5D8] border border-border-linen rounded px-2 py-0.5">
                  {dish.cook_time_minutes}分
                </span>
              </div>
              <h2 className="font-playfair text-[22px] text-text-dark-brown">{dish.name}</h2>
              <p className="font-noto text-[13px] text-[#6B5A3A] leading-relaxed">{dish.description}</p>
              <button
                onClick={() => setShowModal(true)}
                className="w-full rounded-lg bg-text-dark-brown py-3 font-noto text-[14px] text-bg-cream transition-opacity hover:opacity-80 cursor-pointer"
              >
                レシピを見る
              </button>
              {cookedMessage && (
                <p className="font-noto text-[13px] text-accent-spice-orange text-center">
                  {cookedMessage}
                </p>
              )}
              {/* 一回押したらdisabledにする */}
              <button
                onClick={handleCooked}
                disabled={hasCooked}
                className="w-full rounded-lg border border-border-linen py-3 font-noto text-[14px] text-text-dark-brown transition-opacity hover:opacity-80 cursor-pointer disabled:opacity-40"
              >
                作った！
              </button>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="rounded-pill border border-border-linen px-8 py-3 font-playfair text-[14px] text-[#6B5A3A] transition-opacity hover:opacity-80 cursor-pointer"
          >
            もう一度ガチャを回す
          </button>
        </main>
      </div>
    </>
  );
}

function BottomTab({ current, onChange }: { current: string; onChange: (s: string) => void }) {
  return (
    <nav className="flex border-t border-border-linen bg-bg-cream">
      <button
        onClick={() => onChange("top")}
        className={`flex flex-1 flex-col items-center gap-1 py-3 font-noto text-[11px] transition-colors ${current === "top" ? "text-text-dark-brown" : "text-[#9A8060]"
          }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12L12 3l9 9" />
          <path d="M9 21V12h6v9" />
        </svg>
        ホーム
      </button>
      {/* 区切り線 */}
      <div className="w-px bg-border-linen my-2" />
      <button
        onClick={() => onChange("cooked")}
        className={`flex flex-1 flex-col items-center gap-1 py-3 font-noto text-[11px] transition-colors ${current === "cooked" ? "text-text-dark-brown" : "text-[#9A8060]"
          }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        作った！
      </button>
    </nav>
  );
}

function CookedScreen({ session }: { session: any }) {
  const [userDishes, setUserDishes] = useState<UserDish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"cooked_at" | "name" | "country" | "difficulty">("cooked_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null); // 追加

  useEffect(() => {
    if (!session) return;

    const fetchDishes = async () => {
      setIsLoading(true);
      try {
        const data = await getUserDishes(
          (session as any).accessToken,
          sortBy,
          order
        );
        setUserDishes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDishes();
  }, [session, sortBy, order]);

  if (!session) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-bg-cream px-6 gap-4">
        <p className="font-noto text-[15px] text-[#6B5A3A] text-center">
          「作った！」リストを見るには<br />ログインしてください
        </p>
        <a
          href="/login"
          className="rounded-pill bg-text-dark-brown px-8 py-3 font-noto text-[14px] text-bg-cream transition-opacity hover:opacity-80"
        >
          ログイン / 登録
        </a>
      </div >
    );
  }

  return (
    <>
      {/* モーダル */}
      {selectedDish && (
        <RecipeModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
      )}

      <div className="flex flex-col flex-1 bg-bg-cream px-4 pt-6 pb-4">
        <h2 className="font-playfair text-[20px] text-text-dark-brown mb-4">作った！リスト</h2>

        <div className="flex gap-2 mb-4 flex-wrap">
          {(["cooked_at", "name", "country", "difficulty"] as const).map((key) => (
            <button
              key={key}
              onClick={() => {
                if (sortBy === key) {
                  setOrder(order === "desc" ? "asc" : "desc");
                } else {
                  setSortBy(key);
                  setOrder("desc");
                }
              }}
              className={`font-noto text-[11px] px-3 py-1 rounded-full border transition-colors ${sortBy === key
                ? "bg-text-dark-brown text-bg-cream border-text-dark-brown"
                : "text-[#9A8060] border-border-linen"
                }`}
            >
              {{ cooked_at: "作った順", name: "料理名", country: "国名", difficulty: "難易度" }[key]}
              {sortBy === key && (order === "desc" ? " ↓" : " ↑")}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="font-noto text-[13px] text-[#9A8060] text-center mt-8">読み込み中...</p>
        ) : userDishes.length === 0 ? (
          <p className="font-noto text-[13px] text-[#9A8060] text-center mt-8">
            まだ「作った！」した料理がありません
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {userDishes.map((ud) => (
              <div
                key={ud.id}
                className="bg-white rounded-xl border border-border-linen overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedDish(ud.dish)} // 追加
              >
                {ud.dish.unsplash_image_url ? (
                  <img
                    src={ud.dish.unsplash_image_url}
                    alt={ud.dish.name}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 bg-[#EDE5D8]" />
                )}
                <div className="p-2 flex flex-col gap-1">
                  <p className="font-noto text-[12px] font-bold text-text-dark-brown leading-tight">
                    {ud.dish.name}
                  </p>
                  <p className="font-noto text-[10px] text-[#9A8060]">{ud.dish.country}</p>
                  <p className="font-noto text-[10px] text-[#9A8060]">難易度：{ud.dish.difficulty}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}


function LoadingScreen() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#1A0E06] gap-6">
      <p
        className="absolute font-playfair text-[48px] tracking-[0.3em] text-white select-none"
        style={{ opacity: 0.1 }}
      >
        MYSTERY
      </p>
      {/* スピナー */}
      <div className="w-10 h-10 rounded-full border-2 border-[#6B5A3A] border-t-accent-spice-orange animate-spin" />
      <p className="font-noto text-[13px] text-[#6B5A3A]">料理を探しています...</p>
    </div>
  );
}