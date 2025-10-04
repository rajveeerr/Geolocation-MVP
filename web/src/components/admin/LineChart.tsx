import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  title: string;
  height?: number;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  title, 
  height = 200, 
  color = '#2563EB' 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-neutral-500">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;
  const padding = 40;
  const chartWidth = 400;
  const chartHeight = height - padding * 2;

  // Calculate points for the line
  const points = data.map((point, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
    const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
    return { x, y, value: point.value, label: point.label };
  });

  // Create SVG path for the line
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  // Create area path for fill
  const areaPathData = `${pathData} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>
      <div className="relative">
        <svg width={chartWidth} height={height} className="w-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + chartHeight * (1 - ratio);
            const value = minValue + range * ratio;
            return (
              <g key={index}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-neutral-500"
                >
                  {Math.round(value)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path
            d={areaPathData}
            fill={`${color}20`}
            stroke="none"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r={4}
                fill={color}
                stroke="white"
                strokeWidth={2}
              />
              {/* X-axis labels */}
              <text
                x={point.x}
                y={height - 10}
                textAnchor="middle"
                className="text-xs fill-neutral-500"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
