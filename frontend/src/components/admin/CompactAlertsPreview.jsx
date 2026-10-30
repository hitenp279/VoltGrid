import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import { BellRing, ArrowRight, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function CompactAlertsPreview() {
  const { events, isCritical, setAdminNavTab } = useGridApp();

  // Intelligent filter for Overview preview:
  // 1. Filter out repetitive routine success spam ("Active charging completed...", etc.)
  // 2. Prioritize Warnings, Critical, Load Shedding, Faults, and AI Decision changes
  const meaningfulEvents = React.useMemo(() => {
    const isTrivialSuccess = (msg) => {
      const lower = msg.toLowerCase();
      return lower.includes('active charging completed') || lower.includes('charging session finalized');
    };

    const isHighPriority = (evt) => {
      if (evt.type === 'WARNING' || evt.type === 'CRITICAL') return true;
      const lower = (evt.message || '').toLowerCase();
      return (
        lower.includes('overload') ||
        lower.includes('throttle') ||
        lower.includes('shed') ||
        lower.includes('fault') ||
        lower.includes('offline') ||
        lower.includes('temperature') ||
        lower.includes('curtail')
      );
    };

    // Filter out trivial repeated completions
    const relevant = events.filter(evt => !isTrivialSuccess(evt.message));

    // Sort so high priority / critical events come first, then most recent
    const sorted = [...relevant].sort((a, b) => {
      const aPrio = isHighPriority(a) ? 1 : 0;
      const bPrio = isHighPriority(b) ? 1 : 0;
      return bPrio - aPrio;
    });

    return sorted.slice(0, 3);
  }, [events]);

  const getEventBadge = (type) => {
    switch (type) {
      case 'WARNING':
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      case 'SUCCESS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'INFO':
      default:
        return 'bg-[#F1E9DA] text-[#172A46] border-[#D8C7AF] dark:bg-[#162740] dark:text-[#E8DCC8] dark:border-[#263E63]';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'WARNING':
      case 'CRITICAL':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-[#172A46] dark:text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="bg-[#FFF9EE] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-2xl shadow-xs p-6 space-y-4 font-sans transition-colors">
      
      {/* Header & Link */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D8C7AF]/60 dark:border-[#1E3352]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
                Recent Operational Alerts
              </h3>
              {isCritical && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono">
              High-priority SCADA alarms & telemetry flags
            </p>
          </div>
        </div>

        <button
          onClick={() => setAdminNavTab('alerts')}
          className="text-xs font-mono font-bold text-[#172A46] hover:text-[#233A5E] dark:text-[#E8DCC8] dark:hover:text-[#FFF8EA] flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>View All Alerts</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Divided Meaningful Events Stream */}
      <div className="divide-y divide-[#D8C7AF]/50 dark:divide-[#1E3352]/50">
        {meaningfulEvents.length === 0 ? (
          <p className="text-xs text-[#556880] dark:text-[#8CA2BF] font-mono py-4 text-center">
            Feeder telemetry normal. Zero active alarms.
          </p>
        ) : (
          meaningfulEvents.map(evt => (
            <div
              key={evt.id}
              className="py-3 first:pt-1 last:pb-1 flex items-start gap-3 text-xs font-mono"
            >
              <div className="mt-0.5">{getEventIcon(evt.type)}</div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getEventBadge(evt.type)}`}>
                      {evt.type}
                    </span>
                    <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF]">
                      {evt.source || 'SCADA Core'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] tabular-nums">
                    {evt.timestamp}
                  </span>
                </div>
                <p className="text-[#172A46] dark:text-[#FFF8EA] text-xs font-sans truncate leading-relaxed font-medium">
                  {evt.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
