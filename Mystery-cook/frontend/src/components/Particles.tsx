"use client";

import { useEffect, useRef } from "react";

type Particle = {
    x: number;
    y: number;
    vx: number; // x方向の速度
    vy: number; // y方向の速度
    alpha: number; // 透明度
    radius: number;
    color: string;
};

const COLORS = ["#D4C5A9", "#B85C2A", "#F5E8C8", "#6B8C5A", "#E0CCA8"];

type Props = {
    trigger: boolean; // trueになった瞬間にパーティクルを発生させる
};

export default function Particles({ trigger }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        if (!trigger) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // パーティクルを中央から30個生成
        particlesRef.current = Array.from({ length: 30 }, () => ({
            x: canvas.width / 2,
            y: canvas.height / 2,
            // ランダムな方向に飛び散る
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            alpha: 1,
            radius: Math.random() * 4 + 2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        }));

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0.01);

            particlesRef.current.forEach((p) => {
                // 重力を加える
                p.vy += 0.2;
                p.x += p.vx;
                p.y += p.vy;
                // フレームごとに透明にしていく
                p.alpha -= 0.02;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle =
                    p.color +
                    Math.floor(p.alpha * 255)
                        .toString(16)
                        .padStart(2, "0");
                ctx.fill();
            });

            if (particlesRef.current.length > 0) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        // クリーンアップ：コンポーネントが消えたらアニメーションを止める
        return () => cancelAnimationFrame(animationRef.current);
    }, [trigger]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={300}
            // ポインターイベントを無効化：クローシュのタップを邪魔しない
            className="absolute pointer-events-none"
        />
    );
}