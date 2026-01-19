import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { BookOpen, Send, Clock, MessageSquare } from "lucide-react";

interface GuestbookEntry {
    id: string;
    author: string;
    content: string;
    avatar?: string;
    createdAt: string;
    emoji?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const emojis = ['😊', '🎉', '👍', '❤️', '🔥', '✨', '🚀', '💡', '🌟', '💪'];

export const Guestbook = () => {
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [authorName, setAuthorName] = useState(() => localStorage.getItem('guestbook_author') || '');
    const [selectedEmoji, setSelectedEmoji] = useState('😊');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/guestbook`);
            if (res.ok) {
                const data = await res.json();
                setEntries(data);
            }
        } catch (error) {
            console.error('Failed to fetch guestbook:', error);
            // 模拟数据
            setEntries([
                {
                    id: '1',
                    author: '小明',
                    content: '博客设计得很漂亮，继续加油！',
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    emoji: '🎉',
                },
                {
                    id: '2',
                    author: '技术爱好者',
                    content: '学到了很多边缘计算的知识，感谢分享！',
                    createdAt: new Date(Date.now() - 172800000).toISOString(),
                    emoji: '💡',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const submitEntry = async () => {
        if (!newMessage.trim() || !authorName.trim()) return;

        setSubmitting(true);
        localStorage.setItem('guestbook_author', authorName);

        try {
            const res = await fetch(`${API_BASE}/api/guestbook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author: authorName,
                    content: newMessage,
                    emoji: selectedEmoji,
                }),
            });

            if (res.ok) {
                fetchEntries();
                setNewMessage('');
            }
        } catch (error) {
            // 本地添加
            const newEntry: GuestbookEntry = {
                id: Date.now().toString(),
                author: authorName,
                content: newMessage,
                createdAt: new Date().toISOString(),
                emoji: selectedEmoji,
            };
            setEntries([newEntry, ...entries]);
            setNewMessage('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 font-kaiti">📖 留言板</h1>
                    <p className="text-slate-400">欢迎留下你的足迹~</p>
                </div>

                {/* Leave Message Form */}
                <GlassCard className="p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="text-violet-400" size={20} />
                        <h3 className="font-bold text-white">写下你的留言</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                placeholder="你的昵称"
                                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500"
                            />
                            <div className="relative">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-2xl hover:bg-white/10 transition-colors"
                                >
                                    {selectedEmoji}
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute top-full right-0 mt-2 p-2 bg-slate-800 rounded-lg border border-white/10 flex gap-1 flex-wrap w-[200px] z-10">
                                        {emojis.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => {
                                                    setSelectedEmoji(emoji);
                                                    setShowEmojiPicker(false);
                                                }}
                                                className="text-2xl p-1 hover:bg-white/10 rounded transition-colors"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="说点什么吧..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none focus:outline-none focus:border-violet-500"
                        />
                        <button
                            onClick={submitEntry}
                            disabled={submitting || !newMessage.trim() || !authorName.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={16} />
                            {submitting ? '发送中...' : '留言'}
                        </button>
                    </div>
                </GlassCard>

                {/* Entries List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                            <p>还没有留言，来做第一个吧~</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {entries.map((entry, idx) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <GlassCard className="p-4">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl">
                                                {entry.emoji || '😊'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-white">{entry.author}</span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {new Date(entry.createdAt).toLocaleDateString('zh-CN')}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300">{entry.content}</p>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};
