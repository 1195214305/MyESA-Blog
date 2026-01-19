import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Image, Upload, X, Loader2 } from "lucide-react";

interface CoverImageProps {
    value?: string;
    onChange?: (url: string) => void;
    readonly?: boolean;
}

// 渐变色封面
const GRADIENT_COVERS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

export const CoverImage = ({ value, onChange, readonly = false }: CoverImageProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // 转换为 base64（简单方案，实际应上传到图床）
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                onChange?.(base64);
                setIsUploading(false);
                setShowPicker(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Upload failed:', error);
            setIsUploading(false);
        }
    };

    const selectCover = (cover: string) => {
        onChange?.(cover);
        setShowPicker(false);
    };

    // 只读模式
    if (readonly) {
        return value ? (
            <div
                className="w-full h-48 rounded-xl overflow-hidden"
                style={value.startsWith('linear-gradient') ? { background: value } : undefined}
            >
                {!value.startsWith('linear-gradient') && (
                    <img src={value} alt="Cover" className="w-full h-full object-cover" />
                )}
            </div>
        ) : null;
    }

    return (
        <div className="relative">
            {/* 当前封面预览 */}
            <div
                className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-dashed border-white/20 cursor-pointer hover:border-violet-500/50 transition-colors"
                onClick={() => setShowPicker(!showPicker)}
                style={value?.startsWith('linear-gradient') ? { background: value } : undefined}
            >
                {value && !value.startsWith('linear-gradient') ? (
                    <>
                        <img src={value} alt="Cover" className="w-full h-full object-cover" />
                        <button
                            onClick={(e) => { e.stopPropagation(); onChange?.(''); }}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500"
                        >
                            <X size={14} />
                        </button>
                    </>
                ) : !value ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Image size={24} className="mb-2" />
                        <span className="text-sm">点击选择封面图片</span>
                    </div>
                ) : null}
            </div>

            {/* 封面选择器 */}
            {showPicker && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 p-4 bg-slate-800 rounded-xl border border-white/10 shadow-xl z-10"
                >
                    {/* 上传按钮 */}
                    <div className="mb-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-colors"
                        >
                            {isUploading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Upload size={16} />
                            )}
                            <span>{isUploading ? '上传中...' : '上传图片'}</span>
                        </button>
                    </div>

                    {/* 渐变色 */}
                    <div className="mb-3">
                        <div className="text-xs text-slate-500 mb-2">渐变背景</div>
                        <div className="grid grid-cols-6 gap-2">
                            {GRADIENT_COVERS.map((gradient, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => selectCover(gradient)}
                                    className="w-full h-10 rounded-lg hover:ring-2 hover:ring-violet-500 transition-all"
                                    style={{ background: gradient }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 取消按钮 */}
                    <button
                        onClick={() => setShowPicker(false)}
                        className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        取消
                    </button>
                </motion.div>
            )}
        </div>
    );
};
