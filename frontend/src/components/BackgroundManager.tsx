import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";
import { Palette, Check, Upload, X } from "lucide-react";
import { useThemeStore } from "@/store";

// 预设背景
const PRESET_BACKGROUNDS = [
    {
        id: 'space',
        name: '星空',
        preview: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 50%, #0d0d20 100%)',
        dark: '/assets/images/bg-dark.png',
        light: '/assets/images/bg-light.png'
    },
    {
        id: 'aurora',
        name: '极光',
        preview: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        dark: '',
        light: ''
    },
    {
        id: 'cyberpunk',
        name: '赛博',
        preview: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
        dark: '',
        light: ''
    },
    {
        id: 'warm',
        name: '暖阳',
        preview: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        dark: '',
        light: ''
    },
    {
        id: 'sunset',
        name: '日落',
        preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        dark: '',
        light: ''
    },
    {
        id: 'minimal',
        name: '极简',
        preview: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        dark: '',
        light: ''
    },
];

interface BackgroundManagerProps {
    onClose?: () => void;
}

export const BackgroundManager = ({ onClose }: BackgroundManagerProps) => {
    const { background, setBackground } = useThemeStore();
    const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

    const handleSelect = (id: string) => {
        setBackground(id as any);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <GlassCard className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Palette className="text-violet-400" size={20} />
                            <h3 className="font-bold text-lg text-white">背景设置</h3>
                        </div>
                        {onClose && (
                            <button onClick={onClose} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab('preset')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeTab === 'preset'
                                ? 'bg-violet-500 text-white'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                        >
                            预设背景
                        </button>
                        <button
                            onClick={() => setActiveTab('custom')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeTab === 'custom'
                                ? 'bg-violet-500 text-white'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                        >
                            自定义
                        </button>
                    </div>

                    {/* Preset Backgrounds */}
                    {activeTab === 'preset' && (
                        <div className="grid grid-cols-3 gap-3">
                            {PRESET_BACKGROUNDS.map((bg) => (
                                <button
                                    key={bg.id}
                                    onClick={() => handleSelect(bg.id)}
                                    className={`relative group aspect-video rounded-lg overflow-hidden border-2 transition-all ${background === bg.id
                                        ? 'border-violet-500 ring-2 ring-violet-500/30'
                                        : 'border-transparent hover:border-white/30'
                                        }`}
                                    style={{ background: bg.preview }}
                                >
                                    {background === bg.id && (
                                        <div className="absolute top-1 right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-center">
                                        <span className="text-xs text-white">{bg.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Custom Background */}
                    {activeTab === 'custom' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-violet-500/50 transition-colors">
                                <div className="text-center text-slate-400">
                                    <Upload size={24} className="mx-auto mb-2" />
                                    <span className="text-sm">上传自定义背景</span>
                                    <p className="text-xs mt-1">支持 JPG, PNG, WebP</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                                提示：建议使用 1920x1080 或更高分辨率的图片
                            </p>
                        </div>
                    )}
                </GlassCard>
            </motion.div>
        </motion.div>
    );
};
