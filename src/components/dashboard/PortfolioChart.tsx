import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

interface ChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface PortfolioChartProps {
  data: ChartData[];
  totalValue: number;
  title?: string;
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  data,
  totalValue,
  title = 'Distribuição do Portfolio',
}) => {
  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalValue);

  // Calculate angles for pie chart
  let cumulativePercentage = 0;
  const segments = data.map(item => {
    const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
    cumulativePercentage += item.percentage;
    const endAngle = cumulativePercentage * 3.6;
    return { ...item, startAngle, endAngle };
  });

  return (
    <Card variant="glass" className="animate-fadeIn">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle variant="gradient" size="xl">
            {title}
          </CardTitle>
          <Badge variant="gradient" size="lg">
            {formattedTotal}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* SVG Pie Chart */}
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full transform -rotate-90"
              >
                {segments.map((segment, index) => (
                  <PieSegment
                    key={index}
                    {...segment}
                    index={index}
                    total={segments.length}
                  />
                ))}
              </svg>
              
              {/* Center Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Valor Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formattedTotal}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-4">
            {data.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg',
                  'bg-gray-50 dark:bg-gray-800/50',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'transition-all duration-200',
                  'animate-slideInRight'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(item.value)}
                  </span>
                  <Badge variant="default" size="sm">
                    {item.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PieSegmentProps extends ChartData {
  startAngle: number;
  endAngle: number;
  index: number;
  total: number;
}

const PieSegment: React.FC<PieSegmentProps> = ({
  startAngle,
  endAngle,
  color,
  percentage,
  index,
}) => {
  const radius = 80;
  const innerRadius = 50;
  
  // Convert angles to radians
  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad = (endAngle * Math.PI) / 180;
  
  // Calculate path
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  const startX = 100 + radius * Math.cos(startAngleRad);
  const startY = 100 + radius * Math.sin(startAngleRad);
  const endX = 100 + radius * Math.cos(endAngleRad);
  const endY = 100 + radius * Math.sin(endAngleRad);
  
  const innerStartX = 100 + innerRadius * Math.cos(startAngleRad);
  const innerStartY = 100 + innerRadius * Math.sin(startAngleRad);
  const innerEndX = 100 + innerRadius * Math.cos(endAngleRad);
  const innerEndY = 100 + innerRadius * Math.sin(endAngleRad);
  
  const pathData = [
    `M ${startX} ${startY}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
    `L ${innerEndX} ${innerEndY}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
    `Z`
  ].join(' ');

  return (
    <g>
      <path
        d={pathData}
        fill={color}
        className={cn(
          'transition-all duration-300 cursor-pointer',
          'hover:opacity-80 hover:scale-105'
        )}
        style={{
          transformOrigin: '100px 100px',
          animation: `scaleIn 0.6s ease-out ${index * 0.1}s both`,
        }}
      />
      {/* Show percentage for larger segments */}
      {percentage > 10 && (
        <text
          x={100 + ((radius + innerRadius) / 2) * Math.cos((startAngleRad + endAngleRad) / 2)}
          y={100 + ((radius + innerRadius) / 2) * Math.sin((startAngleRad + endAngleRad) / 2)}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-sm font-semibold pointer-events-none"
          transform={`rotate(90 ${100 + ((radius + innerRadius) / 2) * Math.cos((startAngleRad + endAngleRad) / 2)} ${100 + ((radius + innerRadius) / 2) * Math.sin((startAngleRad + endAngleRad) / 2)})`}
        >
          {percentage.toFixed(0)}%
        </text>
      )}
    </g>
  );
};

// Simple Bar Chart Component
interface BarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  title?: string;
  maxValue?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title = 'Performance Mensal',
  maxValue,
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <Card variant="glass" className="animate-fadeIn">
      <CardHeader>
        <CardTitle variant="gradient" size="lg">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(item.value)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000 ease-out',
                    'animate-scaleX'
                  )}
                  style={{
                    width: `${(item.value / max) * 100}%`,
                    backgroundColor: item.color || '#3B82F6',
                    animationDelay: `${index * 100}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Sparkline Chart Component
export const Sparkline: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = '#10B981', height = 40 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((max - value) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      className="w-full"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        className="animate-drawLine"
      />
      <polygon
        points={`0,${height} ${points} 100,${height}`}
        fill={color}
        opacity="0.1"
        className="animate-fadeIn"
      />
    </svg>
  );
};