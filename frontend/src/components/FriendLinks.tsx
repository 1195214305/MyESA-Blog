import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";
import { Plus, X, ExternalLink, Edit2, Save, Link2 } from "lucide-react";

interface FriendLink {
    id: string;
    name: string;
    url: string;
    description: string;
}

// 默认友链
const defaultLinks: FriendLink[] = [
    { id: '1', name: '阿里云 ESA', url: 'https://www.aliyun.com/product/esa', description: '边缘安全加速' },
    { id: '2', name: 'GitHub', url: 'https://github.com', description: '代码托管平台' },
];

export const FriendLinks = () => {
    const [links, setLinks] = useState<FriendLink[]>(defaultLinks);
    const [isEditing, setIsEditing] = useState(false);
    const [newLink, setNewLink] = useState({ name: '', url: '', description: '' });

    const handleAddLink = () => {
        if (!newLink.name || !newLink.url) return;
        setLinks([...links, { ...newLink, id: Date.now().toString() }]);
        setNewLink({ name: '', url: '', description: '' });
    };

    const handleRemoveLink = (id: string) => {
        setLinks(links.filter(l => l.id !== id));
    };

    return (
        <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white flex items-center gap-2">
                    <Link2 size={16} className="text-violet-400" />
                    🔗 友情链接
                </h3>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                    {isEditing ? <Save size={14} /> : <Edit2 size={14} />}
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {links.map((link) => (
                    <motion.div
                        key={link.id}
                        layout
                        className="relative group"
                    >
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-sm text-slate-300 hover:text-white transition-colors"
                            title={link.description}
                        >
                            {link.name}
                            <ExternalLink size={12} />
                        </a>
                        {isEditing && (
                            <button
                                onClick={() => handleRemoveLink(link.id)}
                                className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={10} />
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>

            {isEditing && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-white/10 space-y-2"
                >
                    <input
                        type="text"
                        value={newLink.name}
                        onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                        placeholder="名称"
                        className="w-full px-3 py-1.5 bg-slate-800 border border-white/10 rounded text-sm text-white"
                    />
                    <input
                        type="url"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        placeholder="URL"
                        className="w-full px-3 py-1.5 bg-slate-800 border border-white/10 rounded text-sm text-white"
                    />
                    <button
                        onClick={handleAddLink}
                        className="w-full py-1.5 bg-violet-500/20 text-violet-300 rounded text-sm hover:bg-violet-500/30 flex items-center justify-center gap-1"
                    >
                        <Plus size={14} /> 添加
                    </button>
                </motion.div>
            )}
        </GlassCard>
    );
};
