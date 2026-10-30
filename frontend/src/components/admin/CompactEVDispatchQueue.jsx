import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import { ListOrdered, ArrowRight, Clock, BatteryCharging, Zap } from 'lucide-react';

export default function CompactEVDispatchQueue() {
  const { evQueue, isCritical, setAdminNavTab } = useGridApp();

  const totalActive = evQueue.length;
  const urgentCount = evQueue.filter(ev => ev.priority === 'URGENT').length;
  const flexibleCount = evQueue.filter(ev => ev.priority === 'FLEXIBLE').length;
  const throttledCount = evQueue.filter(ev => ev.throttled).length;

  // Single most urgent vehicle for the spotlight summary
  const mostUrgentEv = evQueue.find(ev => ev.priority === 'URGENT') || evQueue[0];
  const secondaryQueue = evQueue.filter(ev => ev.id !== mostUrgentEv?.id).slice(0, 2);

  return (
    <div className="bg-[#FFF9EE] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-2xl shadow-xs p-6 space-y-4 font-sans transition-colors h-full flex flex-col justify-between">
      
      {/* Header & Link */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D8C7AF]/60 dark:border-[#1E3352]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
              EV Priority Dispatch
            </h3>
            <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono">
              Feeder EV Queue · Deadline Scheduling
            </p>
          </div>
        </div>

        <button
          onClick={() => setAdminNavTab('ev-queue')}
          className="text-xs font-mono font-bold text-[#172A46] hover:text-[#233A5E] dark:text-[#E8DCC8] dark:hover:text-[#FFF8EA] flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>View Priority Queue</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Integrated Allocation Metrics Bar */}
      <div className="py-2.5 px-3 bg-[#F1E9DA]/50 dark:bg-[#0B1422]/60 border-y border-[#D8C7AF]/60 dark:border-[#1E3352]/60 rounded-lg flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[#556880] dark:text-[#8CA2BF] uppercase text-[10px] font-bold">Queue:</span>
            <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold">{totalActive} Active</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-[#D8C7AF]/70 dark:border-[#1E3352]/70 pl-3 sm:pl-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span className="text-amber-800 dark:text-amber-300 font-bold">{urgentCount} Urgent</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-[#D8C7AF]/70 dark:border-[#1E3352]/70 pl-3 sm:pl-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#172A46] dark:bg-blue-400"></span>
            <span className="text-[#172A46] dark:text-blue-300 font-bold">{flexibleCount} Flexible</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-[#D8C7AF]/70 dark:border-[#1E3352]/70 pl-3 sm:pl-4">
            <span className={`w-1.5 h-1.5 rounded-full ${throttledCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-[#556880]'}`}></span>
            <span className={throttledCount > 0 ? 'text-rose-700 dark:text-rose-300 font-bold' : 'text-[#556880] dark:text-[#8CA2BF]'}>
              {throttledCount} Throttled
            </span>
          </div>
        </div>

        <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] hidden sm:inline">
          Earliest Deadline First (EDF)
        </span>
      </div>

      {/* Operational Watchlist Rows (High-density queue list) */}
      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {mostUrgentEv && (() => {
          const vehicleName = mostUrgentEv.vehicleName || mostUrgentEv.vehicle || 'Connected EV';
          const batteryPct = mostUrgentEv.batteryPct ?? mostUrgentEv.battery ?? 50;
          const departureTime = mostUrgentEv.departureTime || mostUrgentEv.departure || '06:00 AM';

          return (
            <div className="py-2.5 px-3 bg-[#F1E9DA]/40 dark:bg-[#0B1422]/40 border border-[#D8C7AF]/60 dark:border-[#1E3352]/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#172A46] dark:text-[#FFF8EA]">
                    {mostUrgentEv.id}
                  </span>
                  <span className="text-[11px] text-[#172A46] dark:text-[#FFF8EA] font-semibold truncate max-w-[160px] sm:max-w-xs">
                    {vehicleName}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                  {mostUrgentEv.priority}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#556880] dark:text-[#8CA2BF]">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                  <BatteryCharging className="w-3.5 h-3.5" />
                  {batteryPct}% SoC
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-[#556880] dark:text-[#8CA2BF]" />
                  Dep: {departureTime}
                </span>
                <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold tabular-nums">
                  {mostUrgentEv.currentPower}
                </span>
              </div>

              <div className="w-full h-1.5 bg-[#D8C7AF]/60 dark:bg-[#162740] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full"
                  style={{ width: `${batteryPct}%` }}
                />
              </div>
            </div>
          );
        })()}

        {/* Secondary Queued Vehicles in subtle watchlist format */}
        {secondaryQueue.length > 0 && (
          <div className="divide-y divide-[#D8C7AF]/40 dark:divide-[#1E3352]/40 text-xs font-mono pt-1">
            {secondaryQueue.map(ev => {
              const vName = ev.vehicleName || ev.vehicle || 'Connected EV';
              const bPct = ev.batteryPct ?? ev.battery ?? 50;
              const dep = ev.departureTime || ev.departure || '09:00 AM';

              return (
                <div key={ev.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-bold text-[#556880] dark:text-[#8CA2BF]">{ev.id}</span>
                    <span className="text-[11px] text-[#172A46] dark:text-[#FFF8EA] font-medium truncate">{vName}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-[11px]">
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">{bPct}%</span>
                    <span className="text-[#556880] dark:text-[#8CA2BF]">{dep}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                      ev.priority === 'URGENT'
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-[#172A46]/10 text-[#172A46] border-[#172A46]/20 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                    }`}>
                      {ev.priority}
                    </span>
                    <span className="font-bold text-[#172A46] dark:text-[#FFF8EA] tabular-nums">{ev.currentPower}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
