import React from 'react';
import { useGridApp } from '../../context/GridAppContext';

export default function GridChartsEnhanced({
  data = [],
  title,
  unit = 'A',
  strokeColor = '#172A46',
  warningThreshold = null,
  criticalThreshold = null,
  minDomain = null,
  maxDomain = null,
  description = ''
}) {
  const { theme } = useGridApp();
  const isDark = theme === 'dark';

  if (!data || data.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF8EA] dark:bg-[#121F33] h-52 flex items-center justify-center text-[#556880] dark:text-[#8CA2BF] font-mono text-xs">
        Awaiting SCADA telemetry...
      </div>
    );
  }

  const currentVal = data[data.length - 1];
  const maxVal = maxDomain !== null ? maxDomain : Math.max(...data, (criticalThreshold || 30) * 1.1);
  const minVal = minDomain !== null ? minDomain : Math.min(...data, 0);
  const range = (maxVal - minVal) || 1;

  const width = 420;
  const height = 150;
  const paddingX = 8;
  const paddingTop = 12;
  const paddingBottom = 16;
  const usableHeight = height - paddingTop - paddingBottom;
  const usableWidth = width - (paddingX * 2);

  const coordinates = data.map((val, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * usableWidth;
    const y = paddingTop + usableHeight - ((val - minVal) / range) * usableHeight;
    return { x, y, val };
  });

  const pointsString = coordinates.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const warnY = warningThreshold !== null ? paddingTop + usableHeight - ((warningThreshold - minVal) / range) * usableHeight : null;
  const critY = criticalThreshold !== null ? paddingTop + usableHeight - ((criticalThreshold - minVal) / range) * usableHeight : null;

  const actualStroke = strokeColor === '#172A46' && isDark ? '#E8DCC8' : strokeColor;

  return (
    <div className="p-6 sm:p-7 rounded-2xl border border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF8EA] dark:bg-[#121F33] flex flex-col justify-between shadow-xs transition-colors space-y-4">
      
      {/* Header with Prominent Current Value */}
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#172A46] dark:text-[#FFF8EA] font-mono">{title}</h3>
          {description && <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] mt-0.5 font-medium">{description}</p>}
        </div>
        <div className="font-mono text-right flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">{currentVal}</span>
          <span className="text-xs font-bold text-[#556880] dark:text-[#8CA2BF]">{unit}</span>
        </div>
      </div>

      {/* Clean Technical SVG Line Chart */}
      <div className="w-full h-36 sm:h-40 relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Subtle grid lines */}
          <line x1={paddingX} y1={paddingTop} x2={width - paddingX} y2={paddingTop} stroke={isDark ? '#1E3352' : '#D8C7AF'} strokeDasharray="2 2" strokeWidth="1" />
          <line x1={paddingX} y1={paddingTop + (usableHeight / 2)} x2={width - paddingX} y2={paddingTop + (usableHeight / 2)} stroke={isDark ? '#1E3352' : '#D8C7AF'} strokeDasharray="2 2" strokeWidth="1" />
          <line x1={paddingX} y1={height - paddingBottom} x2={width - paddingX} y2={height - paddingBottom} stroke={isDark ? '#2B4770' : '#C4B296'} strokeWidth="1" />

          {/* Threshold caution line */}
          {warnY && warnY >= paddingTop && warnY <= height - paddingBottom && (
            <g>
              <line x1={paddingX} y1={warnY} x2={width - paddingX} y2={warnY} stroke="#d97706" strokeDasharray="3 3" strokeWidth="1" strokeOpacity="0.8" />
              <text x={width - paddingX} y={warnY - 3} fill="#d97706" fontSize="8" fontFamily="monospace" textAnchor="end">
                {warningThreshold} {unit} caution
              </text>
            </g>
          )}

          {/* Threshold critical limit line */}
          {critY && critY >= paddingTop && critY <= height - paddingBottom && (
            <g>
              <line x1={paddingX} y1={critY} x2={width - paddingX} y2={critY} stroke="#e11d48" strokeDasharray="3 3" strokeWidth="1" strokeOpacity="0.9" />
              <text x={width - paddingX} y={critY - 3} fill="#e11d48" fontSize="8" fontFamily="monospace" textAnchor="end">
                {criticalThreshold} {unit} limit
              </text>
            </g>
          )}

          {/* Precise data curve */}
          <polyline
            fill="none"
            stroke={actualStroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Real-time head marker */}
          <circle
            cx={coordinates[coordinates.length - 1].x}
            cy={coordinates[coordinates.length - 1].y}
            r="3.5"
            fill={actualStroke}
          />
        </svg>
      </div>

      {/* Axis footnote */}
      <div className="flex justify-between items-center text-[10px] font-mono text-[#556880] dark:text-[#8CA2BF] pt-3 border-t border-[#D8C7AF]/70 dark:border-[#1E3352]">
        <span>-45s rolling stream</span>
        <span>Min: {Math.min(...data)} {unit} • Max: {Math.max(...data)} {unit}</span>
        <span className="font-bold text-[#172A46] dark:text-[#FFF8EA]">Live: {currentVal} {unit}</span>
      </div>

    </div>
  );
}
