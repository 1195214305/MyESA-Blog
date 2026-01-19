import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, Check } from "lucide-react";
import { useThemeStore } from "@/store";

// 背景主题配置
const BACKGROUNDS = [
    { id: 'space', name: '深空星云', preview: '/assets/images/bg-dark.png', theme: 'dark' },
    { id: 'aurora', name: '极光之夜', preview: '/assets/images/bg-aurora.png', theme: 'dark' },
    { id: 'cyberpunk', name: '赛博朋克', preview: '/assets/images/bg-cyberpunk.png', theme: 'dark' },
    { id: 'light', name: '柔和渐变', preview: '/assets/images/bg-light.png', theme: 'light' },
    { id: 'warm', name: '暖阳之光', preview: '/assets/images/bg-warm.png', theme: 'light' },
    { id: 'sunset', name: '海洋日落', preview: '/assets/images/bg-sunset.png', theme: 'light' },
    { id: 'minimal', name: '极简纯色', preview: null, theme: 'auto' },
];

export const ThemeSelector = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, background, setBackground, toggleTheme } = useThemeStore();

    const handleSelectBackground = (bgId: string) => {
        const bg = BACKGROUNDS.find(b => b.id === bgId);
        if (bg) {
            setBackground(bgId as any);
            // 自动切换主题
            if (bg.theme === 'dark' && theme === 'light') {
                toggleTheme();
            } else if (bg.theme === 'light' && theme === 'dark') {
                toggleTheme();
            }
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-full text-slate-400 hover:text-white transition-colors"
                title="选择主题背景"
            >
                <Palette size={18} />
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900/95 rounded-2xl border border-white/10 w-full max-w-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                    <Palette className="text-violet-400" />
                                    选择主题背景
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Background Grid */}
                            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                                {BACKGROUNDS.map((bg) => (
                                    <div
                                        key={bg.id}
                                        onClick={() => handleSelectBackground(bg.id)}
                                        className={`relative rounded-xl overflow-hidden cursor-pointer group transition-all ${background === bg.id
                                                ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-900'
                                                : 'hover:ring-2 hover:ring-white/30'
                                            }`}
                                    >
                                        {/* Preview Image or Gradient */}
                                        <div
                                            className={`aspect-video ${bg.id === 'minimal'
                                                    ? 'bg-gradient-to-br from-slate-800 to-slate-900'
                                                    : ''
                                                }`}
                                            style={bg.preview ? {
                                                backgroundImage: `url(${bg.preview})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            } : undefined}
                                        >
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

                                            {/* Selected Checkmark */}
                                            {background === bg.id && (
                                                <div className="absolute top-2 right-2 p-1 bg-violet-500 rounded-full">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Label */}
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-sm font-medium text-white">{bg.name}</p>
                                            <p className="text-xs text-slate-300">
                                                {bg.theme === 'dark' ? '深色' : bg.theme === 'light' ? '浅色' : '自动'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-white/10 text-center text-sm text-slate-400">
                                选择背景后会自动调整配色主题
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
