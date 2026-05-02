import type { Metadata } from "next";
import { Playfair_Display, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

// 見出し・英字用（日本語テキストには自動的に効かない）
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

// 本文・日本語全般
// weight指定が必要な理由：Noto Sans JPは可変フォントに非対応のため
const noto = Noto_Sans_JP({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Mystery Cook",
  description: "世界の謎の一皿と出会う料理ガチャ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${playfair.variable} ${noto.variable} h-full antialiased`}
    >
      {/* font-noto をベースフォントに設定 */}
      <body className="min-h-full flex flex-col font-noto">{children}</body>
    </html>
  );
}