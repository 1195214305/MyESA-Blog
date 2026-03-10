import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Heart, Calendar, Plus, X, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface Note {
    id: number;
    title: string;
    content: string;
    date: string;
    likes: number;
}

const STORAGE_KEY = "blog_notes";

function loadNotes(): Note[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    return [];
}

function saveNotes(notes: Note[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export const NotesPage = () => {
    const [notes, setNotes] = useState<Note[]>(loadNotes);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newNote, setNewNote] = useState({ title: "", content: "" });

    useEffect(() => {
        saveNotes(notes);
    }, [notes]);

    const handleLike = (id: number) => {
        setNotes((prev) =>
            prev.map((note) =>
                note.id === id ? { ...note, likes: note.likes + 1 } : note
            )
        );
    };

    const handleAddNote = () => {
        if (!newNote.title.trim() || !newNote.content.trim()) return;
        const note: Note = {
            id: Date.now(),
            title: newNote.title,
            content: newNote.content,
            date: new Date().toISOString().split("T")[0],
            likes: 0,
        };
        setNotes((prev) => [note, ...prev]);
        setNewNote({ title: "", content: "" });
        setIsEditing(false);
    };

    const handleDelete = (id: number) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setSelectedNote(null);
    };

    return (
        <div className="pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
                            <PenTool className="text-orange-400" /> 手记
                        </h1>
                        <p className="text-slate-400">记录灵感、思考与日常</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-300 rounded-full hover:bg-orange-500/30 transition-colors"
                    >
                        <Plus size={16} />
                        新建手记
                    </button>
                </div>

                {/* New Note Editor */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <GlassCard className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-white">写点什么</h3>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="text-slate-400 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={newNote.title}
                                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                    placeholder="标题..."
                                    className="w-full px-4 py-2 mb-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500"
                                />
                                <textarea
                                    value={newNote.content}
                                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                    placeholder="写下你的想法..."
                                    rows={4}
                                    className="w-full px-4 py-2 mb-3 bg-slate-800 border border-white/10 rounded-lg text-white resize-none focus:outline-none focus:border-orange-500"
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNote.title.trim() || !newNote.content.trim()}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    发布
                                </button>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notes List */}
                <div className="space-y-4">
                    {notes.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <PenTool size={48} className="mx-auto mb-4 opacity-50" />
                            <p>还没有手记，点击「新建手记」记录你的第一个想法吧</p>
                        </div>
                    ) : (
                        notes.map((note, idx) => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <GlassCard
                                    className="p-6 cursor-pointer hover:border-orange-500/50 transition-colors group"
                                    onClick={() => setSelectedNote(note)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-lg text-white">{note.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center gap-1 text-sm text-slate-400">
                                                <Calendar size={14} />
                                                {note.date}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(note.id);
                                                }}
                                                className="p-1 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                title="删除手记"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-slate-400 line-clamp-2 mb-4">{note.content}</p>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLike(note.id);
                                            }}
                                            className="flex items-center gap-1 text-sm text-pink-400 hover:text-pink-300 transition-colors"
                                        >
                                            <Heart size={16} fill="currentColor" />
                                            {note.likes}
                                        </button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Note Detail Modal */}
                <AnimatePresence>
                    {selectedNote && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedNote(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-white/10">
                                    <h2 className="text-2xl font-bold text-white">{selectedNote.title}</h2>
                                    <button
                                        onClick={() => setSelectedNote(null)}
                                        className="p-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-slate-400 mb-4">{selectedNote.date}</p>
                                    <p className="text-slate-200 whitespace-pre-wrap">{selectedNote.content}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
