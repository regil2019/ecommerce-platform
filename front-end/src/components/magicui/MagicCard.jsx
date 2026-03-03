
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const MagicCard = ({
    className,
    children,
    size = 600,
    spotlightColor = "rgba(255,255,255,0.03)",
    ...props
}) => {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: -size, y: -size });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <motion.div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileHover={{ y: -8, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
                "relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm border border-border/50 transition-colors",
                className
            )}
            {...props}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-10"
                style={{
                    opacity,
                    background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
                }}
            />
            <div className="relative z-20 h-full flex flex-col">
                {children}
            </div>
        </motion.div>
    );
};
