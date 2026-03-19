import React from 'react';
import { motion } from 'framer-motion';

/**
 * Lumo Logo Component System
 * Adapted for React/Vite/Tailwind
 */

const VARIANTS = {
  default: {
    stop1: '#6366F1', // Indigo 500
    stop2: '#3B82F6', // Blue 500
    text: 'text-primary'
  },
  white: {
    stop1: '#FFFFFF',
    stop2: '#FFFFFF',
    text: 'text-white'
  },
  dark: {
    stop1: '#1E293B', // Slate 800
    stop2: '#334155', // Slate 700
    text: 'text-slate-900'
  }
};

export const LumoIcon = ({ size = 40, variant = 'default', className = '' }) => {
  const colors = VARIANTS[variant] || VARIANTS.default;
  const gradientId = `lumoGradientIcon-${variant}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Lumo Icon"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: colors.stop1, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: colors.stop2, stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Outer Circle */}
      <circle 
        cx="80" 
        cy="80" 
        r="70" 
        stroke={`url(#${gradientId})`} 
        strokeWidth="12" 
        fill="none" 
      />
      
      {/* Inner V-Shape / Compass / Bird */}
      <path
        d="M45 65C45 65 65 110 80 110C95 110 115 65 115 65"
        stroke={`url(#${gradientId})`}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Center Dot */}
      <circle 
        cx="80" 
        cy="80" 
        r="15" 
        fill={`url(#${gradientId})`} 
      />
    </svg>
  );
};

export const LumoLogo = ({ width = 120, height = 40, variant = 'default', className = '' }) => {
  const colors = VARIANTS[variant] || VARIANTS.default;
  const gradientId = `lumoGradientLogo-${variant}`;

  // Maintain aspect ratio: 160 (icon) + space + 280 (text) = 480 total width for 160 height viewBox
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 480 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Lumo Logo"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: colors.stop1, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: colors.stop2, stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Icon Part */}
      <g transform="translate(0, 0)">
        <circle cx="80" cy="80" r="70" stroke={`url(#${gradientId})`} strokeWidth="12" fill="none" />
        <path
          d="M45 65C45 65 65 110 80 110C95 110 115 65 115 65"
          stroke={`url(#${gradientId})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="80" cy="80" r="15" fill={`url(#${gradientId})`} />
      </g>

      {/* Text Part */}
      <text 
        x="180" 
        y="115" 
        fontFamily="Inter, system-ui, sans-serif" 
        fontSize="110" 
        fontWeight="800" 
        fill={variant === 'white' ? '#FFFFFF' : `url(#${gradientId})`}
        letterSpacing="-4"
      >
        Lumo
      </text>
    </svg>
  );
};

export const ResponsiveLumoLogo = ({ variant = 'default', className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Mobile: Icon only */}
      <div className="block md:hidden">
        <LumoIcon size={32} variant={variant} />
      </div>
      {/* Desktop/Tablet: Full Logo */}
      <div className="hidden md:block">
        <LumoLogo width={140} height={46} variant={variant} />
      </div>
    </div>
  );
};

export const AnimatedLumoLogo = ({ width = 120, height = 40, variant = 'default', className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-block cursor-pointer ${className}`}
    >
      <LumoLogo width={width} height={height} variant={variant} />
    </motion.div>
  );
};

export default LumoLogo;
