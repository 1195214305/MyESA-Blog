import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";
import { FileText, PenTool, ArrowRight, Clock, Eye } from "lucide-react";

interface Article {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    views: number;
    type: 'post' | 'note';
}

// 模拟数据 - 后续从后端获取
const mockArticles: Article[] = [
    {
        id: '1',
        title: '边缘计算在实时应用中的探索',
        excerpt: '本文探讨如何利用阿里云ESA Pages构建低延迟的边缘应用...',
        date: '2024-01-15',
        views: 234,
        type: 'post',
    },
    {
        id: '2',
        title: 'React 19 新特性一览',
        excerpt: 'React 19带来了许多激动人心的新特性...',
        date: '2024-01-14',
        views: 156,
        type: 'post',
    },
];

const mockNotes: Article[] = [
    {
        id: '1',
        title: '今天学习了Hono框架，感觉比Express轻量很多',
        excerpt: '',
        date: '2024-01-15',
        views: 45,
        type: 'note',
    },
    {
        id: '2',
        title: 'Turso数据库真的很适合边缘场景',
        excerpt: '',
        date: '2024-01-14',
        views: 32,
        type: 'note',
    },
];

export const LatestContent = () => {
    const [articles] = useState(mockArticles);
    const [notes] = useState(mockNotes);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Latest Posts */}
            <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FileText className="text-blue-400" size={18} />
                        <span className="font-bold text-white">最新文章</span>
                    </div>
                    <a href="/posts" className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition-colors">
                        查看全部 <ArrowRight size={12} />
                    </a>
                </div>

                <div className="space-y-3">
                    {articles.slice(0, 3).map((article, idx) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                                {article.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Clock size={10} /> {article.date}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye size={10} /> {article.views}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>

            {/* Latest Notes */}
            <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <PenTool className="text-green-400" size={18} />
                        <span className="font-bold text-white">最新手记</span>
                    </div>
                    <a href="/notes" className="flex items-center gap-1 text-xs text-slate-400 hover:text-green-400 transition-colors">
                        查看全部 <ArrowRight size={12} />
                    </a>
                </div>

                <div className="space-y-3">
                    {notes.slice(0, 3).map((note, idx) => (
                        <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <p className="text-sm text-white group-hover:text-green-300 transition-colors line-clamp-2">
                                {note.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Clock size={10} /> {note.date}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};
