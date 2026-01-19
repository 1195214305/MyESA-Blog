import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

type GlassCardProps = React.ComponentProps<typeof motion.div> & {
    children: React.ReactNode;
    className?: string; // Optional redundancy as it's in ComponentProps
    variant?: "default" | "dark";
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ children, className, variant = "default", ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={cn(
                    "relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl",
                    variant === "dark" && "bg-black/10 border-white/10",
                    className
                )}
                {...props}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
                <div className="relative z-10">{children}</div>
            </motion.div>
        );
    }
);

GlassCard.displayName = "GlassCard";
