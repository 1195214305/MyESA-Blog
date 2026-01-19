import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./ui/glass-card";
import { MessageCircle, Send, User, Clock, ThumbsUp, Reply } from "lucide-react";

interface Comment {
    id: string;
    author: string;
    content: string;
    createdAt: string;
    likes: number;
    replies?: Comment[];
}

interface CommentSectionProps {
    postId: string;
    onCommentCountChange?: (count: number) => void;
}

// API 基础URL - 后端对接
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const CommentSection = ({ postId, onCommentCountChange }: CommentSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState(() => localStorage.getItem('comment_author') || '');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<string | null>(null);

    // 获取评论
    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/comments/${postId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
                onCommentCountChange?.(data.length);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            // 使用模拟数据
            setComments([
                {
                    id: '1',
                    author: '访客用户',
                    content: '这篇文章写得很好，学到了很多！',
                    createdAt: new Date().toISOString(),
                    likes: 5,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const submitComment = async () => {
        if (!newComment.trim() || !authorName.trim()) return;

        setSubmitting(true);
        localStorage.setItem('comment_author', authorName);

        try {
            const res = await fetch(`${API_BASE}/api/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId,
                    author: authorName,
                    content: newComment,
                    parentId: replyTo,
                }),
            });

            if (res.ok) {
                fetchComments();
                setNewComment('');
                setReplyTo(null);
            }
        } catch (error) {
            // 本地添加
            const newItem: Comment = {
                id: Date.now().toString(),
                author: authorName,
                content: newComment,
                createdAt: new Date().toISOString(),
                likes: 0,
            };
            setComments([newItem, ...comments]);
            setNewComment('');
            setReplyTo(null);
        } finally {
            setSubmitting(false);
        }
    };

    const likeComment = async (commentId: string) => {
        setComments(comments.map(c =>
            c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        ));
        // 同步到后端
        try {
            await fetch(`${API_BASE}/api/comments/${commentId}/like`, { method: 'POST' });
        } catch (error) {
            console.error('Failed to like comment');
        }
    };

    return (
        <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="text-violet-400" size={20} />
                <h3 className="font-bold text-lg text-white">评论区</h3>
                <span className="text-sm text-slate-400">({comments.length})</span>
            </div>

            {/* Comment Form */}
            <div className="mb-6 space-y-3">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                        <User size={20} className="text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="你的昵称"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                        />
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyTo ? "回复评论..." : "写下你的评论..."}
                            rows={3}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white resize-none focus:outline-none focus:border-violet-500"
                        />
                        <div className="flex justify-between items-center">
                            {replyTo && (
                                <button
                                    onClick={() => setReplyTo(null)}
                                    className="text-xs text-slate-400 hover:text-white"
                                >
                                    取消回复
                                </button>
                            )}
                            <button
                                onClick={submitComment}
                                disabled={submitting || !newComment.trim() || !authorName.trim()}
                                className="flex items-center gap-1.5 px-4 py-2 bg-violet-500 text-white rounded-lg text-sm hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                            >
                                <Send size={14} />
                                {submitting ? '发送中...' : '发送'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        暂无评论，来说点什么吧~
                    </div>
                ) : (
                    <AnimatePresence>
                        {comments.map((comment, idx) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex gap-3 p-3 bg-white/5 rounded-lg"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                    {comment.author.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-white">{comment.author}</span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-2">{comment.content}</p>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => likeComment(comment.id)}
                                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-400 transition-colors"
                                        >
                                            <ThumbsUp size={12} /> {comment.likes}
                                        </button>
                                        <button
                                            onClick={() => setReplyTo(comment.id)}
                                            className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-400 transition-colors"
                                        >
                                            <Reply size={12} /> 回复
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </GlassCard>
    );
};
