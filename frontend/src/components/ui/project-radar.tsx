import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

interface ProjectRadarProps {
    metrics: {
        creativity: number;
        techDepth: number;
        utility: number;
        design: number;
        completeness: number;
    };
    color: string;
}

export const ProjectRadar = ({ metrics, color }: ProjectRadarProps) => {
    const data = useMemo(
        () => [
            { subject: "Creativity", A: metrics.creativity, fullMark: 100 },
            { subject: "Tech Depth", A: metrics.techDepth, fullMark: 100 },
            { subject: "Utility", A: metrics.utility, fullMark: 100 },
            { subject: "Design", A: metrics.design, fullMark: 100 },
            { subject: "Completeness", A: metrics.completeness, fullMark: 100 },
        ],
        [metrics]
    );

    return (
        <div className="w-full h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="rgba(255,255,255,0.2)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "rgba(100,116,139,0.8)", fontSize: 10 }}
                    />
                    <Radar
                        name="Project Metrics"
                        dataKey="A"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
