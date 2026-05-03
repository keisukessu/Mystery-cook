type Props = {
    dish: {
        name: string;
        ingredients: string[];
        steps: string[];
    };
    onClose: () => void;
};

export default function RecipeModal({ dish, onClose }: Props) {
    return (
        <>
            {/* 背景オーバーレイ：タップで閉じる */}
            <div
                className="fixed inset-0 bg-black/60 z-40"
                onClick={onClose}
            />

            {/* モーダル本体 */}
            <div className="fixed inset-x-4 top-12 bottom-12 z-50 bg-bg-cream rounded-2xl overflow-y-auto">
                <div className="flex flex-col gap-6 p-6">

                    {/* ヘッダー */}
                    <div className="flex items-center justify-between">
                        <p className="font-playfair text-[10px] tracking-widest text-[#9A8060]">
                            — Recipe —
                        </p>
                        <button
                            onClick={onClose}
                            className="font-noto text-[13px] text-[#9A8060] cursor-pointer"
                        >
                            閉じる
                        </button>
                    </div>

                    {/* 料理名 */}
                    <h2 className="font-playfair text-[22px] text-text-dark-brown">
                        {dish.name}
                    </h2>

                    {/* 材料 */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-noto text-[13px] font-bold text-text-dark-brown border-b border-border-linen pb-2">
                            材料
                        </h3>
                        <ul className="flex flex-col gap-2">
                            {dish.ingredients.map((ingredient, i) => (
                                <li key={i} className="flex items-start gap-2 font-noto text-[13px] text-[#000000]">
                                    <span style={{ color: "#B85C2A" }}>·</span>
                                    {ingredient}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 手順 */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-noto text-[13px] font-bold text-text-dark-brown border-b border-border-linen pb-2">
                            手順
                        </h3>
                        <ol className="flex flex-col gap-4">
                            {dish.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="font-playfair text-[16px] text-accent-spice-orange shrink-0">
                                        {i + 1}
                                    </span>
                                    <p className="font-noto text-[13px] text-[#000000] leading-relaxed">
                                        {step}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>

                </div>
            </div>
        </>
    );
}