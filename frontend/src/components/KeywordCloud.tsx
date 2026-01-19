import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";

const keywords = [
    { text: "React", size: "text-2xl", color: "text-cyan-400" },
    { text: "TypeScript", size: "text-xl", color: "text-blue-400" },
    { text: "边缘计算", size: "text-2xl", color: "text-violet-400" },
    { text: "ESA Pages", size: "text-lg", color: "text-green-400" },
    { text: "AI", size: "text-3xl", color: "text-pink-400" },
    { text: "Python", size: "text-lg", color: "text-yellow-400" },
    { text: "Vite", size: "text-base", color: "text-purple-400" },
    { text: "Tailwind", size: "text-lg", color: "text-sky-400" },
    { text: "Node.js", size: "text-base", color: "text-green-500" },
    { text: "WebGL", size: "text-sm", color: "text-orange-400" },
    { text: "Three.js", size: "text-base", color: "text-white" },
    { text: "Framer Motion", size: "text-sm", color: "text-pink-300" },
];

export const KeywordCloud = () => {
    return (
        <GlassCard className="p-6">
            <h3 className="font-bold text-lg text-white mb-4">🏷️ 开源关键词</h3>

            <div className="flex flex-wrap gap-3 justify-center">
                {keywords.map((keyword, idx) => (
                    <motion.span
                        key={keyword.text}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.1 }}
                        className={`${keyword.size} ${keyword.color} font-medium cursor-pointer hover:underline transition-transform`}
                    >
                        {keyword.text}
                    </motion.span>
                ))}
            </div>
        </GlassCard>
    );
};
