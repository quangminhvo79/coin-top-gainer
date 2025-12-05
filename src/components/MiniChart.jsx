import { useMemo } from 'react';

function MiniChart({ data, color = '#10b981' }) {
  const pathData = useMemo(() => {
    if (!data || data.length === 0) return '';

    const width = 300;
    const height = 80;
    const padding = 5;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [data]);

  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <svg
      viewBox="0 0 300 80"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill area under the line */}
      <path
        d={`${pathData} L 295,75 L 5,75 Z`}
        fill={`url(#${gradientId})`}
        className="transition-all duration-300"
      />

      {/* Line */}
      <path
        d={pathData}
        className="chart-line transition-all duration-300"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />

      {/* Dots on endpoints */}
      <circle
        cx={data && data.length > 0 ? 5 : 0}
        cy={data && data.length > 0 ? 75 - ((data[0] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * 70 : 0}
        r="2"
        fill={color}
        opacity="0.5"
      />
      <circle
        cx={data && data.length > 0 ? 295 : 0}
        cy={data && data.length > 0 ? 75 - ((data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1)) * 70 : 0}
        r="3"
        fill={color}
        className="animate-pulse"
      />
    </svg>
  );
}

export default MiniChart;
