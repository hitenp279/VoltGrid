import React, { useState } from 'react';
import { useGridApp } from '../../context/GridAppContext';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Filter
} from 'lucide-react';

export default function AlertsLogPanel() {
  const { events, isCritical } = useGridApp();
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'WARNING' | 'SUCCESS' | 'INFO'

  const filteredEvents = events.filter(evt => {
    if (filterType === 'ALL') return true;
    return evt.type === filterType;
  });

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'WARNING':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 font-bold';
      case 'SUCCESS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-bold';
      case 'INFO':
      default:
        return 'bg-[#E8DCC8] text-[#172A46] border-[#D8C7AF] dark:bg-[#162740] dark:text-[#E8DCC8] dark:border-[#263E63] font-bold';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-[#172A46] dark:text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-[#FFF8EA] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-2xl overflow-hidden shadow-xs transition-colors">
      
      {/* Header */}
      <div className="p-5 border-b border-[#D8C7AF] dark:border-[#1E3352] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA] flex items-center gap-2 tracking-tight">
              SCADA Events & AI Dispatch Logs
              {isCritical && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </h3>
            <p className="text-xs text-[#556880] dark:text-[#8CA2BF] mt-0.5 font-medium">Timestamped telemetry alerts and load management decision stream</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 text-xs font-mono p-1 bg-[#E8DCC8]/60 dark:bg-[#0B1422] rounded-lg border border-[#D8C7AF] dark:border-[#1E3352]">
          <span className="text-[#556880] dark:text-[#8CA2BF] px-2 flex items-center gap-1 text-[11px] font-bold">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['ALL', 'WARNING', 'SUCCESS', 'INFO'].map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                filterType === f
                  ? 'bg-[#172A46] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] shadow-xs'
                  : 'text-[#556880] hover:text-[#172A46] dark:text-[#8CA2BF] dark:hover:text-[#FFF8EA]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="divide-y divide-[#D8C7AF]/60 dark:divide-[#1E3352]/60 max-h-96 overflow-y-auto font-mono text-xs">
        {filteredEvents.length === 0 ? (
          <div className="p-10 text-center text-[#556880] dark:text-[#8CA2BF]">
            No events logged matching filter.
          </div>
        ) : (
          filteredEvents.map(evt => (
            <div key={evt.id} className="p-4 hover:bg-[#E8DCC8]/30 dark:hover:bg-[#162740]/50 transition-colors flex items-start gap-3.5">
              <div className="mt-0.5">
                {getIcon(evt.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${getBadgeStyle(evt.type)}`}>
                    {evt.type}
                  </span>
                  <span className="text-[#172A46] dark:text-[#FFF8EA] text-xs font-bold">{evt.source}</span>
                  <span className="text-[#556880] dark:text-[#8CA2BF]">•</span>
                  <span className="text-[#556880] dark:text-[#8CA2BF] text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#556880] dark:text-[#8CA2BF]" />
                    {evt.timestamp}
                  </span>
                </div>
                <p className="text-[#172A46] dark:text-[#E8DCC8] font-sans text-xs leading-relaxed font-medium">
                  {evt.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3.5 bg-[#E8DCC8]/60 dark:bg-[#0B1422]/90 border-t border-[#D8C7AF] dark:border-[#1E3352] flex items-center justify-between text-[11px] font-mono text-[#556880] dark:text-[#8CA2BF]">
        <span>Displaying {filteredEvents.length} log frames</span>
        <span>SCADA Node #05 Buffer</span>
      </div>

    </div>
  );
}
