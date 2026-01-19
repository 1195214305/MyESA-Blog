import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Search, List, Heart } from "lucide-react";
import { GlassCard } from "./ui/glass-card";
import { searchJamendoTracks, getPopularTracks, type JamendoTrack } from "@/services/api";
import { Howl } from "howler";

export const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<JamendoTrack | null>(null);
    const [playlist, setPlaylist] = useState<JamendoTrack[]>([]);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<JamendoTrack[]>([]);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [loading, setLoading] = useState(true);

    const soundRef = useRef<Howl | null>(null);
    const progressInterval = useRef<number | null>(null);

    // 加载热门歌曲
    useEffect(() => {
        loadPopularTracks();
    }, []);

    const loadPopularTracks = async () => {
        setLoading(true);
        try {
            const tracks = await getPopularTracks(20);
            setPlaylist(tracks);
            if (tracks.length > 0) {
                setCurrentTrack(tracks[0]);
            }
        } catch (error) {
            console.error("Failed to load tracks:", error);
        } finally {
            setLoading(false);
        }
    };

    // 播放歌曲
    const playTrack = (track: JamendoTrack) => {
        // 停止当前播放
        if (soundRef.current) {
            soundRef.current.stop();
            soundRef.current.unload();
        }
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }

        setCurrentTrack(track);

        const sound = new Howl({
            src: [track.audio],
            html5: true,
            volume: isMuted ? 0 : volume,
            onplay: () => {
                setIsPlaying(true);
                setDuration(sound.duration());
                progressInterval.current = window.setInterval(() => {
                    setProgress(sound.seek() as number);
                }, 1000);
            },
            onend: () => {
                playNext();
            },
            onloaderror: () => {
                console.error("Failed to load track");
                playNext();
            }
        });

        soundRef.current = sound;
        sound.play();
    };

    // 播放/暂停
    const togglePlay = () => {
        if (!soundRef.current && currentTrack) {
            playTrack(currentTrack);
            return;
        }

        if (soundRef.current) {
            if (isPlaying) {
                soundRef.current.pause();
                setIsPlaying(false);
            } else {
                soundRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    // 上一首
    const playPrev = () => {
        if (!currentTrack || playlist.length === 0) return;
        const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
        playTrack(playlist[prevIndex]);
    };

    // 下一首
    const playNext = () => {
        if (!currentTrack || playlist.length === 0) return;
        const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
        const nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
        playTrack(playlist[nextIndex]);
    };

    // 音量控制
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (soundRef.current) {
            soundRef.current.volume(newVolume);
        }
        if (newVolume > 0) setIsMuted(false);
    };

    // 静音切换
    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (soundRef.current) {
            soundRef.current.volume(isMuted ? volume : 0);
        }
    };

    // 进度拖动
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const seekTime = parseFloat(e.target.value);
        setProgress(seekTime);
        if (soundRef.current) {
            soundRef.current.seek(seekTime);
        }
    };

    // 搜索歌曲
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        const results = await searchJamendoTracks(searchQuery);
        setSearchResults(results);
    };

    // 格式化时间
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <GlassCard className="p-4 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-violet-500/20">
                        <Music className="w-5 h-5 text-violet-400" />
                    </div>
                    <h3 className="font-bold text-lg text-white">🎵 星河乐章</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-violet-500/30 text-violet-300' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Search size={18} />
                    </button>
                    <button
                        onClick={() => setShowPlaylist(!showPlaylist)}
                        className={`p-2 rounded-lg transition-colors ${showPlaylist ? 'bg-violet-500/30 text-violet-300' : 'text-slate-400 hover:text-white'}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Search Panel */}
            {showSearch && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 space-y-2"
                >
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="搜索歌曲..."
                            className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-400"
                        >
                            搜索
                        </button>
                    </div>
                    {searchResults.length > 0 && (
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {searchResults.map((track) => (
                                <div
                                    key={track.id}
                                    onClick={() => {
                                        playTrack(track);
                                        if (!playlist.find(t => t.id === track.id)) {
                                            setPlaylist([...playlist, track]);
                                        }
                                    }}
                                    className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                                >
                                    <img src={track.image} alt="" className="w-8 h-8 rounded" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{track.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{track.artist_name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Current Track Info */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : currentTrack ? (
                <div className="flex items-center gap-4 mb-4">
                    <img
                        src={currentTrack.image || '/placeholder-album.png'}
                        alt={currentTrack.name}
                        className="w-16 h-16 rounded-lg object-cover shadow-lg"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{currentTrack.name}</p>
                        <p className="text-sm text-slate-400 truncate">{currentTrack.artist_name}</p>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-pink-400 transition-colors">
                        <Heart size={18} />
                    </button>
                </div>
            ) : (
                <p className="text-center text-slate-400 py-4">暂无歌曲</p>
            )}

            {/* Progress Bar */}
            <div className="mb-4">
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:rounded-full"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <button onClick={playPrev} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <SkipBack size={20} />
                </button>
                <button
                    onClick={togglePlay}
                    className="p-4 bg-violet-500 text-white rounded-full hover:bg-violet-400 transition-colors shadow-lg"
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button onClick={playNext} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <SkipForward size={20} />
                </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 mt-4">
                <button onClick={toggleMute} className="text-slate-400 hover:text-white">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
            </div>

            {/* Playlist Panel */}
            {showPlaylist && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 max-h-48 overflow-y-auto"
                >
                    <h4 className="text-sm font-medium text-white mb-2">播放列表 ({playlist.length})</h4>
                    <div className="space-y-1">
                        {playlist.map((track, idx) => (
                            <div
                                key={track.id}
                                onClick={() => playTrack(track)}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${currentTrack?.id === track.id ? 'bg-violet-500/20' : 'hover:bg-white/5'
                                    }`}
                            >
                                <span className="w-6 text-xs text-slate-500">{idx + 1}</span>
                                <img src={track.image} alt="" className="w-8 h-8 rounded" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{track.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{track.artist_name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </GlassCard>
    );
};
