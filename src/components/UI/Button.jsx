import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon
}) => {
  const getVariantStyles = () => {
    if (disabled) {
      return 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed';
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10 border border-transparent';
      case 'secondary':
        return 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm';
      case 'purple':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/10 border border-transparent';
      case 'danger':
        return 'bg-rose-500 hover:bg-rose-600 text-white border border-transparent shadow-sm';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-100/80 text-slate-600 border border-transparent';
      case 'glass':
        return 'glass-panel text-blue-600 border-blue-100 hover:bg-blue-50/50 shadow-sm';
      default:
        return '';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5';
      case 'lg':
        return 'px-6 py-3 text-base font-bold rounded-2xl gap-2.5';
      case 'md':
      default:
        return 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2';
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { y: -1, scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`inline-flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${getVariantStyles()} ${getSizeStyles()} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
};
