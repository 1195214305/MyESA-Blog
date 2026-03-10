import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Tag, FileText, Calendar, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { MarkdownEditor } from "@/components/MarkdownEditor";

interface Post {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    date: string;
    views: number;
    likes: number;
}

const STORAGE_KEY = "blog_posts";

// 从 localStorage 读取文章
function loadPosts(): Post[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    return [];
}

// 保存文章到 localStorage
function savePosts(posts: Post[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export const PostsPage = () => {
    const [posts, setPosts] = useState<Post[]>(loadPosts);
    const [showEditor, setShowEditor] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("技术");
    const [editTags, setEditTags] = useState("");
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // 持久化到 localStorage
    useEffect(() => {
        savePosts(posts);
    }, [posts]);

    const categories = ["全部", ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
    if (!categories.includes("技术")) categories.push("技术");
    if (!categories.includes("前端")) categories.push("前端");
    if (!categories.includes("AI")) categories.push("AI");

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || selectedCategory === "全部" || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSave = (content: string) => {
        if (!editTitle.trim()) return;
        const newPost: Post = {
            id: Date.now(),
            title: editTitle,
            excerpt: content.slice(0, 120).replace(/[#*`>\-\n]/g, " ").trim() + "...",
            content,
            category: editCategory,
            tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
            date: new Date().toISOString().split("T")[0],
            views: 0,
            likes: 0,
        };
        setPosts(prev => [newPost, ...prev]);
        setShowEditor(false);
        setEditTitle("");
        setEditTags("");
    };

    const handleDelete = (id: number) => {
        setPosts(prev => prev.filter(p => p.id !== id));
        setSelectedPost(null);
    };

    return (
        <div className="pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">文稿中心</h1>
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
                        <div className="mb-4 space-y-3">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="文章标题..."
                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-xl font-bold text-white focus:outline-none focus:border-violet-500"
                            />
                            <div className="flex gap-3">
                                <select
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                >
                                    <option value="技术">技术</option>
                                    <option value="前端">前端</option>
                                    <option value="AI">AI</option>
                                    <option value="生活">生活</option>
                                    <option value="项目">项目</option>
                                </select>
                                <input
                                    type="text"
                                    value={editTags}
                                    onChange={(e) => setEditTags(e.target.value)}
                                    placeholder="标签（逗号分隔）"
                                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                                />
                            </div>
                        </div>
                        <MarkdownEditor onSave={handleSave} />
                    </motion.div>
                )}

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
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
                            <p>{posts.length === 0 ? "还没有文章，点击「写文章」发布第一篇吧" : "暂无符合条件的文章"}</p>
                        </div>
                    ) : (
                        filteredPosts.map((post, idx) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <GlassCard
                                    className="p-6 hover:border-violet-500/50 transition-colors cursor-pointer group"
                                    onClick={() => setSelectedPost(post)}
                                >
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
                                                {post.tags.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Tag size={12} />
                                                        {post.tags.slice(0, 3).join(", ")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(post.id);
                                            }}
                                            className="p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            title="删除文章"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Post Detail Modal */}
                {selectedPost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedPost(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-3xl max-h-[85vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedPost.title}</h2>
                                    <p className="text-sm text-slate-400 mt-1">{selectedPost.date} · {selectedPost.category}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="p-2 text-slate-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[65vh] prose prose-invert prose-sm max-w-none">
                                <div className="text-slate-200 whitespace-pre-wrap">{selectedPost.content}</div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Stats */}
                <div className="mt-8 text-center text-sm text-slate-500">
                    共 {filteredPosts.length} 篇文章
                </div>
            </div>
        </div>
    );
};
