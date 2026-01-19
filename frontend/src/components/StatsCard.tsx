import { useEffect, useState } from "react";
import { GlassCard } from "./ui/glass-card";
import { Eye, Users, Clock } from "lucide-react";

// 简单的访问统计（使用 localStorage 模拟，实际应用需要后端）
const STORAGE_KEY = 'blog_visit_stats';

interface VisitStats {
    totalViews: number;
    todayViews: number;
    lastVisitDate: string;
    startDate: string;
}

const getInitialStats = (): VisitStats => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const stats = JSON.parse(stored) as VisitStats;
        const today = new Date().toDateString();
        if (stats.lastVisitDate !== today) {
            // 新的一天，重置今日访问
            stats.todayViews = 1;
            stats.lastVisitDate = today;
        } else {
            stats.todayViews++;
        }
        stats.totalViews++;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
        return stats;
    }

    const newStats: VisitStats = {
        totalViews: 1,
        todayViews: 1,
        lastVisitDate: new Date().toDateString(),
        startDate: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    return newStats;
};

export const StatsCard = () => {
    const [stats, setStats] = useState<VisitStats | null>(null);
    const [runningDays, setRunningDays] = useState(0);

    useEffect(() => {
        const s = getInitialStats();
        setStats(s);

        // 计算运行天数
        const start = new Date(s.startDate);
        const now = new Date();
        const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setRunningDays(days);
    }, []);

    if (!stats) return null;

    return (
        <GlassCard className="p-4">
            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                📊 站点统计
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                    <div className="flex items-center justify-center gap-1 text-violet-400 mb-1">
                        <Eye size={14} />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
                    <p className="text-xs text-slate-400">总访问</p>
                </div>
                <div>
                    <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                        <Users size={14} />
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.todayViews}</p>
                    <p className="text-xs text-slate-400">今日</p>
                </div>
                <div>
                    <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                        <Clock size={14} />
                    </div>
                    <p className="text-2xl font-bold text-white">{runningDays}</p>
                    <p className="text-xs text-slate-400">运行天</p>
                </div>
            </div>
        </GlassCard>
    );
};
