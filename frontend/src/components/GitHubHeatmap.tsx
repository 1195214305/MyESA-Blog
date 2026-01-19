import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";

// 模拟 GitHub 贡献数据（52周 x 7天）
const generateContributionData = () => {
    const data: number[][] = [];
    for (let week = 0; week < 52; week++) {
        const weekData: number[] = [];
        for (let day = 0; day < 7; day++) {
            weekData.push(Math.floor(Math.random() * 5));
        }
        data.push(weekData);
    }
    return data;
};

const contributionData = generateContributionData();

const getColor = (level: number) => {
    const colors = [
        "bg-slate-800",
        "bg-violet-900/50",
        "bg-violet-700/60",
        "bg-violet-500/70",
        "bg-violet-400",
    ];
    return colors[level] || colors[0];
};

export const GitHubHeatmap = () => {
    return (
        <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-white">📊 提交频次诗意图谱</h3>
                <p className="text-sm text-slate-400">代码如诗，提交为韵</p>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex gap-[3px] min-w-max">
                    {contributionData.map((week, weekIdx) => (
                        <div key={weekIdx} className="flex flex-col gap-[3px]">
                            {week.map((level, dayIdx) => (
                                <motion.div
                                    key={dayIdx}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (weekIdx * 7 + dayIdx) * 0.002 }}
                                    className={`w-3 h-3 rounded-sm ${getColor(level)} hover:ring-2 hover:ring-violet-400 transition-all cursor-pointer`}
                                    title={`${level} 次提交`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                <span>少</span>
                {[0, 1, 2, 3, 4].map((level) => (
                    <div key={level} className={`w-3 h-3 rounded-sm ${getColor(level)}`} />
                ))}
                <span>多</span>
            </div>
        </GlassCard>
    );
};
