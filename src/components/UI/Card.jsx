import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = true,
  onClick
}) => {
  const cardClasses = `
    rounded-2xl p-6 transition-all duration-300
    ${glass ? 'glass-panel' : 'bg-white border border-slate-100'}
    ${hoverEffect ? 'hover:shadow-md hover:border-slate-300/80 hover:translate-y-[-2px] cursor-pointer' : 'shadow-sm'}
    ${className}
  `;

  if (onClick) {
    return (
      <motion.div
        whileHover={hoverEffect ? { y: -2 } : {}}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className={cardClasses}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between border-b border-slate-100 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-slate-100 pt-4 mt-4 ${className}`}>
    {children}
  </div>
);
