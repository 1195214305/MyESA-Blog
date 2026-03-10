import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Settings, Loader2, Trash2 } from "lucide-react";
import aiAssistantImg from "@/assets/images/ai-assistant.png";
import { useSettingsStore } from "@/store";
import { AI_PROVIDERS } from "@/services/api";

type Expression = "neutral" | "shy" | "speaking" | "wink";

const API_BASE = import.meta.env.VITE_API_URL || '';

export const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [expression, setExpression] = useState<Expression>("neutral");
    const [showSettings, setShowSettings] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const { aiConfig, setAIConfig } = useSettingsStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 表情位置映射（2x2网格）
    const expressionPosition: Record<Expression, string> = {
        neutral: "0% 0%",      // 左上
        shy: "100% 0%",        // 右上
        speaking: "0% 100%",   // 左下
        wink: "100% 100%",     // 右下
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleMouseEnter = (area: "head" | "body") => {
        if (area === "head") {
            setExpression("shy");
        } else {
            setExpression("wink");
        }
    };

    const handleMouseLeave = () => {
        if (!loading) setExpression("neutral");
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setInput("");
        setExpression("speaking");
        setLoading(true);

        // 检查是否配置了 API Key
        if (!aiConfig.apiKey) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "请先在设置中配置你的 API Key 才能使用 AI 对话功能。点击右上角齿轮图标进行设置。",
                },
            ]);
            setExpression("neutral");
            setLoading(false);
            return;
        }

        try {
            // 构建对话上下文
            const chatMessages = [
                {
                    role: "system",
                    content: "你是 TaoChen 博客的 AI 助手，友善、专业、简洁地回答问题。博主是一名全栈开发者，擅长 React、TypeScript、Python、边缘计算等技术。",
                },
                ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
                { role: "user", content: userMessage },
            ];

            const res = await fetch(`${API_BASE}/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: aiConfig.provider,
                    apiKey: aiConfig.apiKey,
                    model: aiConfig.model,
                    messages: chatMessages,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `请求失败 (${res.status})`);
            }

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || "抱歉，AI 没有返回有效回复。";

            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        } catch (error: any) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `请求出错: ${error.message}。请检查 API Key 和网络连接。`,
                },
            ]);
        } finally {
            setExpression("neutral");
            setLoading(false);
        }
    };

    const clearMessages = () => {
        setMessages([]);
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
                                    <p className="text-xs text-slate-400">
                                        {aiConfig.apiKey ? `${AI_PROVIDERS[aiConfig.provider as keyof typeof AI_PROVIDERS]?.name || aiConfig.provider}` : "未配置 API Key"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={clearMessages}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                    title="清空对话"
                                >
                                    <Trash2 size={16} />
                                </button>
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
                                            <label className="text-xs text-slate-400">模型</label>
                                            <select
                                                value={aiConfig.model}
                                                onChange={(e) => setAIConfig({ model: e.target.value })}
                                                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm"
                                            >
                                                {(AI_PROVIDERS[aiConfig.provider as keyof typeof AI_PROVIDERS]?.models || []).map((m) => (
                                                    <option key={m} value={m}>{m}</option>
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
                                        <p className="text-xs text-slate-500">
                                            API Key 仅保存在本地浏览器，不会上传到服务器。
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages */}
                        <div className="h-64 overflow-y-auto p-4 space-y-3">
                            {messages.length === 0 && (
                                <p className="text-center text-slate-500 text-sm py-8">
                                    {aiConfig.apiKey
                                        ? "开始和我聊天吧！"
                                        : "请先点击齿轮图标配置 API Key"}
                                </p>
                            )}
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === "user"
                                            ? "bg-violet-500 text-white"
                                            : "bg-slate-800 text-slate-200"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-400 text-sm flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin" />
                                        思考中...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                    placeholder={aiConfig.apiKey ? "输入消息..." : "请先配置 API Key"}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-full text-white text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="p-2.5 bg-violet-500 text-white rounded-full hover:bg-violet-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
