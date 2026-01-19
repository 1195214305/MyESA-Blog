import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";
import { Star, GitFork, Package, TrendingUp } from "lucide-react";
import { fetchGitHubRepos, type GitHubRepo } from "@/services/api";

interface GitHubStats {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    topLanguages: { name: string; count: number }[];
}

export const GitHubStatsCard = () => {
    const [stats, setStats] = useState<GitHubStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const repos = await fetchGitHubRepos();

            // 计算统计数据
            let totalStars = 0;
            let totalForks = 0;
            const languageCount: Record<string, number> = {};

            repos.forEach((repo: GitHubRepo) => {
                totalStars += repo.stargazers_count;
                totalForks += repo.forks_count;
                if (repo.language) {
                    languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
                }
            });

            const topLanguages = Object.entries(languageCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => ({ name, count }));

            setStats({
                totalRepos: repos.length,
                totalStars,
                totalForks,
                topLanguages,
            });
        } catch (error) {
            console.error('Failed to fetch GitHub stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-green-400" size={18} />
                    <span className="font-bold text-white">GitHub 统计</span>
                </div>
                <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-green-400" size={18} />
                <span className="font-bold text-white">GitHub 统计</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center p-2 bg-white/5 rounded-lg"
                >
                    <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                        <Star size={14} />
                        <span className="text-lg font-bold">{stats?.totalStars || 0}</span>
                    </div>
                    <div className="text-xs text-slate-500">Stars</div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center p-2 bg-white/5 rounded-lg"
                >
                    <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                        <GitFork size={14} />
                        <span className="text-lg font-bold">{stats?.totalForks || 0}</span>
                    </div>
                    <div className="text-xs text-slate-500">Forks</div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center p-2 bg-white/5 rounded-lg"
                >
                    <div className="flex items-center justify-center gap-1 text-violet-400 mb-1">
                        <Package size={14} />
                        <span className="text-lg font-bold">{stats?.totalRepos || 0}</span>
                    </div>
                    <div className="text-xs text-slate-500">Repos</div>
                </motion.div>
            </div>

            {/* Top Languages */}
            {stats?.topLanguages && stats.topLanguages.length > 0 && (
                <div>
                    <div className="text-xs text-slate-500 mb-2">常用语言</div>
                    <div className="flex flex-wrap gap-1.5">
                        {stats.topLanguages.map((lang) => (
                            <span
                                key={lang.name}
                                className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-slate-300"
                            >
                                {lang.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </GlassCard>
    );
};
