type Props = {
    isOpened: boolean;
};

export default function Cloche({ isOpened }: Props) {
    return (
        <svg
            width="160"
            height="120"
            viewBox="0 0 160 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* 皿のベース：常に固定 */}
            <ellipse cx="80" cy="98" rx="72" ry="8" fill="#A0A0A0" />
            <rect x="8" y="90" width="144" height="10" rx="5" fill="#C0C0C0" />

            {/* ドーム・ハイライト・取っ手：isOpenedでリフトアップ */}
            <g
                style={{
                    transform: isOpened ? "translateY(-60px)" : "translateY(0px)",
                    transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    // cubic-bezier(0.34, 1.56, 0.64, 1)：
                    // 少しオーバーシュートして戻るバネのような動き
                }}
            >
                {/* ドーム部分 */}
                <path
                    d="M 80 20 
             C 30 20, 10 55, 8 90 
             L 152 90 
             C 150 55, 130 20, 80 20 Z"
                    fill="#C8C8C8"
                />

                {/* ドームのハイライト（立体感） */}
                <path
                    d="M 80 28
             C 50 28, 30 55, 25 82"
                    stroke="#E8E8E8"
                    strokeWidth="3"
                    strokeLinecap="round"
                />

                {/* 取っ手 */}
                <ellipse cx="80" cy="20" rx="10" ry="5" fill="#A0A0A0" />
                <rect x="76" y="10" width="8" height="12" rx="4" fill="#B0B0B0" />
            </g>
        </svg>
    );
}