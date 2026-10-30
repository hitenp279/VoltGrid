import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import {
  Cpu,
  ArrowRight,
  Flame,
  Layers,
  Activity,
  Zap,
  SlidersHorizontal
} from 'lucide-react';

export default function AIControlPanel() {
  const {
    telemetry,
    isCritical,
    isStressSimulated,
    toggleGridStress,
    evQueue
  } = useGridApp();

  const flexibleBays = evQueue.filter(ev => ev.priority === 'FLEXIBLE').map(ev => ev.id);

  return (
    <div className={`border rounded-2xl p-5 sm:p-6 transition-colors shadow-xs ${
      isCritical
        ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
        : 'bg-[#FFF8EA] dark:bg-[#121F33] border-[#D8C7AF] dark:border-[#1E3352]'
    }`}>
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#D8C7AF] dark:border-[#1E3352]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight whitespace-nowrap">AI Dynamic Load Management</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8DCC8] dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] text-[#172A46] dark:text-[#E8DCC8] uppercase font-bold whitespace-nowrap">
                SCADA Rule Node
              </span>
            </div>
            <p className="text-xs text-[#556880] dark:text-[#8CA2BF] mt-0.5 font-medium">
              Deterministic priority scheduling and predictive load shedding
            </p>
          </div>
        </div>

        {/* Interactive Simulation Trigger */}
        <button
          onClick={toggleGridStress}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer shadow-xs border ${
            isStressSimulated
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700'
              : 'bg-[#E8DCC8]/80 hover:bg-[#DFCFAF] dark:bg-[#0B1422] dark:hover:bg-[#1A2D48] text-amber-800 dark:text-amber-300 border-[#D8C7AF] dark:border-amber-500/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{isStressSimulated ? 'Deactivate Stress Simulation' : 'Simulate Grid Peak Overload'}</span>
        </button>
      </div>

      {/* Continuous Decision Pipeline (Zero nested cards) */}
      <div className="my-5 rounded-xl border border-[#D8C7AF] dark:border-[#1E3352] bg-[#E8DCC8]/40 dark:bg-[#0B1422] overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D8C7AF] dark:divide-[#1E3352]">
          
          {/* Stage 1: Grid Demand */}
          <div className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#556880] dark:text-[#8CA2BF] font-bold">
                1. Grid Demand
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#D8C7AF]/60 dark:bg-[#162740] text-[#172A46] dark:text-[#E8DCC8] font-bold">
                INPUT
              </span>
            </div>
            <p className={`text-base sm:text-lg font-bold font-mono tracking-tight ${
              isCritical ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}>
              {isCritical ? 'CRITICAL HIGH' : 'BALANCED'}
            </p>
            <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono">
              {telemetry.current} A load • {telemetry.transformerUtilization}% capacity
            </p>
          </div>

          {/* Stage 2: Policy Decision */}
          <div className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#556880] dark:text-[#8CA2BF] font-bold">
                2. AI Policy
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#D8C7AF]/60 dark:bg-[#162740] text-[#172A46] dark:text-[#E8DCC8] font-bold">
                RULES
              </span>
            </div>
            <p className={`text-xs sm:text-sm font-bold font-mono tracking-tight truncate ${
              isCritical ? 'text-rose-700 dark:text-rose-300' : 'text-[#172A46] dark:text-[#FFF8EA]'
            }`}>
              {isCritical ? 'THROTTLE FLEXIBLE' : 'NOMINAL ALLOC'}
            </p>
            <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono">
              Payload: <span className="text-[#172A46] dark:text-[#E8DCC8] font-bold">{telemetry.action}</span>
            </p>
          </div>

          {/* Stage 3: Targeted Charger Bays */}
          <div className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#556880] dark:text-[#8CA2BF] font-bold">
                3. Targeted Bays
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#D8C7AF]/60 dark:bg-[#162740] text-[#172A46] dark:text-[#E8DCC8] font-bold">
                NODES
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {flexibleBays.length > 0 ? (
                flexibleBays.map(bay => (
                  <span key={bay} className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    isCritical
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                      : 'bg-[#D8C7AF]/60 text-[#172A46] border border-[#D8C7AF] dark:bg-[#162740] dark:text-[#E8DCC8]'
                  }`}>
                    {bay}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#556880] dark:text-[#8CA2BF] font-mono">None connected</span>
              )}
            </div>
            <p className="text-[10px] text-[#556880] dark:text-[#8CA2BF] font-mono">
              {isCritical ? 'Throttled for grid relief' : 'Ready for curtailment'}
            </p>
          </div>

          {/* Stage 4: Power Modulation */}
          <div className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#556880] dark:text-[#8CA2BF] font-bold">
                4. Power Modulation
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#D8C7AF]/60 dark:bg-[#162740] text-[#172A46] dark:text-[#E8DCC8] font-bold">
                DISPATCH
              </span>
            </div>
            <div className="font-mono text-sm sm:text-base">
              {isCritical ? (
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
                  <span className="line-through text-[#556880] dark:text-[#8CA2BF] font-normal text-xs">3.6 kW</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#556880] dark:text-[#8CA2BF]" />
                  <span>0.5 kW</span>
                </div>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">3.6 - 7.2 kW</span>
              )}
            </div>
            <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono">
              {isCritical ? '-86% curtailment' : 'Nominal output'}
            </p>
          </div>

        </div>
      </div>

      {/* Detailed Decision Rationale Box */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#E8DCC8]/40 dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono text-[#556880] dark:text-[#8CA2BF] font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#172A46] dark:text-cyan-400" />
            Decision Rationale & Protection Logic
          </span>
          <p className="text-xs text-[#172A46] dark:text-[#E8DCC8] leading-relaxed max-w-2xl font-sans font-medium">
            {isCritical ? (
              <span>
                <strong className="text-rose-700 dark:text-rose-400 font-bold">Transformer core exceeded safe 80% capacity ({telemetry.current}A).</strong> The AI load management algorithm sheds non-essential power on vehicles with distant departure targets (FLEXIBLE tier), guaranteeing 100% capacity for URGENT departures without triggering substation breaker trips.
              </span>
            ) : (
              <span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Substation operating within safe capacity envelope ({telemetry.transformerUtilization}% load).</strong> Voltage stability is nominal at {telemetry.voltage}V. All EV chargers operate at full rated output.
              </span>
            )}
          </p>
        </div>

        <div className="shrink-0 font-mono text-xs">
          <span className={`px-3 py-1.5 rounded-lg border font-bold block ${
            isCritical
              ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              : 'bg-[#FFF8EA] text-[#172A46] border-[#D8C7AF] dark:bg-[#121F33] dark:text-[#FFF8EA]'
          }`}>
            CMD: {telemetry.action}
          </span>
        </div>
      </div>

    </div>
  );
}
