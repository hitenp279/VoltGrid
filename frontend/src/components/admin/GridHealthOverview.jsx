import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import {
  Activity,
  Zap,
  Gauge
} from 'lucide-react';

export default function GridHealthOverview() {
  const { telemetry, isCritical, evQueue } = useGridApp();

  const totalActiveEvs = evQueue.length;
  const throttledCount = evQueue.filter(ev => ev.throttled).length;
  const urgentCount = evQueue.filter(ev => ev.priority === 'URGENT').length;
  const flexibleCount = evQueue.filter(ev => ev.priority === 'FLEXIBLE').length;

  // Compute total active EV kW
  const totalEvPowerKw = evQueue.reduce((acc, ev) => {
    const num = parseFloat(ev.currentPower.replace(/[^0-9.]/g, '')) || 0;
    return acc + num;
  }, 0);

  // Power demand (kW)
  const powerDemandKw = ((telemetry.voltage * telemetry.current) / 1000).toFixed(1);

  return (
    <div className="bg-[#FFF9EE] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-2xl shadow-xs p-6 sm:p-7 space-y-6 font-sans transition-colors">
      
      {/* 1. Header: Substation Context & Live System Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D8C7AF]/60 dark:border-[#1E3352]/60">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 dark:bg-emerald-400'}`} />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#172A46] dark:text-[#FFF8EA] font-mono">
            Grid Health
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono">
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
            isCritical
              ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
          }`}>
            {isCritical ? 'ALERT: LOAD SHEDDING ACTIVE' : 'NOMINAL STABILITY'}
          </span>
        </div>
      </div>

      {/* 2. Tier 1: Primary Dominant Tabular Metrics (Current Load, Feeder Voltage, Core Utilization) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 md:divide-x divide-[#D8C7AF]/70 dark:divide-[#1E3352]/70 py-1">
        
        {/* Metric 1: Current Load */}
        <div className="md:pr-8 space-y-1">
          <div className="flex items-center justify-between text-[#556880] dark:text-[#8CA2BF]">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Current Load</span>
            <Activity className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-[#172A46] dark:text-cyan-400'}`} />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className={`text-5xl sm:text-6xl font-extrabold font-mono tracking-tight tabular-nums ${
              isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-[#172A46] dark:text-[#FFF8EA]'
            }`}>
              {telemetry.current}
            </span>
            <span className="text-lg font-mono font-medium text-[#556880] dark:text-[#8CA2BF]">A</span>
          </div>
          <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono pt-1">
            Nominal: 14.0 A · Maximum Envelope: 28.0 A
          </p>
        </div>

        {/* Metric 2: Feeder Voltage Stability */}
        <div className="md:px-8 space-y-1">
          <div className="flex items-center justify-between text-[#556880] dark:text-[#8CA2BF]">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Feeder Voltage</span>
            <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight tabular-nums text-[#172A46] dark:text-[#FFF8EA]">
              {telemetry.voltage}
            </span>
            <span className="text-lg font-mono font-medium text-[#556880] dark:text-[#8CA2BF]">V</span>
          </div>
          <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono pt-1">
            Target: 230.0 V ±2% · Steady 50.0 Hz
          </p>
        </div>

        {/* Metric 3: Core Utilization */}
        <div className="md:pl-8 space-y-1">
          <div className="flex items-center justify-between text-[#556880] dark:text-[#8CA2BF]">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Core Utilization</span>
            <Gauge className={`w-3.5 h-3.5 ${
              telemetry.transformerUtilization > 80 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`} />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className={`text-5xl sm:text-6xl font-extrabold font-mono tracking-tight tabular-nums ${
              telemetry.transformerUtilization > 80 ? 'text-rose-600 dark:text-rose-400' : 'text-[#172A46] dark:text-[#FFF8EA]'
            }`}>
              {telemetry.transformerUtilization}
            </span>
            <span className="text-lg font-mono font-medium text-[#556880] dark:text-[#8CA2BF]">%</span>
          </div>
          <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono pt-1">
            65 MVA Capacity · Shed Threshold: 85%
          </p>
        </div>

      </div>

      {/* 3. Tier 2: Integrated Technical Readout Strip (Separated by subtle horizontal divider) */}
      <div className="pt-4 border-t border-[#D8C7AF]/60 dark:border-[#1E3352]/60 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        
        {/* Secondary 1: Power Demand */}
        <div className="flex items-center justify-between sm:border-r border-[#D8C7AF]/60 dark:border-[#1E3352]/60 sm:pr-4">
          <div>
            <span className="text-[10px] uppercase text-[#556880] dark:text-[#8CA2BF] tracking-wider block font-bold">Power Demand</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-[#172A46] dark:text-[#FFF8EA] tabular-nums">{powerDemandKw}</span>
              <span className="text-xs text-[#556880] dark:text-[#8CA2BF]">kW</span>
            </div>
          </div>
          <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF]">Rated: 12 kW</span>
        </div>

        {/* Secondary 2: Active EV Load */}
        <div className="flex items-center justify-between sm:border-r border-[#D8C7AF]/60 dark:border-[#1E3352]/60 sm:pr-4">
          <div>
            <span className="text-[10px] uppercase text-[#556880] dark:text-[#8CA2BF] tracking-wider block font-bold">Active EV Load</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-[#172A46] dark:text-[#FFF8EA] tabular-nums">{totalEvPowerKw.toFixed(1)}</span>
              <span className="text-xs text-[#556880] dark:text-[#8CA2BF]">kW</span>
            </div>
          </div>
          <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF]">{totalActiveEvs} Bays Active</span>
        </div>

        {/* Secondary 3: SCADA State */}
        <div className="flex items-center justify-between sm:border-r border-[#D8C7AF]/60 dark:border-[#1E3352]/60 sm:pr-4">
          <div>
            <span className="text-[10px] uppercase text-[#556880] dark:text-[#8CA2BF] tracking-wider block font-bold">SCADA State</span>
            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border mt-0.5 ${
              isCritical
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
            }`}>
              {isCritical ? 'OVERLOAD SHED' : 'NOMINAL'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase text-[#556880] dark:text-[#8CA2BF] block font-bold">Action</span>
            <span className={`text-[11px] font-bold ${isCritical ? 'text-rose-700 dark:text-rose-400' : 'text-[#172A46] dark:text-[#FFF8EA]'}`}>
              {telemetry.action}
            </span>
          </div>
        </div>

        {/* Secondary 4: EV Allocation Summary */}
        <div className="flex flex-col justify-center">
          <span className="text-[10px] uppercase text-[#556880] dark:text-[#8CA2BF] tracking-wider font-bold">EV Queue Ratio</span>
          <div className="flex items-center gap-2.5 mt-1 text-[11px]">
            <span className="text-amber-800 dark:text-amber-300 font-bold">{urgentCount} Urgent</span>
            <span className="text-[#D8C7AF] dark:text-[#1E3352]">·</span>
            <span className="text-[#172A46] dark:text-blue-300 font-bold">{flexibleCount} Flexible</span>
            <span className="text-[#D8C7AF] dark:text-[#1E3352]">·</span>
            <span className={throttledCount > 0 ? 'text-rose-700 dark:text-rose-300 font-bold' : 'text-[#556880] dark:text-[#8CA2BF]'}>
              {throttledCount} Throttled
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
