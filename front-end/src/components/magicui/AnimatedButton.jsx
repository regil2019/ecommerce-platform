
import React from "react";
import { cn } from "../../lib/utils";

export const AnimatedButton = ({
    children,
    className,
    ...props
}) => {
    return (
        <button
            className={cn(
                "group relative flex transform-gpu items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md border border-white/10 bg-white/5 px-8 py-2 text-base/7 font-medium text-white transition-all duration-300 hover:bg-white/10 hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                className,
            )}
            {...props}
        >
            <span
                className={cn(
                    "absolute inset-0 -z-10 block bg-[linear-gradient(-75deg,hsl(var(--primary)/0.1)_calc(var(--x)+20%),hsl(var(--primary)/0.5)_calc(var(--x)+25%),hsl(var(--primary)/0.1)_calc(var(--x)+100%))] p-px mask-image-gradient-to-br from-transparent to-black",
                    "animate-shiny-button"
                )}
            />
            {children}
        </button>
    );
};
