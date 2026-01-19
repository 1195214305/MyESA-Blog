import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
    code: string;
    language?: string;
    showLineNumbers?: boolean;
}

export const CodeBlock = ({ code, language = 'javascript', showLineNumbers = true }: CodeBlockProps) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const lines = code.split('\n');

    return (
        <div className="relative group rounded-lg overflow-hidden bg-slate-900 border border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-white/10">
                <span className="text-xs text-slate-400">{language}</span>
                <button
                    onClick={copyToClipboard}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${copied
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? '已复制' : '复制代码'}
                </button>
            </div>

            {/* Code */}
            <div className="overflow-x-auto">
                <pre className="p-4 text-sm">
                    <code>
                        {showLineNumbers ? (
                            lines.map((line, idx) => (
                                <div key={idx} className="flex">
                                    <span className="w-8 text-right pr-4 text-slate-600 select-none">
                                        {idx + 1}
                                    </span>
                                    <span className="text-slate-300">{line}</span>
                                </div>
                            ))
                        ) : (
                            <span className="text-slate-300">{code}</span>
                        )}
                    </code>
                </pre>
            </div>
        </div>
    );
};

// 一键复制按钮组件（用于任意文本）
export const CopyButton = ({ text, className = '' }: { text: string; className?: string }) => {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button
            onClick={copy}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${copied
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                } ${className}`}
        >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? '已复制' : '复制'}
        </button>
    );
};
