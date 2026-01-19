import { motion } from "framer-motion";

export const MeshGradient = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-blue-200/30 blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, -50, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-200/30 blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    y: [0, -50, 50, 0],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-pink-100/40 blur-[100px]"
            />
        </div>
    );
};
