import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar = ({
  value = 0,
  max = 100,
  height = 'h-2',
  color = 'bg-blue-600',
  bgColor = 'bg-slate-100',
  className = '',
  animated = true
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full rounded-full overflow-hidden ${bgColor} ${height} ${className}`}>
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={animated ? { duration: 0.8, ease: 'easeOut' } : { duration: 0 }}
      />
    </div>
  );
};

export const CircularProgress = ({
  value = 0,
  size = 120,
  strokeWidth = 10,
  circleColor = 'stroke-blue-600',
  trailColor = 'stroke-slate-100',
  showLabel = true,
  labelSuffix = '%'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Track */}
        <circle
          className={`fill-none ${trailColor}`}
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Filled bar */}
        <motion.circle
          className={`fill-none transition-all duration-1000 ease-out ${circleColor}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showLabel && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-display text-slate-800">
            {value}
            <span className="text-sm font-semibold text-slate-500">{labelSuffix}</span>
          </span>
        </div>
      )}
    </div>
  );
};
