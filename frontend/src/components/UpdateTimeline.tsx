import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchGitHubEvents, formatGitHubEvent, type GitHubEvent } from "@/services/api";
import { GlassCard } from "./ui/glass-card";
import { RefreshCw } from "lucide-react";

export const UpdateTimeline = () => {
    const [events, setEvents] = useState<GitHubEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const data = await fetchGitHubEvents('1195214305', 10);
            setEvents(data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-white">📝 更新记录</h3>
                <button
                    onClick={loadEvents}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                    title="刷新"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-start gap-3 animate-pulse">
                            <div className="w-8 h-8 bg-white/10 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-white/10 rounded w-3/4" />
                                <div className="h-3 bg-white/10 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <p className="text-center text-slate-400 py-4">暂无更新记录</p>
            ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {events.map((event, idx) => {
                        const formatted = formatGitHubEvent(event);
                        return (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-start gap-3"
                            >
                                <div className="p-2 rounded-lg bg-white/5 text-lg">
                                    {formatted.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{formatted.text}</p>
                                    <p className="text-xs text-slate-500">{formatted.time}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </GlassCard>
    );
};
