
import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "../../lib/utils";
import { Link } from "react-router-dom";

export const Dock = ({ className, items = [] }) => {
    const mouseX = useMotionValue(Infinity);

    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={cn(
                "mx-auto flex h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 shadow-lg",
                className
            )}
        >
            {items.map((item, i) => (
                <DockIcon mouseX={mouseX} key={i} {...item} />
            ))}
        </motion.div>
    );
};

function DockIcon({ mouseX, icon: Icon, href, label, badge }) {
    const ref = useRef(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <Link to={href} className="relative">
            <motion.div
                ref={ref}
                style={{ width }}
                className="aspect-square w-10 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-neutral-700 transition-colors relative"
                title={label}
            >
                <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                {badge > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background"
                    >
                        {badge}
                    </motion.span>
                )}
            </motion.div>
        </Link>
    );
}
