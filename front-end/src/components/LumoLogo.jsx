import React from 'react';
import { motion } from 'framer-motion';

/**
 * Lumo Logo Component System - Sun & Wave Design
 * Optimized with currentColor for automatic light/dark mode support.
 */

export const LumoIcon = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-colors duration-300`}
      role="img"
      aria-label="Lumo Icon"
    >
      {/* Outer Circle */}
      <circle 
        cx="80" 
        cy="80" 
        r="70" 
        stroke="currentColor" 
        strokeWidth="10" 
        fill="none" 
      />
      
      {/* Wave Line */}
      <path
        d="M40 105C55 115 75 115 85 105C95 95 110 95 125 105"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Sun Semi-circle */}
      <path
        d="M55 85C55 72 66 61 80 61C94 61 105 72 105 85"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Sun Rays */}
      <line x1="80" y1="46" x2="80" y2="38" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <line x1="61" y1="54" x2="57" y2="48" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <line x1="99" y1="54" x2="103" y2="48" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
};

export const LumoLogo = ({ width = 120, height = 40, className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 480 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-colors duration-300`}
      role="img"
      aria-label="Lumo Logo"
    >
      {/* Icon Part */}
      <g transform="translate(0, 0)">
        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="none" />
        <path
          d="M40 105C55 115 75 105 85 105C95 105 110 95 125 105"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M55 85C55 72 66 61 80 61C94 61 105 72 105 85"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <line x1="80" y1="46" x2="80" y2="38" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="61" y1="54" x2="57" y2="48" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="99" y1="54" x2="103" y2="48" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      </g>

      {/* Text Part */}
      <text 
        x="180" 
        y="115" 
        fontFamily="Inter, system-ui, sans-serif" 
        fontSize="110" 
        fontWeight="800" 
        fill="currentColor"
        letterSpacing="-5"
      >
        Lumo
      </text>
    </svg>
  );
};

export const ResponsiveLumoLogo = ({ className = '' }) => {
  return (
    <div className={`flex items-center text-foreground ${className}`}>
      <div className="block md:hidden">
        <LumoIcon size={32} />
      </div>
      <div className="hidden md:block">
        <LumoLogo width={120} height={40} />
      </div>
    </div>
  );
};

export const AnimatedLumoLogo = ({ width = 120, height = 40, className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-block cursor-pointer text-foreground ${className}`}
    >
      <LumoLogo width={width} height={height} />
    </motion.div>
  );
};

export default LumoLogo;
