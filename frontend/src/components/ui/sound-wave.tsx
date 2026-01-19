import { motion } from "framer-motion";

export const SoundWave = () => {
    // Generate random heights for the bars to simulate a sound wave
    const bars = Array.from({ length: 40 }, () => ({
        height: Math.random() * 0.8 + 0.2, // 20% to 100% height
        delay: Math.random() * 0.5,
    }));

    return (
        <div className="flex items-center justify-center gap-[2px] h-16 w-full overflow-hidden mask-image-linear-gradient">
            {bars.map((bar, i) => (
                <motion.div
                    key={i}
                    initial={{ scaleY: 0.2 }}
                    animate={{ scaleY: [bar.height, bar.height * 0.5, bar.height] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: bar.delay,
                        ease: "easeInOut",
                    }}
                    className="w-1.5 bg-indigo-500/80 rounded-full"
                    style={{ height: "100%" }}
                />
            ))}
        </div>
    );
};
