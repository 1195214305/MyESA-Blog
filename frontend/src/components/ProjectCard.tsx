import { motion } from "framer-motion";
import { ExternalLink, Github, Star, GitFork, Trash2, Eye, GripVertical } from "lucide-react";
import { getDeploymentUrl, type GitHubRepo } from "@/services/api";
import { GlassCard } from "./ui/glass-card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// 项目 Logo 映射（完整版 - 35个项目）
const PROJECT_LOGOS: Record<string, string> = {
    // 01-10
    "EcoLens": "/logos/ecolens.svg",
    "GlobalPing": "/logos/globalping.svg",
    "SnapShare": "/logos/snapshare.svg",
    "CodePlayground": "/logos/codeplayground.svg",
    "StoryWeaver": "/logos/storyweaver.svg",
    "ClearVoice": "/logos/clearvoice.svg",
    "EdgeMirror": "/logos/edgemirror.svg",
    "TimeWarp": "/logos/timewarp.svg",

    // 11-20
    "SnapCode": "/logos/snapcode.svg",
    "EdgeGuard": "/logos/edgeguard.svg",
    "EdgeFlow": "/logos/edgeflow.svg",
    "CodeLens": "/logos/codelens.svg",
    "EdgeInsight": "/logos/edgeinsight.svg",
    "ResumeAI": "/logos/resumeai.svg",
    "BioLab": "/logos/biolab.svg",
    "PaperLens": "/logos/paperlens.svg",
    "ChemLab": "/logos/chemlab.svg",
    "ScholarNexus": "/logos/scholarnexus.svg",
    "GeoLab": "/logos/geolab.svg",
    "MethodHub": "/logos/methodhub.svg",
    "EnglishLab": "/logos/englishlab.svg",
    "PhysicsLab": "/logos/physicslab.svg",
    "QuantumLab": "/logos/quantumlab.svg",

    // 21-30
    "EdgeArena": "/logos/edgearena.svg",
    "CopyMaster": "/logos/copymaster.svg",
    "PixelWar": "/logos/pixelwar.svg",
    "IsingViz": "/logos/isingviz.svg",
    "NeonRun": "/logos/neonrun.svg",
    "EdgeTrendHub": "/logos/edgetrendhub.svg",
    "FlashSale": "/logos/flashsale.svg",
    "SVGZenGarden": "/logos/svgzengarden.svg",
    "CryptoWatch": "/logos/cryptowatch.svg",
    "AgriEdge": "/logos/agriedge.svg",
    "ElderConnect": "/logos/elderconnect.svg",
    "CarbonTrace": "/logos/carbontrace.svg",
};

// 根据项目名获取Logo
function getProjectLogo(repoName: string): string | null {
    // 精确匹配
    if (PROJECT_LOGOS[repoName]) return PROJECT_LOGOS[repoName];

    // 模糊匹配
    const lowerName = repoName.toLowerCase();
    for (const [key, value] of Object.entries(PROJECT_LOGOS)) {
        if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
            return value;
        }
    }
    return null;
}

interface ProjectCardProps {
    repo: GitHubRepo;
    index: number;
    onViewTree?: (repoName: string) => void;
    onHide?: (repoName: string) => void;
    isHidden?: boolean;
    onShow?: (repoName: string) => void;
    isDraggable?: boolean;
}

export const ProjectCard = ({ repo, index, onViewTree, onHide, isHidden, onShow, isDraggable = false }: ProjectCardProps) => {
    const deploymentUrl = getDeploymentUrl(repo.name);
    const logoUrl = getProjectLogo(repo.name);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: repo.id.toString(), disabled: !isDraggable });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 'auto',
    };

    // 如果项目被隐藏且在隐藏列表视图中
    if (isHidden) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5"
            >
                <span className="text-slate-400">{repo.name}</span>
                <button
                    onClick={() => onShow?.(repo.name)}
                    className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
                >
                    <Eye size={14} /> 恢复显示
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            <GlassCard className="p-0 overflow-hidden group hover:border-violet-500/50 transition-colors">
                <div className="flex">
                    {/* Drag Handle */}
                    {isDraggable && (
                        <div
                            {...attributes}
                            {...listeners}
                            className="flex items-center justify-center w-8 bg-white/5 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
                        >
                            <GripVertical size={16} className="text-slate-500" />
                        </div>
                    )}

                    {/* Left: Logo Area */}
                    <div className="w-1/4 min-w-[100px] bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center p-4">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={`${repo.name} logo`}
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                        ) : null}
                        <div className={`w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white ${logoUrl ? 'hidden' : ''}`}>
                            {repo.name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Right: Content Area */}
                    <div className="flex-1 p-4 space-y-3">
                        {/* Title & Actions */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-white group-hover:text-violet-300 transition-colors">
                                    {repo.name}
                                </h3>
                                {repo.language && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-300">
                                        {repo.language}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => onHide?.(repo.name)}
                                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                title="隐藏此项目"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Links */}
                        <div className="flex flex-col gap-1 text-sm">
                            <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                            >
                                <Github size={14} />
                                <span className="truncate">{repo.html_url}</span>
                            </a>
                            <a
                                href={deploymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
                            >
                                <ExternalLink size={14} />
                                <span className="truncate">{deploymentUrl}</span>
                            </a>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-400 line-clamp-2">
                            {repo.description || "暂无描述"}
                        </p>

                        {/* Stats & Action */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Star size={12} /> {repo.stargazers_count}
                                </span>
                                <span className="flex items-center gap-1">
                                    <GitFork size={12} /> {repo.forks_count}
                                </span>
                                <span>{new Date(repo.updated_at).toLocaleDateString("zh-CN")}</span>
                            </div>
                            <button
                                onClick={() => onViewTree?.(repo.name)}
                                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                查看目录 →
                            </button>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
};
