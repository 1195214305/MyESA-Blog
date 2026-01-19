import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";
import { Shuffle, ArrowRight, Clock, Eye } from "lucide-react";

// 模拟文章数据
const mockPosts = [
    { id: '1', title: '边缘计算在实时应用中的探索', date: '2024-01-15', views: 234 },
    { id: '2', title: 'React 19 新特性一览', date: '2024-01-14', views: 156 },
    { id: '3', title: '使用 Hono 构建轻量级后端', date: '2024-01-13', views: 189 },
    { id: '4', title: 'Turso 边缘数据库实践', date: '2024-01-12', views: 123 },
    { id: '5', title: 'TypeScript 高级类型技巧', date: '2024-01-11', views: 267 },
];

export const RandomArticle = () => {
    const [article, setArticle] = useState(mockPosts[0]);
    const [isSpinning, setIsSpinning] = useState(false);

    const getRandomArticle = () => {
        setIsSpinning(true);

        // 动画效果
        let count = 0;
        const interval = setInterval(() => {
            const randomIdx = Math.floor(Math.random() * mockPosts.length);
            setArticle(mockPosts[randomIdx]);
            count++;
            if (count > 8) {
                clearInterval(interval);
                setIsSpinning(false);
            }
        }, 100);
    };

    return (
        <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Shuffle className="text-pink-400" size={18} />
                    <span className="font-bold text-white">随机一文</span>
                </div>
                <button
                    onClick={getRandomArticle}
                    disabled={isSpinning}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-lg hover:bg-pink-500/30 transition-colors disabled:opacity-50"
                >
                    <Shuffle size={12} className={isSpinning ? 'animate-spin' : ''} />
                    换一篇
                </button>
            </div>

            <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
                <h4 className="font-medium text-white mb-2 line-clamp-2">{article.title}</h4>
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <Clock size={10} /> {article.date}
                    </span>
                    <span className="flex items-center gap-1">
                        <Eye size={10} /> {article.views}
                    </span>
                </div>
            </motion.div>

            <a
                href={`/posts/${article.id}`}
                className="flex items-center justify-center gap-1 mt-3 py-2 text-sm text-pink-400 hover:text-pink-300 transition-colors"
            >
                阅读文章 <ArrowRight size={14} />
            </a>
        </GlassCard>
    );
};
