"use client";  // useStateを使うためにクライアントコンポーネント宣言が必要

import { useState } from "react";
import Cloche from "@/components/Cloche";

// 画面の状態を型で定義
// → どんな値が入るか明示することでタイポによるバグを防ぐ
type Screen = "top" | "gacha" | "result";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("top");

  return (
    <>
      {screen === "top" && <TopScreen onStart={() => setScreen("gacha")} />}
      {screen === "gacha" && <GachaScreen onReveal={() => setScreen("result")} />}
      {screen === "result" && <ResultScreen onRetry={() => setScreen("top")} />}
    </>
  );
}

// 01_トップ画面
function TopScreen({ onStart }: { onStart: () => void }) {
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
        <Cloche />
        <div className="w-12 border-t border-border-linen" />
        <button
          onClick={onStart}
          className="w-full rounded-pill bg-text-dark-brown px-8 py-3 font-noto text-[16px] text-bg-cream transition-opacity hover:opacity-80 cursor-pointer"
        >
          ガチャを回す
        </button>
        <div className="w-12 border-t border-border-linen" />
        <p className="font-playfair text-[11px] tracking-widest text-[#9A8060]">
          Mystery Cook
        </p>
      </main>
    </div>
  );
}

// 02_ガチャ画面（仮）
function GachaScreen({ onReveal }: { onReveal: () => void }) {
  // クローシュをタップしたかどうかの状態
  const [isOpened, setIsOpened] = useState(false);

  const handleTap = () => {
    if (!isOpened) {
      // 1回目のタップ：蓋を開けて料理名を表示
      setIsOpened(true);
    } else {
      // 2回目のタップ：レシピカードへ遷移
      onReveal();
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#1A0E06] px-6">
      <main className="flex flex-col items-center gap-6 w-full max-w-sm text-center">

        {/* ラベル */}
        <p className="font-playfair text-[10px] tracking-widest text-[#6B5A3A]">
          Tonight&apos;s Mystery
        </p>

        {/* 説明テキスト */}
        <p className="font-noto text-[15px] text-[#D4C5A9]">
          何の料理が出てくるかな？
        </p>

        {/* クローシュ＋背景文字のコンテナ */}
        <div className="relative flex items-center justify-center" onClick={handleTap}>
          {/* 背景文字：クローシュの後ろに配置 */}
          <p
            className="absolute font-playfair text-[48px] tracking-[0.3em] text-white select-none"
            style={{ opacity: 0.2 }}
          >
            MYSTERY
          </p>
          {/* クローシュ本体 */}
          <Cloche />
        </div>

        {/* タップ誘導テキスト：開封前だけ表示 */}
        {!isOpened && (
          <p className="font-noto text-[12px] text-[#6B5A3A]">
            — タップして蓋を開ける —
          </p>
        )}

        {/* 料理名エリア：開封後だけ表示 */}
        {isOpened && (
          <div
            className="flex flex-col items-center gap-2 transition-opacity duration-700"
            style={{ opacity: isOpened ? 1 : 0 }}
          >
            <p className="font-noto text-[11px] text-accent-spice-orange">
              モロッコ
            </p>
            <p className="font-playfair text-[26px] text-bg-cream">
              Tagine
            </p>
            <p className="font-noto text-[11px] text-[#6B5A3A]">
              — タップしてレシピカードを見る —
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

function ResultScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-bg-cream px-6 py-12">
      <main className="flex flex-col items-center gap-6 w-full max-w-sm">

        {/* ラベル */}
        <p className="font-playfair text-[10px] tracking-widest text-[#9A8060]">
          — 今夜の一皿 —
        </p>

        {/* レシピカード */}
        <div className="w-full bg-white rounded-2xl border border-border-linen overflow-hidden">

          {/* 画像エリア */}
          <div className="w-full h-40 bg-text-dark-brown" />

          {/* カード本文 */}
          <div className="flex flex-col gap-3 p-4">

            {/* バッジ群 */}
            <div className="flex gap-2 flex-wrap">
              <span className="font-noto text-[11px] text-white bg-accent-spice-orange rounded px-2 py-0.5">
                モロッコ
              </span>
              <span className="font-noto text-[11px] text-text-dark-brown bg-[#EDE5D8] border border-border-linen rounded px-2 py-0.5">
                難易度：中級
              </span>
              <span className="font-noto text-[11px] text-text-dark-brown bg-[#EDE5D8] border border-border-linen rounded px-2 py-0.5">
                60分
              </span>
            </div>

            {/* 料理名 */}
            <h2 className="font-playfair text-[22px] text-text-dark-brown">
              Tagine
            </h2>

            {/* 説明文 */}
            <p className="font-noto text-[13px] text-'#6B5A3A' leading-relaxed">
              モロッコの伝統的な土鍋料理。スパイスが香る豊かな煮込み料理で、野菜や肉をじっくりと蒸し煮にします。
            </p>

            {/* ボタン群 */}
            <button className="w-full rounded-lg bg-text-dark-brown py-3 font-noto text-[14px] text-bg-cream transition-opacity hover:opacity-80 cursor-pointer">
              レシピを見る
            </button>
            <button className="w-full rounded-lg border border-border-linen py-3 font-noto text-[14px] text-text-dark-brown transition-opacity hover:opacity-80 cursor-pointer">
              作った！
            </button>

          </div>
        </div>

        {/* もう一度ガチャボタン */}
        <button
          onClick={onRetry}
          className="rounded-pill border border-border-linen px-8 py-3 font-playfair text-[14px] text-[#6B5A3A] transition-opacity hover:opacity-80 cursor-pointer"
        >
          もう一度ガチャを回す
        </button>

      </main>
    </div>
  );
}