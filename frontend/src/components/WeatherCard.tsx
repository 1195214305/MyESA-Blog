import { useEffect, useState } from "react";
import { GlassCard } from "./ui/glass-card";
import { getWeather } from "@/services/api";
import { Cloud, RefreshCw } from "lucide-react";

export const WeatherCard = () => {
    const [weather, setWeather] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [city, setCity] = useState("Beijing");

    useEffect(() => {
        loadWeather();
    }, [city]);

    const loadWeather = async () => {
        setLoading(true);
        try {
            const data = await getWeather(city);
            setWeather(data);
        } catch (error) {
            console.error("Failed to fetch weather:", error);
            setWeather("获取失败");
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Cloud className="text-sky-400" size={18} />
                    <h3 className="font-medium text-white">🌤️ 天气</h3>
                </div>
                <button
                    onClick={loadWeather}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="flex items-center justify-between">
                <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-transparent text-sm text-slate-400 focus:outline-none cursor-pointer"
                >
                    <option value="Beijing">北京</option>
                    <option value="Shanghai">上海</option>
                    <option value="Guangzhou">广州</option>
                    <option value="Shenzhen">深圳</option>
                    <option value="Hangzhou">杭州</option>
                </select>
                <span className="text-lg font-bold text-white">
                    {loading ? "..." : weather}
                </span>
            </div>
        </GlassCard>
    );
};
