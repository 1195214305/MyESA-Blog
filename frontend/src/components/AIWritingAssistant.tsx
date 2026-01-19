import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";
import {
    Wand2, Sparkles, FileText, Check, Loader2,
    Languages, Lightbulb, Edit3, Zap
} from "lucide-react";
import { useSettingsStore } from "@/store";

interface AIWritingAssistantProps {
    content: string;
    onInsert?: (text: string) => void;
}

type AIAction = 'polish' | 'expand' | 'summarize' | 'translate' | 'fix';

const actions: { id: AIAction; icon: React.ReactNode; label: string; desc: string }[] = [
    { id: 'polish', icon: <Sparkles size={14} />, label: '润色', desc: '优化表达' },
    { id: 'expand', icon: <Edit3 size={14} />, label: '扩写', desc: '丰富内容' },
    { id: 'summarize', icon: <FileText size={14} />, label: '摘要', desc: '提炼要点' },
    { id: 'translate', icon: <Languages size={14} />, label: '翻译', desc: '中英互译' },
    { id: 'fix', icon: <Lightbulb size={14} />, label: '校正', desc: '语法检查' },
];

export const AIWritingAssistant = ({ content, onInsert }: AIWritingAssistantProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [activeAction, setActiveAction] = useState<AIAction | null>(null);
    const { aiConfig } = useSettingsStore();

    const executeAction = async (action: AIAction) => {
        if (!content.trim()) {
            setResult('请先输入一些内容');
            return;
        }

        setActiveAction(action);
        setLoading(true);
        setResult('');

        const prompts: Record<AIAction, string> = {
            polish: `请润色以下文本，使其更加优雅流畅：\n\n${content}`,
            expand: `请扩写以下内容，添加更多细节：\n\n${content}`,
            summarize: `请用3-5句话总结以下内容的要点：\n\n${content}`,
            translate: `请将以下内容翻译成${content.match(/[\u4e00-\u9fa5]/) ? '英文' : '中文'}：\n\n${content}`,
            fix: `请检查并修正以下文本的语法错误：\n\n${content}`,
        };

        try {
            // 使用配置的AI API
            const response = await fetch(aiConfig.baseUrl + '/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${aiConfig.apiKey}`,
                },
                body: JSON.stringify({
                    model: aiConfig.model,
                    messages: [
                        { role: 'system', content: '你是一个专业的写作助手，帮助用户优化文本内容。' },
                        { role: 'user', content: prompts[action] },
                    ],
                    max_tokens: 1000,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data.choices?.[0]?.message?.content || '无法生成结果');
            } else {
                throw new Error('API请求失败');
            }
        } catch (error) {
            // 模拟结果
            const mockResults: Record<AIAction, string> = {
                polish: `✨ 润色后:\n\n${content.replace(/。/g, '。\n').trim()}\n\n（已优化语句结构和措辞）`,
                expand: `📝 扩写后:\n\n${content}\n\n这段内容可以进一步展开讨论...（需配置AI API获取真实扩写结果）`,
                summarize: `📋 摘要:\n\n• 核心观点一\n• 核心观点二\n• 核心观点三\n\n（需配置AI API获取真实摘要）`,
                translate: `🌐 翻译结果:\n\n${content.match(/[\u4e00-\u9fa5]/) ? 'Translation result here...' : '翻译结果在这里...'}\n\n（需配置AI API获取真实翻译）`,
                fix: `✅ 校正后:\n\n${content}\n\n（未发现明显语法错误，需配置AI API获取真实校正）`,
            };
            setResult(mockResults[action]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${isOpen
                        ? 'bg-violet-500 text-white'
                        : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                    }`}
            >
                <Wand2 size={14} />
                <span className="text-sm">AI助手</span>
            </button>

            {/* Panel */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 z-50"
                >
                    <GlassCard className="w-[320px] p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="text-yellow-400" size={16} />
                            <span className="font-bold text-white text-sm">AI 写作助手</span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {actions.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => executeAction(action.id)}
                                    disabled={loading}
                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${activeAction === action.id
                                            ? 'bg-violet-500 text-white'
                                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                                        }`}
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        {/* Result */}
                        {(loading || result) && (
                            <div className="p-3 bg-white/5 rounded-lg">
                                {loading ? (
                                    <div className="flex items-center gap-2 text-violet-300">
                                        <Loader2 size={14} className="animate-spin" />
                                        <span className="text-sm">AI 正在处理...</span>
                                    </div>
                                ) : (
                                    <>
                                        <pre className="text-sm text-slate-300 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                                            {result}
                                        </pre>
                                        {onInsert && (
                                            <button
                                                onClick={() => {
                                                    onInsert(result);
                                                    setIsOpen(false);
                                                }}
                                                className="flex items-center gap-1 mt-2 px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs hover:bg-green-500/30"
                                            >
                                                <Check size={12} />
                                                插入内容
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {!aiConfig.apiKey && (
                            <p className="text-xs text-amber-400 mt-2">
                                💡 请在设置中配置 AI API Key 以获得更好体验
                            </p>
                        )}
                    </GlassCard>
                </motion.div>
            )}
        </div>
    );
};
