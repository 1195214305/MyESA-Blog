import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, Mail, MapPin, Code, Sparkles, Save, Edit2, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useSettingsStore } from "@/store";
import avatarImg from "@/assets/images/avatar.png";

interface GitHubStats {
    publicRepos: number;
    followers: number;
    following: number;
    totalStars: number;
}

export const AboutPage = () => {
    const { contactEmail, setContactEmail } = useSettingsStore();
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [emailInput, setEmailInput] = useState(contactEmail);
    const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        fetchGitHubStats();
    }, []);

    const fetchGitHubStats = async () => {
        try {
            setLoadingStats(true);
            const userRes = await fetch("https://api.github.com/users/1195214305");
            if (userRes.ok) {
                const userData = await userRes.json();
                // 获取仓库以统计 star 数
                const reposRes = await fetch("https://api.github.com/users/1195214305/repos?per_page=100");
                let totalStars = 0;
                if (reposRes.ok) {
                    const repos = await reposRes.json();
                    totalStars = repos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0);
                }
                setGithubStats({
                    publicRepos: userData.public_repos || 0,
                    followers: userData.followers || 0,
                    following: userData.following || 0,
                    totalStars,
                });
            }
        } catch (error) {
            console.warn("GitHub API 请求失败:", error);
        } finally {
            setLoadingStats(false);
        }
    };

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
                    <p className="text-xl text-violet-300 mb-4">全栈开发者</p>
                    <div className="flex items-center justify-center gap-4 text-slate-400">
                        <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            China
                        </span>
                        <span className="flex items-center gap-1">
                            <Code size={16} />
                            Full Stack Developer
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
                            热爱技术的全栈开发者，专注于 Web 开发、边缘计算和 AI 应用。
                            善于将新技术融入实际项目，追求高质量的代码实现。
                        </p>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            在这个博客里，我会分享技术探索、项目经验和日常思考。
                            欢迎一起交流学习。
                        </p>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="font-bold text-lg text-white mb-4">技术栈</h3>
                        <div className="flex flex-wrap gap-2">
                            {["React", "TypeScript", "Python", "Node.js", "Tailwind CSS", "Vite", "Edge Computing", "AI/ML", "Three.js", "PostgreSQL"].map((skill) => (
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
                        <h3 className="font-bold text-lg text-white mb-4">GitHub 统计</h3>
                        {loadingStats ? (
                            <div className="flex justify-center py-6">
                                <Loader2 size={24} className="animate-spin text-violet-400" />
                            </div>
                        ) : githubStats ? (
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-3xl font-bold text-violet-400">{githubStats.publicRepos}</p>
                                    <p className="text-sm text-slate-400">公开仓库</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-3xl font-bold text-cyan-400">{githubStats.totalStars}</p>
                                    <p className="text-sm text-slate-400">Star</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-3xl font-bold text-green-400">{githubStats.followers}</p>
                                    <p className="text-sm text-slate-400">关注者</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <p className="text-3xl font-bold text-orange-400">{githubStats.following}</p>
                                    <p className="text-sm text-slate-400">正在关注</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-slate-400 py-6">GitHub 数据加载失败</p>
                        )}
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="font-bold text-lg text-white mb-4">联系我</h3>
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
                                点击编辑图标可修改邮箱，数据自动保存到本地
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
