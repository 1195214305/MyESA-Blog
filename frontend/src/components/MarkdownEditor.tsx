import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Bold, Italic, Code, Link, Image, List, ListOrdered,
    Heading1, Heading2, Heading3, Quote, Save, Eye, EyeOff,
    Smartphone, Monitor, Columns
} from "lucide-react";
import { GlassCard } from "./ui/glass-card";

interface MarkdownEditorProps {
    initialValue?: string;
    onSave?: (content: string) => void;
}

export const MarkdownEditor = ({ initialValue = '', onSave }: MarkdownEditorProps) => {
    const [content, setContent] = useState(initialValue);
    const [showPreview, setShowPreview] = useState(true);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'both'>('both');

    // 简单的 Markdown 渲染
    const renderMarkdown = useCallback((text: string) => {
        let html = text
            // 代码块
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-slate-800 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm text-green-300">$2</code></pre>')
            // 行内代码
            .replace(/`([^`]+)`/g, '<code class="bg-slate-700 px-1.5 py-0.5 rounded text-violet-300">$1</code>')
            // 标题
            .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-white my-3">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white my-4">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-white my-4">$1</h1>')
            // 粗体和斜体
            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em class="italic text-slate-300">$1</em>')
            // 链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-violet-400 hover:underline">$1</a>')
            // 图片
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
            // 引用
            .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-violet-500 pl-4 my-4 text-slate-300 italic">$1</blockquote>')
            // 无序列表
            .replace(/^- (.+)$/gm, '<li class="ml-4 text-slate-300">$1</li>')
            // 有序列表
            .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-slate-300">$1</li>')
            // 换行
            .replace(/\n\n/g, '</p><p class="text-slate-300 my-2">')
            .replace(/\n/g, '<br/>');

        return `<div class="prose prose-invert max-w-none"><p class="text-slate-300 my-2">${html}</p></div>`;
    }, []);

    // 插入 Markdown 语法
    const insertMarkdown = (syntax: string, wrap = false) => {
        const textarea = document.getElementById('md-editor') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = content.substring(start, end);

        let newContent: string;
        if (wrap && selected) {
            newContent = content.substring(0, start) + syntax.replace('$1', selected) + content.substring(end);
        } else {
            newContent = content.substring(0, start) + syntax + content.substring(end);
        }

        setContent(newContent);
        setTimeout(() => {
            textarea.focus();
            const newPos = start + syntax.indexOf('$1') > -1 ? start + syntax.indexOf('$1') : start + syntax.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const toolbarButtons = [
        { icon: Heading1, action: () => insertMarkdown('# '), title: '一级标题' },
        { icon: Heading2, action: () => insertMarkdown('## '), title: '二级标题' },
        { icon: Heading3, action: () => insertMarkdown('### '), title: '三级标题' },
        { divider: true },
        { icon: Bold, action: () => insertMarkdown('**$1**', true), title: '粗体' },
        { icon: Italic, action: () => insertMarkdown('*$1*', true), title: '斜体' },
        { icon: Code, action: () => insertMarkdown('`$1`', true), title: '行内代码' },
        { divider: true },
        { icon: Link, action: () => insertMarkdown('[链接文字](url)'), title: '链接' },
        { icon: Image, action: () => insertMarkdown('![图片描述](url)'), title: '图片' },
        { icon: Quote, action: () => insertMarkdown('> '), title: '引用' },
        { divider: true },
        { icon: List, action: () => insertMarkdown('- '), title: '无序列表' },
        { icon: ListOrdered, action: () => insertMarkdown('1. '), title: '有序列表' },
    ];

    return (
        <GlassCard className="p-0 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-1 flex-wrap">
                    {toolbarButtons.map((btn, idx) =>
                        btn.divider ? (
                            <div key={idx} className="w-px h-6 bg-white/10 mx-1" />
                        ) : (
                            <button
                                key={idx}
                                onClick={btn.action}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                title={btn.title}
                            >
                                {btn.icon && <btn.icon size={16} />}
                            </button>
                        )
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Preview Mode Toggle */}
                    <div className="flex items-center bg-white/5 rounded-lg p-0.5">
                        <button
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-1.5 rounded transition-colors ${previewMode === 'desktop' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
                            title="桌面预览"
                        >
                            <Monitor size={14} />
                        </button>
                        <button
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-1.5 rounded transition-colors ${previewMode === 'mobile' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
                            title="移动端预览"
                        >
                            <Smartphone size={14} />
                        </button>
                        <button
                            onClick={() => setPreviewMode('both')}
                            className={`p-1.5 rounded transition-colors ${previewMode === 'both' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
                            title="双端对比"
                        >
                            <Columns size={14} />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        title={showPreview ? '隐藏预览' : '显示预览'}
                    >
                        {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>

                    <button
                        onClick={() => onSave?.(content)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 text-white rounded-lg hover:bg-violet-400 transition-colors"
                    >
                        <Save size={14} />
                        保存
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className={`flex ${showPreview ? '' : 'flex-col'}`}>
                {/* Editor */}
                <div className={`${showPreview ? 'w-1/2 border-r border-white/10' : 'w-full'}`}>
                    <textarea
                        id="md-editor"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="在这里编写 Markdown 内容..."
                        className="w-full h-[500px] px-4 py-3 bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
                    />
                </div>

                {/* Preview */}
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-1/2 h-[500px] overflow-y-auto"
                    >
                        <div className="flex gap-4 p-4 h-full">
                            {/* Desktop Preview */}
                            <div className={`flex-1 ${previewMode === 'mobile' ? 'hidden' : ''}`}>
                                <div className="text-xs text-slate-500 mb-2 text-center">桌面端</div>
                                <div
                                    className="bg-slate-800 rounded-lg p-4 h-full overflow-y-auto"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                                />
                            </div>
                            {/* Mobile Preview */}
                            <div className={`${previewMode === 'desktop' ? 'hidden' : ''}`}>
                                <div className="text-xs text-slate-500 mb-2 text-center">移动端</div>
                                <div className="w-[375px] mx-auto">
                                    <div className="bg-slate-900 rounded-3xl p-2 border-4 border-slate-700">
                                        <div className="bg-slate-800 rounded-2xl h-[400px] overflow-y-auto p-3">
                                            <div
                                                className="text-sm"
                                                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </GlassCard>
    );
};
