import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "./ui/glass-card";
import { Target, Plus, Check, Trash2 } from "lucide-react";

interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}

export const TodoCard = () => {
    const [todos, setTodos] = useState<TodoItem[]>(() => {
        const saved = localStorage.getItem('blog_todos');
        return saved ? JSON.parse(saved) : [
            { id: '1', text: '完成博客功能开发', completed: false },
            { id: '2', text: '写一篇技术文章', completed: false },
        ];
    });
    const [newTodo, setNewTodo] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        localStorage.setItem('blog_todos', JSON.stringify(todos));
    }, [todos]);

    const addTodo = () => {
        if (newTodo.trim()) {
            setTodos([...todos, {
                id: Date.now().toString(),
                text: newTodo.trim(),
                completed: false,
            }]);
            setNewTodo('');
            setIsAdding(false);
        }
    };

    const toggleTodo = (id: string) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    const completedCount = todos.filter(t => t.completed).length;
    const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

    return (
        <GlassCard className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target className="text-orange-400" size={18} />
                    <span className="font-bold text-slate-900 dark:text-white">今日目标</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {completedCount}/{todos.length} 已完成
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"
                />
            </div>

            {/* Todo List */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <AnimatePresence>
                    {todos.map((todo) => (
                        <motion.div
                            key={todo.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${todo.completed ? 'bg-green-500/10' : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10'
                                }`}
                        >
                            <button
                                onClick={() => toggleTodo(todo.id)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${todo.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-slate-500 hover:border-green-400'
                                    }`}
                            >
                                {todo.completed && <Check size={12} className="text-white" />}
                            </button>
                            <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                                }`}>
                                {todo.text}
                            </span>
                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="p-1 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add Todo */}
            {isAdding ? (
                <div className="flex gap-2 mt-3">
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                        placeholder="输入新目标..."
                        className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                        autoFocus
                    />
                    <button
                        onClick={addTodo}
                        className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-400"
                    >
                        添加
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-1.5 mt-3 text-sm text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                    <Plus size={14} />
                    添加目标
                </button>
            )}
        </GlassCard>
    );
};
