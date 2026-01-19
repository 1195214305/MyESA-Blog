import { useState, useRef } from "react";
import { Volume2, VolumeX, Loader2, Pause, Play } from "lucide-react";

interface TextToSpeechProps {
    text: string;
    className?: string;
}

export const TextToSpeech = ({ text, className = '' }: TextToSpeechProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const speak = () => {
        if (!text.trim()) return;

        // 检查浏览器支持
        if (!('speechSynthesis' in window)) {
            alert('您的浏览器不支持语音合成功能');
            return;
        }

        // 如果正在播放，暂停/继续
        if (isPlaying) {
            if (isPaused) {
                window.speechSynthesis.resume();
                setIsPaused(false);
            } else {
                window.speechSynthesis.pause();
                setIsPaused(true);
            }
            return;
        }

        setLoading(true);

        // 创建语音实例
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // 设置中文语音
        const voices = window.speechSynthesis.getVoices();
        const chineseVoice = voices.find(v => v.lang.includes('zh')) || voices[0];
        if (chineseVoice) {
            utterance.voice = chineseVoice;
        }

        utterance.lang = 'zh-CN';
        utterance.rate = 1;
        utterance.pitch = 1;

        utterance.onstart = () => {
            setLoading(false);
            setIsPlaying(true);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };

        utterance.onerror = () => {
            setLoading(false);
            setIsPlaying(false);
            setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const stop = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <button
                onClick={speak}
                disabled={loading}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                title={isPlaying ? (isPaused ? '继续播放' : '暂停') : '朗读文章'}
            >
                {loading ? (
                    <Loader2 size={12} className="animate-spin" />
                ) : isPlaying ? (
                    isPaused ? <Play size={12} /> : <Pause size={12} />
                ) : (
                    <Volume2 size={12} />
                )}
                <span>{isPlaying ? (isPaused ? '继续' : '暂停') : '朗读'}</span>
            </button>

            {isPlaying && (
                <button
                    onClick={stop}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="停止"
                >
                    <VolumeX size={14} />
                </button>
            )}
        </div>
    );
};
