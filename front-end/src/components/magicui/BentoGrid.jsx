
import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const BentoGrid = ({ className, children }) => {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className={cn(
                "grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto auto-rows-[20rem]",
                className
            )}
        >
            {children}
        </motion.div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    onClick,
}) => {
    return (
        <motion.div
            variants={itemVariants}
            className={cn(
                "row-span-1 rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-sm border border-black/5 dark:border-white/10 dark:bg-black bg-white justify-between flex flex-col space-y-4 cursor-pointer overflow-hidden relative",
                className
            )}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200 p-6 z-20">
                {icon}
                <div className="font-sans font-bold text-neutral-800 dark:text-neutral-100 mb-2 mt-2 text-xl">
                    {title}
                </div>
                <div className="font-sans font-normal text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                    {description}
                </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-black/80 pointer-events-none z-10" />
        </motion.div>
    );
};
