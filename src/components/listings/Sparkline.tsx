'use client';

import { motion } from 'framer-motion';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  showDots?: boolean;
  animated?: boolean;
}

export function Sparkline({ 
  data, 
  color = 'currentColor',
  height = 40,
  showDots = false,
  animated = true 
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const width = 100;
  const padding = 2;
  
  // Calculate points
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
    const y = height - ((value - min) / range) * (height - 2 * padding) - padding;
    return { x, y, value };
  });
  
  // Create SVG path
  const pathData = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      
      // Smooth curves using bezier
      const prevPoint = points[index - 1];
      const nextPoint = points[index + 1];
      
      const cp1x = prevPoint.x + (point.x - prevPoint.x) / 2;
      const cp1y = prevPoint.y;
      const cp2x = prevPoint.x + (point.x - prevPoint.x) / 2;
      const cp2y = point.y;
      
      return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
    })
    .join(' ');

  // Create area path (for gradient fill)
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const trend = data[data.length - 1] > data[0];
  const trendColor = trend ? 'rgb(34 197 94)' : 'rgb(239 68 68)'; // green-500 : red-500

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={trendColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill={`url(#gradient-${color})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={trendColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={animated ? { duration: 1, ease: 'easeInOut' } : undefined}
        />
        
        {/* Dots */}
        {showDots && points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={trendColor}
            initial={animated ? { scale: 0 } : undefined}
            animate={animated ? { scale: 1 } : undefined}
            transition={animated ? { delay: index * 0.1, type: 'spring' } : undefined}
          />
        ))}
        
        {/* Hover dots (always present but invisible) */}
        {points.map((point, index) => (
          <g key={`hover-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill="transparent"
              className="cursor-pointer"
            />
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={trendColor}
              initial={{ scale: 0 }}
              whileHover={{ scale: 1.5 }}
              className="pointer-events-none"
            />
          </g>
        ))}
      </svg>
      
      {/* Trend indicator */}
      <div className={`absolute top-0 right-0 flex items-center gap-1 text-xs font-medium ${trend ? 'text-green-500' : 'text-red-500'}`}>
        <motion.svg
          initial={{ rotate: trend ? -45 : 45 }}
          animate={{ rotate: trend ? 0 : 0 }}
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d={trend ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}
          />
        </motion.svg>
        {((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(1)}%
      </div>
    </div>
  );
}