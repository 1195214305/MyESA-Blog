import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Mail, MapPin, Code, Sparkles, Save, Edit2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useSettingsStore } from "@/store";
import avatarImg from "@/assets/images/avatar.png";

export const AboutPage = () => {
    const { contactEmail, setContactEmail } = useSettingsStore();
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [emailInput, setEmailInput] = useState(contactEmail);

    const handleSaveEmail = () => {
        setContactEmail(emailInput);
        setIsEditingEmail(false);
    };

    return (
        <div className="pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-cyan-500/30 rounded-full blur-3xl" />
                        <img
                            src={avatarImg}
                            alt="Avatar"
                            className="relative w-40 h-40 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Tao Chen</h1>
                    <p className="text-xl text-violet-300 mb-4">边缘计算探索者 · 全栈开发者</p>
                    <div className="flex items-center justify-center gap-4 text-slate-400">
                        <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            China
                        </span>
                        <span className="flex items-center gap-1">
                            <Code size={16} />
                            Full Stack
                        </span>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="p-6">
                        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                            <Sparkles className="text-violet-400" />
                            关于我
                        </h3>
                        <p className="text-slate-300 leading-relaxed">
                            我是一名热爱技术的全栈开发者，专注于边缘计算、AI 应用和现代 Web 开发。
                            目前正在探索如何利用阿里云 ESA Pages 等边缘计算平台构建更快、更智能的应用。
                        </p>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            我相信代码是一种艺术，每一次提交都是一首诗。在这个博客里，我会分享我的技术探索、
                            项目经验和日常思考。
                        </p>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="font-bold text-lg text-white mb-4">🛠️ 技术栈</h3>
                        <div className="flex flex-wrap gap-2">
                            {["React", "TypeScript", "Python", "Node.js", "Tailwind CSS", "Vite", "ESA Pages", "Edge Computing", "AI/ML", "Three.js"].map((skill) => (
                                <span
                                    key={skill}
                                    className="px-3 py-1 bg-white/10 rounded-full text-sm text-slate-300"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="font-bold text-lg text-white mb-4">📊 GitHub 统计</h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-3xl font-bold text-violet-400">46+</p>
                                <p className="text-sm text-slate-400">公开仓库</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-3xl font-bold text-cyan-400">1000+</p>
                                <p className="text-sm text-slate-400">总提交数</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="font-bold text-lg text-white mb-4">📬 联系我</h3>
                        <div className="space-y-3">
                            <a
                                href="https://github.com/1195214305"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors"
                            >
                                <Github size={20} />
                                github.com/1195214305
                            </a>

                            {/* 邮箱编辑区 */}
                            <div className="flex items-center gap-3">
                                <Mail size={20} className="text-slate-300" />
                                {isEditingEmail ? (
                                    <div className="flex-1 flex items-center gap-2">
                                        <input
                                            type="email"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            placeholder="输入你的邮箱..."
                                            className="flex-1 px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleSaveEmail}
                                            className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                                        >
                                            <Save size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-between">
                                        <span className="text-slate-300">
                                            {contactEmail || "未设置邮箱"}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setEmailInput(contactEmail);
                                                setIsEditingEmail(true);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                            title="编辑邮箱"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500">
                                💡 点击编辑图标可修改邮箱，数据自动保存到本地
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
