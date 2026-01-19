import { Code, Cpu, Leaf } from "lucide-react";

export interface ProjectData {
    id: string;
    name: string;
    description: string;
    tags: string[];
    metrics: {
        creativity: number;
        techDepth: number;
        utility: number;
        design: number;
        completeness: number;
    };
    icon: any;
    color: string;
}

export const projects: ProjectData[] = [
    {
        id: "ecolens",
        name: "EcoLens",
        description: "Smart waste classification powered by Edge AI. Supports offline recognition and real-time guidance.",
        tags: ["Edge AI", "React", "ESA Pages", "TensorFlow.js"],
        metrics: {
            creativity: 90,
            techDepth: 85,
            utility: 95,
            design: 80,
            completeness: 88,
        },
        icon: Leaf,
        color: "#22c55e", // green-500
    },
    {
        id: "edge-ai-pro",
        name: "EdgeAI Pro",
        description: "Comprehensive edge computing assistant with 120+ offline features. Integrating LLM at the edge.",
        tags: ["Python", "Edge Computing", "LLM", "Offline-First"],
        metrics: {
            creativity: 85,
            techDepth: 98,
            utility: 90,
            design: 75,
            completeness: 92,
        },
        icon: Cpu,
        color: "#3b82f6", // blue-500
    },
    {
        id: "story-weaver",
        name: "StoryWeaver AI",
        description: "Interactive fiction platform where AI generates infinite storylines based on user choices.",
        tags: ["AI Generation", "Next.js", "Creative Writing"],
        metrics: {
            creativity: 100,
            techDepth: 80,
            utility: 70,
            design: 95,
            completeness: 80,
        },
        icon: Code,
        color: "#8b5cf6", // violet-500
    },
];
