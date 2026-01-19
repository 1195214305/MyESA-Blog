import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Volume2, VolumeX } from "lucide-react";

// Live2D 表情状态
type Expression = 'neutral' | 'happy' | 'thinking' | 'surprised' | 'wink';

// 招呼语
const greetings = [
    "欢迎来到我的博客！😊",
    "今天有什么可以帮你的吗？",
    "点击我可以聊天哦~",
    "去看看最新的文章吧！",
    "记得给喜欢的内容点赞哦~",
];

// 随机提示
const tips = [
    { text: "试试点击搜索按钮，可以快速找到内容哦~", expression: 'thinking' as Expression },
    { text: "切换背景主题，换个心情吧！", expression: 'happy' as Expression },
    { text: "这是我的新博客，还在不断完善中~", expression: 'neutral' as Expression },
    { text: "点击项目页面查看我的开源作品！", expression: 'wink' as Expression },
];

export const Live2DAvatar = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [showBubble, setShowBubble] = useState(true);
    const [message, setMessage] = useState(greetings[0]);
    const [expression, setExpression] = useState<Expression>('neutral');
    const [isMuted, setIsMuted] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 初始化随机招呼
    useEffect(() => {
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        setMessage(randomGreeting);
        setExpression('happy');

        // 自动隐藏气泡
        timerRef.current = setTimeout(() => {
            setShowBubble(false);
        }, 5000);

        // 定时显示提示
        const tipInterval = setInterval(() => {
            if (!showBubble) {
                const randomTip = tips[Math.floor(Math.random() * tips.length)];
                setMessage(randomTip.text);
                setExpression(randomTip.expression);
                setShowBubble(true);
                setTimeout(() => setShowBubble(false), 4000);
            }
        }, 30000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            clearInterval(tipInterval);
        };
    }, []);

    // 点击互动
    const handleClick = () => {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setMessage(randomTip.text);
        setExpression(randomTip.expression);
        setShowBubble(true);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShowBubble(false), 4000);
    };

    // 获取表情对应的眼睛样式
    const getEyeStyle = () => {
        switch (expression) {
            case 'happy': return 'scale-y-50';
            case 'thinking': return 'translate-x-1';
            case 'surprised': return 'scale-125';
            case 'wink': return '';
            default: return '';
        }
    };

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 z-50 p-3 bg-violet-500 rounded-full shadow-lg hover:bg-violet-400 transition-colors"
            >
                <MessageCircle size={24} className="text-white" />
            </button>
        );
    }

    return (
        <motion.div
            drag
            dragMomentum={false}
            className="fixed z-50 cursor-grab active:cursor-grabbing"
            style={{ right: 20, bottom: 20 }}
        >
            {/* 控制按钮 */}
            <div className="absolute -top-2 -right-2 flex gap-1">
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 bg-slate-800 rounded-full text-slate-400 hover:text-white"
                >
                    {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                </button>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 bg-slate-800 rounded-full text-slate-400 hover:text-red-400"
                >
                    <X size={12} />
                </button>
            </div>

            {/* 对话气泡 */}
            <AnimatePresence>
                {showBubble && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-white rounded-2xl rounded-br-none shadow-lg max-w-[200px]"
                    >
                        <p className="text-sm text-slate-700">{message}</p>
                        <div className="absolute bottom-0 right-4 w-3 h-3 bg-white transform rotate-45 translate-y-1/2"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 看板娘 - 简化的CSS动画版本 */}
            <motion.div
                onClick={handleClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-24 h-32 cursor-pointer select-none"
            >
                {/* 身体 */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-24 bg-gradient-to-b from-violet-400 to-violet-600 rounded-t-full shadow-lg">
                    {/* 脸 */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-b from-amber-100 to-amber-200 rounded-full">
                        {/* 眼睛 */}
                        <div className="absolute top-5 left-3 flex gap-4">
                            <motion.div
                                className={`w-2.5 h-3 bg-slate-800 rounded-full ${getEyeStyle()}`}
                                animate={expression === 'wink' ? { scaleY: [1, 0.1, 1] } : {}}
                                transition={{ duration: 0.3, repeat: expression === 'wink' ? 2 : 0 }}
                            />
                            <div className={`w-2.5 h-3 bg-slate-800 rounded-full ${getEyeStyle()}`} />
                        </div>
                        {/* 腮红 */}
                        {expression === 'happy' && (
                            <>
                                <div className="absolute top-8 left-1 w-3 h-2 bg-pink-300/60 rounded-full" />
                                <div className="absolute top-8 right-1 w-3 h-2 bg-pink-300/60 rounded-full" />
                            </>
                        )}
                        {/* 嘴巴 */}
                        <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 ${expression === 'happy' ? 'w-4 h-2 border-b-2 border-slate-600 rounded-b-full' :
                            expression === 'surprised' ? 'w-3 h-3 bg-slate-600 rounded-full' :
                                'w-3 h-0.5 bg-slate-600 rounded-full'
                            }`} />
                    </div>
                    {/* 头发 */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-18 h-8">
                        <div className="absolute top-0 left-1 w-4 h-6 bg-violet-900 rounded-full -rotate-12" />
                        <div className="absolute top-0 left-4 w-4 h-7 bg-violet-800 rounded-full" />
                        <div className="absolute top-0 right-4 w-4 h-7 bg-violet-800 rounded-full" />
                        <div className="absolute top-0 right-1 w-4 h-6 bg-violet-900 rounded-full rotate-12" />
                    </div>
                </div>

                {/* 呼吸动画 */}
                <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-24 bg-transparent"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        </motion.div>
    );
};
