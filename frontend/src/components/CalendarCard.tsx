import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/glass-card";
import { Calendar, Moon } from "lucide-react";

// 农历转换（简化版）
const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

// 简单的农历计算（近似）
function getLunarDate(date: Date): string {
    const baseDate = new Date(2024, 0, 22); // 2024年春节（农历正月初一）
    const diff = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const lunarDay = ((diff % 30) + 30) % 30;
    const lunarMonth = Math.floor(((diff % 360) + 360) / 30) % 12;
    return `${lunarMonths[lunarMonth]}月${lunarDays[lunarDay]}`;
}

// 节气（简化）
const solarTerms: Record<string, string> = {
    '01-05': '小寒', '01-20': '大寒',
    '02-04': '立春', '02-19': '雨水',
    '03-05': '惊蛰', '03-20': '春分',
    '04-04': '清明', '04-20': '谷雨',
    '05-05': '立夏', '05-21': '小满',
    '06-06': '芒种', '06-21': '夏至',
    '07-07': '小暑', '07-22': '大暑',
    '08-07': '立秋', '08-23': '处暑',
    '09-07': '白露', '09-23': '秋分',
    '10-08': '寒露', '10-23': '霜降',
    '11-07': '立冬', '11-22': '小雪',
    '12-07': '大雪', '12-22': '冬至',
};

export const CalendarCard = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const solarTerm = Object.entries(solarTerms).find(([key]) => {
        const [m, d] = key.split('-').map(Number);
        return Math.abs((now.getMonth() + 1) - m) === 0 && Math.abs(now.getDate() - d) <= 2;
    })?.[1];

    return (
        <GlassCard className="p-4">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="text-violet-400" size={18} />
                        <span className="text-slate-400 text-sm">今日</span>
                    </div>

                    {/* 公历日期 */}
                    <div className="text-4xl font-bold text-white font-kaiti">
                        {now.getDate()}
                    </div>
                    <div className="text-slate-300">
                        {now.getFullYear()}年{now.getMonth() + 1}月 · 周{weekDays[now.getDay()]}
                    </div>
                </div>

                <div className="text-right">
                    {/* 农历 */}
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                        <Moon size={14} />
                        <span className="font-kaiti">{getLunarDate(now)}</span>
                    </div>

                    {/* 节气 */}
                    {solarTerm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs"
                        >
                            {solarTerm}
                        </motion.div>
                    )}

                    {/* 时间 */}
                    <div className="text-2xl font-mono text-slate-300 mt-2">
                        {now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
