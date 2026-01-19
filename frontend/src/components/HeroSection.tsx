import { motion } from "framer-motion";
import avatarImg from "@/assets/images/avatar.png";

export const HeroSection = () => {
    return (
        <section className="min-h-[60vh] flex items-center justify-center py-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Avatar */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex justify-center lg:justify-end"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-cyan-500/30 rounded-full blur-3xl" />
                            <img
                                src={avatarImg}
                                alt="Avatar"
                                className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                            />
                        </div>
                    </motion.div>

                    {/* Right: Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/20 text-violet-300 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            在线中 · 边缘计算探索者
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-bold">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-200 to-cyan-200">
                                Tao Chen
                            </span>
                        </h1>

                        <div className="bg-slate-900/50 backdrop-blur rounded-xl p-4 border border-white/10 font-mono text-sm">
                            <pre className="text-slate-300">
                                {`{
  "role": "全栈开发者",
  "focus": ["边缘计算", "AI应用", "Web3D"],
  "skills": ["React", "Python", "TypeScript"],
  "motto": "代码如诗，提交为韵"
}`}
                            </pre>
                        </div>

                        <div className="flex gap-3">
                            <a
                                href="https://github.com/1195214305"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2.5 rounded-full bg-white text-slate-900 font-medium hover:bg-slate-200 transition-all shadow-lg"
                            >
                                查看 GitHub
                            </a>
                            <button className="px-6 py-2.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white font-medium hover:bg-white/20 transition-all">
                                联系我
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
