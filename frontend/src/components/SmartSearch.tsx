import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";
import { Search, FileText, Folder, Tag, X, Loader2 } from "lucide-react";

interface SearchResult {
    type: 'post' | 'project' | 'note';
    title: string;
    excerpt: string;
    url: string;
    tags?: string[];
}

// 模拟搜索数据
const mockData: SearchResult[] = [
    { type: 'post', title: '边缘计算入门指南', excerpt: '了解ESA Pages的边缘计算能力...', url: '/posts/1', tags: ['边缘计算', 'ESA'] },
    { type: 'post', title: 'React 19 新特性详解', excerpt: 'React 19带来了许多强大的新功能...', url: '/posts/2', tags: ['React', '前端'] },
    { type: 'project', title: 'EcoLens 智能垃圾分类', excerpt: '基于AI的垃圾分类识别应用', url: '/projects', tags: ['AI', 'Vue'] },
    { type: 'project', title: 'GlobalPing 延迟可视化', excerpt: '全球服务器延迟实时监测', url: '/projects', tags: ['网络', 'D3.js'] },
    { type: 'note', title: '今天学习了Hono框架', excerpt: '比Express更轻量，性能更好', url: '/notes', tags: ['Hono', '后端'] },
];

export const SmartSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const search = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);

        // 模拟搜索延迟
        await new Promise(resolve => setTimeout(resolve, 300));

        // 简单的模糊匹配
        const filtered = mockData.filter(item =>
            item.title.toLowerCase().includes(q.toLowerCase()) ||
            item.excerpt.toLowerCase().includes(q.toLowerCase()) ||
            item.tags?.some(tag => tag.toLowerCase().includes(q.toLowerCase()))
        );

        setResults(filtered);
        setLoading(false);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        search(value);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'post': return <FileText size={14} className="text-blue-400" />;
            case 'project': return <Folder size={14} className="text-green-400" />;
            case 'note': return <Tag size={14} className="text-yellow-400" />;
            default: return <FileText size={14} />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'post': return '文章';
            case 'project': return '项目';
            case 'note': return '手记';
            default: return '内容';
        }
    };

    return (
        <>
            {/* Search Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
                <Search size={14} />
                <span className="text-sm">搜索...</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-xs bg-white/10 rounded">⌘K</kbd>
            </button>

            {/* Search Modal */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div
                        initial={{ scale: 0.95, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="relative w-full max-w-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <GlassCard className="overflow-hidden">
                            {/* Search Input */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                                <Search size={18} className="text-slate-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={handleSearch}
                                    placeholder="搜索文章、项目、手记..."
                                    className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                                    autoFocus
                                />
                                {loading && <Loader2 size={18} className="text-violet-400 animate-spin" />}
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Results */}
                            <div className="max-h-[400px] overflow-y-auto">
                                {results.length > 0 ? (
                                    <div className="p-2">
                                        {results.map((result, idx) => (
                                            <a
                                                key={idx}
                                                href={result.url}
                                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <div className="mt-0.5">{getTypeIcon(result.type)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-white">{result.title}</span>
                                                        <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded text-slate-400">
                                                            {getTypeLabel(result.type)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-400 truncate mt-0.5">{result.excerpt}</p>
                                                    {result.tags && (
                                                        <div className="flex gap-1 mt-1">
                                                            {result.tags.slice(0, 3).map(tag => (
                                                                <span key={tag} className="text-xs px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : query ? (
                                    <div className="p-8 text-center text-slate-400">
                                        没有找到匹配的内容
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        <Search size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>输入关键词开始搜索</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-slate-500">
                                <span>按 ESC 关闭</span>
                                <span>↑↓ 导航 · Enter 跳转</span>
                            </div>
                        </GlassCard>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
};
