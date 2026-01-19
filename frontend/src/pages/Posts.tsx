import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Tag, FileText, Calendar } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { MarkdownEditor } from "@/components/MarkdownEditor";

// 示例文章数据
const samplePosts = [
    {
        id: 1,
        title: "边缘计算在实时应用中的探索",
        excerpt: "本文探讨如何利用阿里云ESA Pages构建低延迟的边缘应用...",
        category: "技术",
        tags: ["边缘计算", "ESA", "阿里云"],
        date: "2024-01-15",
        views: 234,
        likes: 18,
    },
    {
        id: 2,
        title: "React 19 新特性详解",
        excerpt: "React 19带来了许多令人兴奋的新特性，让我们一起来看看...",
        category: "前端",
        tags: ["React", "JavaScript", "前端"],
        date: "2024-01-10",
        views: 456,
        likes: 32,
    },
    {
        id: 3,
        title: "AI驱动的代码开发实践",
        excerpt: "AI正在改变我们编写代码的方式，本文分享实战经验...",
        category: "AI",
        tags: ["AI", "编程", "效率"],
        date: "2024-01-05",
        views: 789,
        likes: 67,
    },
];

export const PostsPage = () => {
    const [showEditor, setShowEditor] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = ["全部", "技术", "前端", "AI", "生活"];

    const filteredPosts = samplePosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || selectedCategory === "全部" || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSave = (content: string) => {
        console.log("保存文章:", content);
        setShowEditor(false);
        // TODO: 调用后端 API 保存
    };

    return (
        <div className="pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">📝 文稿中心</h1>
                        <p className="text-slate-400">技术文章与生活感悟</p>
                    </div>
                    <button
                        onClick={() => setShowEditor(!showEditor)}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-full hover:bg-violet-400 transition-colors"
                    >
                        <Plus size={18} />
                        写文章
                    </button>
                </div>

                {/* Editor Modal */}
                {showEditor && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="文章标题..."
                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-xl font-bold text-white focus:outline-none focus:border-violet-500"
                            />
                        </div>
                        <MarkdownEditor onSave={handleSave} />
                    </motion.div>
                )}

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜索文章..."
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                        />
                    </div>

                    {/* Categories */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat === "全部" ? null : cat)}
                                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${(cat === "全部" && !selectedCategory) || selectedCategory === cat
                                    ? "bg-violet-500 text-white"
                                    : "bg-white/5 text-slate-400 hover:text-white"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="space-y-4">
                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p>暂无符合条件的文章</p>
                        </div>
                    ) : (
                        filteredPosts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <GlassCard className="p-6 hover:border-violet-500/50 transition-colors cursor-pointer group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded text-xs">
                                                    {post.category}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {post.date}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
                                                {post.title}
                                            </h2>
                                            <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span>👁️ {post.views}</span>
                                                <span>❤️ {post.likes}</span>
                                                <div className="flex items-center gap-1">
                                                    <Tag size={12} />
                                                    {post.tags.slice(0, 3).join(", ")}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-slate-500 group-hover:text-violet-400 transition-colors">
                                            →
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Stats */}
                <div className="mt-8 text-center text-sm text-slate-500">
                    共 {filteredPosts.length} 篇文章
                </div>
            </div>
        </div>
    );
};
