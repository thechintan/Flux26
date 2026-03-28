import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function PriceSuggestion({ mainCategory, subCategory, quantityKg, onApplyPrice }) {
    const [price, setPrice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const canPredict = mainCategory && subCategory && quantityKg && Number(quantityKg) > 0;

    const fetchPrice = async () => {
        if (!canPredict) return;
        setLoading(true); setError(null); setPrice(null);
        try {
            // Call Flask ML API directly (port 8000) — bypasses Node proxy
            const res = await fetch("http://localhost:8000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    main_category: mainCategory,
                    sub_category: subCategory,
                    quantity_kg: Number(quantityKg),
                }),
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setPrice(data.predicted_price_per_kg);
            }
        } catch {
            setError("ML model unavailable");
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when all fields are filled
    useEffect(() => {
        if (canPredict) {
            const timer = setTimeout(fetchPrice, 800);
            return () => clearTimeout(timer);
        } else {
            setPrice(null);
        }
    }, [mainCategory, subCategory, quantityKg]);

    if (!canPredict && !price) return null;

    return (
        <div className="mt-3 p-3 rounded-xl border border-primary-200 dark:border-primary-800/50 bg-primary-50/50 dark:bg-primary-900/10 transition-all">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${price ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-primary-100 dark:bg-primary-800/30 text-primary-600'}`}>
                        <Sparkles size={16} />
                    </div>
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wide">AI analyzing market...</span>
                        </div>
                    ) : price ? (
                        <div className="min-w-0">
                            <p className="text-[10px] font-extrabold text-primary-700 dark:text-primary-400 uppercase tracking-widest leading-none mb-1">AI Market Price</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400 leading-none">₹{price} <span className="text-xs text-slate-500 font-normal">/ KG</span></p>
                        </div>
                    ) : error ? (
                        <span className="text-xs font-medium text-red-500">{error}</span>
                    ) : (
                        <span className="text-xs font-medium text-slate-400">Fill all fields for AI prediction</span>
                    )}
                </div>
                {price && (
                    <button 
                        type="button"
                        onClick={() => onApplyPrice && onApplyPrice(price)}
                        className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0 shadow-sm"
                    >
                        Apply ₹{price}
                    </button>
                )}
            </div>
        </div>
    );
}