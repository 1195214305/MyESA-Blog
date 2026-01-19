import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard } from "@/components/ProjectCard";
import { fetchGitHubRepos, fetchRepoTree, type GitHubRepo } from "@/services/api";
import { Folder, File, X, RefreshCw, EyeOff, Eye, GripVertical, ArrowUpDown } from "lucide-react";
import { useSettingsStore } from "@/store";
import { GlassCard } from "@/components/ui/glass-card";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export const ProjectsPage = () => {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
    const [repoTree, setRepoTree] = useState<any[]>([]);
    const [treeLoading, setTreeLoading] = useState(false);
    const [showHidden, setShowHidden] = useState(false);
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [customOrder, setCustomOrder] = useState<string[]>([]);

    const { hiddenProjects, hideProject, showProject } = useSettingsStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadRepos();
        // 从 localStorage 加载自定义排序
        const savedOrder = localStorage.getItem('project_order');
        if (savedOrder) {
            setCustomOrder(JSON.parse(savedOrder));
        }
    }, []);

    const loadRepos = async () => {
        setLoading(true);
        try {
            const data = await fetchGitHubRepos();
            // 默认按更新时间排序
            data.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            setRepos(data);
        } catch (error) {
            console.error("Failed to fetch repos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTree = async (repoName: string) => {
        setSelectedRepo(repoName);
        setTreeLoading(true);
        try {
            const tree = await fetchRepoTree(repoName);
            setRepoTree(tree);
        } catch (error) {
            console.error("Failed to fetch tree:", error);
            setRepoTree([]);
        } finally {
            setTreeLoading(false);
        }
    };

    // 处理拖拽结束
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = sortedRepos.findIndex(r => r.id.toString() === active.id);
            const newIndex = sortedRepos.findIndex(r => r.id.toString() === over.id);
            const newOrder = arrayMove(sortedRepos, oldIndex, newIndex).map(r => r.id.toString());
            setCustomOrder(newOrder);
            localStorage.setItem('project_order', JSON.stringify(newOrder));
        }
    };

    // 过滤和排序
    const visibleRepos = repos.filter(repo => !hiddenProjects.includes(repo.name));
    const hiddenRepos = repos.filter(repo => hiddenProjects.includes(repo.name));

    // 应用自定义排序
    const sortedRepos = customOrder.length > 0
        ? [...visibleRepos].sort((a, b) => {
            const aIndex = customOrder.indexOf(a.id.toString());
            const bIndex = customOrder.indexOf(b.id.toString());
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        })
        : visibleRepos;

    // 计算统计
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

    return (
        <div className="pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">📂 项目展示</h1>
                        <p className="text-slate-400">我的开源项目集合</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsReorderMode(!isReorderMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isReorderMode
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-slate-700/50 text-slate-400 hover:text-white"
                                }`}
                        >
                            <ArrowUpDown size={16} />
                            {isReorderMode ? "完成排序" : "调整顺序"}
                        </button>
                        {hiddenProjects.length > 0 && (
                            <button
                                onClick={() => setShowHidden(!showHidden)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${showHidden
                                        ? "bg-orange-500/20 text-orange-300"
                                        : "bg-slate-700/50 text-slate-400 hover:text-white"
                                    }`}
                            >
                                {showHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                已隐藏 ({hiddenProjects.length})
                            </button>
                        )}
                        <button
                            onClick={loadRepos}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-300 rounded-full hover:bg-violet-500/30 transition-colors"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            刷新
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="flex items-center gap-6 mb-6 text-sm text-slate-400">
                    <span>📦 共 {repos.length} 个项目</span>
                    <span>⭐ 共 {totalStars} stars</span>
                    <span>🍴 共 {totalForks} forks</span>
                    {isReorderMode && (
                        <span className="text-green-400">
                            <GripVertical size={14} className="inline mr-1" />
                            拖拽项目卡片可调整顺序
                        </span>
                    )}
                </div>

                {/* Hidden Projects */}
                <AnimatePresence>
                    {showHidden && hiddenRepos.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <GlassCard className="p-4">
                                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                    <EyeOff size={16} /> 已隐藏的项目
                                </h3>
                                <div className="space-y-2">
                                    {hiddenRepos.map((repo) => (
                                        <ProjectCard
                                            key={repo.id}
                                            repo={repo}
                                            index={0}
                                            isHidden={true}
                                            onShow={showProject}
                                        />
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Project List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sortedRepos.map((r) => r.id.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {sortedRepos.map((repo, idx) => (
                                    <ProjectCard
                                        key={repo.id}
                                        repo={repo}
                                        index={idx}
                                        onViewTree={handleViewTree}
                                        onHide={hideProject}
                                        isDraggable={isReorderMode}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                {/* Tree Modal */}
                <AnimatePresence>
                    {selectedRepo && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setSelectedRepo(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-4 border-b border-white/10">
                                    <h3 className="font-bold text-white">{selectedRepo} - 目录结构</h3>
                                    <button
                                        onClick={() => setSelectedRepo(null)}
                                        className="p-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-4 overflow-y-auto max-h-[60vh]">
                                    {treeLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="space-y-1 font-mono text-sm">
                                            {repoTree.slice(0, 50).map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5"
                                                    style={{
                                                        paddingLeft: `${(item.path.split("/").length - 1) * 16 + 8}px`,
                                                    }}
                                                >
                                                    {item.type === "tree" ? (
                                                        <Folder size={14} className="text-yellow-400" />
                                                    ) : (
                                                        <File size={14} className="text-slate-400" />
                                                    )}
                                                    <span className="text-slate-300">
                                                        {item.path.split("/").pop()}
                                                    </span>
                                                </div>
                                            ))}
                                            {repoTree.length > 50 && (
                                                <p className="text-center text-slate-500 py-2">
                                                    ... 还有 {repoTree.length - 50} 个文件
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
