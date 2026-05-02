import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Mystery Cookデザインシステム
                // bg
                "bg-cream": "#F5F0E8",
                // text
                "text-dark-brown": "#2C1A0E",
                // accent
                "accent-spice-orange": "#B85C2A",
                // sub
                "sub-herb-green": "#6B8C5A",
                // border
                "border-linen": "#D4C5A9",
            },
            fontFamily: {
                // 見出し・英字（日本語には効かない）
                playfair: ["var(--font-playfair)", "serif"],
                // 本文・日本語全般
                noto: ["var(--font-noto)", "sans-serif"],
            },
            borderRadius: {
                // ボタン角丸（ガチャボタン・もう一度ボタン）
                "pill": "50px",
            },
        },
    },
    plugins: [],
};

export default config;