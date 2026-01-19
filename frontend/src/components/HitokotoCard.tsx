import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";
import { getHitokoto, type Hitokoto } from "@/services/api";
import { RefreshCw, Quote } from "lucide-react";

export const HitokotoCard = () => {
    const [hitokoto, setHitokoto] = useState<Hitokoto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHitokoto();
    }, []);

    const loadHitokoto = async () => {
        setLoading(true);
        try {
            const data = await getHitokoto();
            setHitokoto(data);
        } catch (error) {
            console.error("Failed to fetch hitokoto:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Quote className="text-cyan-400" size={20} />
                    <h3 className="font-bold text-lg text-white">💬 一言</h3>
                </div>
                <button
                    onClick={loadHitokoto}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/4 mt-4" />
                </div>
            ) : hitokoto ? (
                <motion.div
                    key={hitokoto.hitokoto}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <p className="text-slate-200 leading-relaxed italic">
                        "{hitokoto.hitokoto}"
                    </p>
                    <p className="text-sm text-slate-400 mt-3">
                        —— {hitokoto.from_who || hitokoto.from || '佚名'}
                    </p>
                </motion.div>
            ) : (
                <p className="text-slate-400">加载失败</p>
            )}
        </GlassCard>
    );
};
