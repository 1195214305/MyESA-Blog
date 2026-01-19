import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Settings } from "lucide-react";
import aiAssistantImg from "@/assets/images/ai-assistant.png";
import { useSettingsStore } from "@/store";
import { AI_PROVIDERS } from "@/services/api";

type Expression = "neutral" | "shy" | "speaking" | "wink";

export const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [expression, setExpression] = useState<Expression>("neutral");
    const [showSettings, setShowSettings] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const { aiConfig, setAIConfig } = useSettingsStore();

    // 表情位置映射（2x2网格）
    const expressionPosition: Record<Expression, string> = {
        neutral: "0% 0%",      // 左上
        shy: "100% 0%",        // 右上
        speaking: "0% 100%",   // 左下
        wink: "100% 100%",     // 右下
    };

    const handleMouseEnter = (area: "head" | "body") => {
        if (area === "head") {
            setExpression("shy");
        } else {
            setExpression("wink");
        }
    };

    const handleMouseLeave = () => {
        setExpression("neutral");
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content: input }]);
        setInput("");
        setExpression("speaking");

        // 模拟AI回复（实际应调用API）
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "你好！我是AI小助手，有什么可以帮你的吗？😊" },
            ]);
            setExpression("neutral");
        }, 1500);
    };

    return (
        <>
            {/* 浮动按钮 */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
            >
                <motion.button
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-violet-500/50 shadow-2xl shadow-violet-500/30"
                >
                    <div
                        className="w-full h-full bg-cover"
                        style={{
                            backgroundImage: `url(${aiAssistantImg})`,
                            backgroundPosition: expressionPosition[expression],
                            backgroundSize: "200% 200%",
                        }}
                        onMouseEnter={() => handleMouseEnter("head")}
                        onMouseLeave={handleMouseLeave}
                    />
                </motion.button>
            </motion.div>

            {/* 聊天窗口 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-28 right-6 w-96 z-50 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full bg-cover border-2 border-violet-500/50"
                                    style={{
                                        backgroundImage: `url(${aiAssistantImg})`,
                                        backgroundPosition: expressionPosition[expression],
                                        backgroundSize: "200% 200%",
                                    }}
                                />
                                <div>
                                    <h3 className="font-bold text-white">AI 小助手</h3>
                                    <p className="text-xs text-slate-400">随时为您服务 ✨</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <Settings size={18} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden border-b border-white/10"
                                >
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <label className="text-xs text-slate-400">服务商</label>
                                            <select
                                                value={aiConfig.provider}
                                                onChange={(e) => {
                                                    const provider = e.target.value as keyof typeof AI_PROVIDERS;
                                                    setAIConfig({
                                                        provider,
                                                        baseUrl: AI_PROVIDERS[provider]?.baseUrl || "",
                                                        model: AI_PROVIDERS[provider]?.models[0] || "",
                                                    });
                                                }}
                                                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm"
                                            >
                                                {Object.entries(AI_PROVIDERS).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400">API Key</label>
                                            <input
                                                type="password"
                                                value={aiConfig.apiKey}
                                                onChange={(e) => setAIConfig({ apiKey: e.target.value })}
                                                placeholder="输入你的 API Key"
                                                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400">Base URL</label>
                                            <input
                                                type="text"
                                                value={aiConfig.baseUrl}
                                                onChange={(e) => setAIConfig({ baseUrl: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages */}
                        <div className="h-64 overflow-y-auto p-4 space-y-3">
                            {messages.length === 0 && (
                                <p className="text-center text-slate-500 text-sm py-8">
                                    开始和我聊天吧！💬
                                </p>
                            )}
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.role === "user"
                                            ? "bg-violet-500 text-white"
                                            : "bg-slate-800 text-slate-200"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="输入消息..."
                                    className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-full text-white text-sm focus:outline-none focus:border-violet-500"
                                />
                                <button
                                    onClick={handleSend}
                                    className="p-2.5 bg-violet-500 text-white rounded-full hover:bg-violet-400 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
