"use client";  // useStateを使うためにクライアントコンポーネント宣言が必要

import { useState } from "react";
import Cloche from "@/components/Cloche";
import { spinGacha, type Dish } from "@/lib/api";
import Particles from "@/components/Particles";
import RecipeModal from "@/components/RecipeModal";

// 画面の状態を型で定義
// → どんな値が入るか明示することでタイポによるバグを防ぐ
type Screen = "top" | "gacha" | "result";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("top");
  const [dish, setDish] = useState<Dish | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ガチャを回すボタンを押したときの処理
  const handleStart = async () => {
    setIsLoading(true);
    try {
      const data = await spinGacha();
      setDish(data.dish);
      setScreen("gacha");
    } catch (e) {
      alert("料理の取得に失敗しました。もう一度お試しください。");
    } finally {
      // 成功・失敗どちらでもローディングを解除する
      setIsLoading(false);
    }
  };

  return (
    <>
      {screen === "top" && (
        <TopScreen onStart={handleStart} isLoading={isLoading} />
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
    </>
  );
}
// 01_トップ画面
function TopScreen({ onStart, isLoading }: { onStart: () => void; isLoading: boolean }) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-bg-cream px-6">
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
          {/* ローディング中はテキストを変える */}
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

  return (
    <>
      {/* モーダル */}
      {showModal && (
        <RecipeModal
          dish={dish}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="flex flex-col flex-1 items-center justify-center bg-bg-cream px-6 py-12">
        <main className="flex flex-col items-center gap-6 w-full max-w-sm">
          <p className="font-playfair text-[10px] tracking-widest text-[#9A8060]">
            — 今夜の一皿 —
          </p>
          <div className="w-full bg-white rounded-2xl border border-border-linen overflow-hidden">
            {dish.unsplash_image_url ? (
              <img
                src={dish.unsplash_image_url}
                alt={dish.name}
                className="w-full h-40 object-cover"
              />
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
              <h2 className="font-playfair text-[22px] text-text-dark-brown">
                {dish.name}
              </h2>
              <p className="font-noto text-[13px] text-'#6B5A3A' leading-relaxed">
                {dish.description}
              </p>
              {/* レシピを見るボタン：クリックでモーダルを開く */}
              <button
                onClick={() => setShowModal(true)}
                className="w-full rounded-lg bg-text-dark-brown py-3 font-noto text-[14px] text-bg-cream transition-opacity hover:opacity-80 cursor-pointer"
              >
                レシピを見る
              </button>
              <button className="w-full rounded-lg border border-border-linen py-3 font-noto text-[14px] text-text-dark-brown transition-opacity hover:opacity-80 cursor-pointer">
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