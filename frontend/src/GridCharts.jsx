import React from 'react';

export default function GridCharts({ data, title, color = "stroke-blue-500", unit = "kW" }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-64 flex items-center justify-center text-slate-400">
        Waiting for incoming grid telemetry...
      </div>
    );
  }

  const maxVal = Math.max(...data, 100);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  // Map values to SVG coordinates (Width: 300, Height: 150)
  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1 || 1)) * 280 + 10;
      const y = 140 - ((val - minVal) / range) * 120;
      return `${x},${y}`;
    })
    .join(' ');

  const currentVal = data[data.length - 1];

  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-300 font-semibold text-lg">{title}</h3>
        <span className="text-2xl font-bold text-white">
          {currentVal} <span className="text-sm font-normal text-slate-400">{unit}</span>
        </span>
      </div>
      <div className="w-full h-40">
        <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible">
          {/* Grid lines */}
          <line x1="10" y1="20" x2="290" y2="20" stroke="#334155" strokeDasharray="4" />
          <line x1="10" y1="80" x2="290" y2="80" stroke="#334155" strokeDasharray="4" />
          <line x1="10" y1="140" x2="290" y2="140" stroke="#334155" strokeDasharray="4" />
          
          {/* Trend Polyline */}
          <polyline
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${color} transition-all duration-500`}
            points={points}
          />
        </svg>
      </div>
    </div>
  );
}