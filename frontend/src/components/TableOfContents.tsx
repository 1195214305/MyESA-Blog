import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { List, ChevronRight, ChevronDown } from "lucide-react";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content: string; // Markdown 内容
    className?: string;
}

// 从 Markdown 内容提取标题
function extractHeadings(markdown: string): TocItem[] {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
            .toLowerCase()
            .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
            .replace(/^-+|-+$/g, '');

        headings.push({ id, text, level });
    }

    return headings;
}

export const TableOfContents = ({ content, className = '' }: TableOfContentsProps) => {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        setHeadings(extractHeadings(content));
    }, [content]);

    // 监听滚动更新当前位置
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-80px 0px -80% 0px' }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (headings.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`sticky top-24 ${className}`}
        >
            <div className="p-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
                {/* Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full mb-3"
                >
                    <div className="flex items-center gap-2">
                        <List size={16} className="text-violet-400" />
                        <span className="font-bold text-white text-sm">目录导航</span>
                    </div>
                    {isExpanded ? (
                        <ChevronDown size={16} className="text-slate-400" />
                    ) : (
                        <ChevronRight size={16} className="text-slate-400" />
                    )}
                </button>

                {/* TOC List */}
                {isExpanded && (
                    <nav className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                        {headings.map((heading, idx) => (
                            <motion.button
                                key={`${heading.id}-${idx}`}
                                onClick={() => scrollTo(heading.id)}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className={`block w-full text-left text-sm py-1 px-2 rounded transition-colors ${activeId === heading.id
                                        ? 'text-violet-400 bg-violet-500/10'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                            >
                                <span className="line-clamp-1">{heading.text}</span>
                            </motion.button>
                        ))}
                    </nav>
                )}

                {/* Progress */}
                <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-xs text-slate-500">
                        共 {headings.length} 个章节
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
