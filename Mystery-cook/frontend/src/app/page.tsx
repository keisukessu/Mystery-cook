import Cloche from "@/components/Cloche";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-bg-cream px-6">
      <main className="flex flex-col items-center gap-6 w-full max-w-sm text-center">

        {/* ラベル */}
        <p className="font-playfair text-[11px] tracking-widest text-[#9A8060]">
          — Chef&apos;s Table —
        </p>

        {/* 横線 */}
        <div className="w-12 border-t border-border-linen" />

        {/* キャッチコピー：「謎」だけアクセントカラー */}
        <h1 className="font-noto text-[30px] font-bold leading-tight text-text-dark-brown whitespace-nowrap">
          世界の<span className="text-accent-spice-orange">謎</span>の一皿と出会う
        </h1>

        {/* クローシュコンポーネント */}
        <Cloche />

        {/* サブテキスト */}
        <p className="font-noto text-[13px] text-[#6B5A3A]">
          世界の料理がランダムで1つ表示されます。
        </p>

        {/* 横線 */}
        <div className="w-12 border-t border-border-linen" />

        {/* ガチャボタン */}
        <button className="w-full rounded-pill bg-text-dark-brown px-8 py-3 font-noto text-[16px] text-bg-cream transition-opacity hover:opacity-80 cursor-pointer">
          ガチャを回す
        </button>

        {/* 横線 */}
        <div className="w-12 border-t border-border-linen" />

        {/* フッターラベル */}
        <p className="font-playfair text-[11px] tracking-widest text-[#9A8060]">
          Mystery Cook
        </p>

      </main>
    </div>
  );
}