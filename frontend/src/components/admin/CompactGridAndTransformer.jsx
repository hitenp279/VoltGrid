import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import { Activity, ArrowRight } from 'lucide-react';

export default function CompactGridAndTransformer() {
  const { telemetry, isCritical, setAdminNavTab } = useGridApp();

  const temp = telemetry.temperature || 38.5;
  const utilization = telemetry.transformerUtilization || 58;
  const isHighTemp = temp > 50;
  const isVoltageNominal = telemetry.voltage >= 220 && telemetry.voltage <= 240;

  return (
    <div className="bg-[#FFF9EE] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-2xl shadow-xs p-6 space-y-4 font-sans transition-colors h-full flex flex-col justify-between">
      
      {/* Header with Navigation Link */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D8C7AF]/60 dark:border-[#1E3352]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
              Grid Feeder & Transformer TF-05
            </h3>
            <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono">
              DLF Cyber Feeder · 65 MVA Core Telemetry
            </p>
          </div>
        </div>

        <button
          onClick={() => setAdminNavTab('telemetry')}
          className="text-xs font-mono font-bold text-[#172A46] hover:text-[#233A5E] dark:text-[#E8DCC8] dark:hover:text-[#FFF8EA] flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>View Telemetry</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Subordinate Status Strip */}
      <div className="py-2 px-3 bg-[#F1E9DA]/50 dark:bg-[#0B1422]/60 border-y border-[#D8C7AF]/60 dark:border-[#1E3352]/60 rounded-lg flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="text-[#556880] dark:text-[#8CA2BF] uppercase text-[10px] font-bold">Node Status:</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${
            isCritical
              ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
          }`}>
            <span className={`w-1 h-1 rounded-full ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            {isCritical ? 'OVERLOAD ATTENTION' : 'CONTINUOUS SYNC'}
          </span>
        </div>
        <span className="text-[11px] text-[#556880] dark:text-[#8CA2BF]">Substation Node #05</span>
      </div>

      {/* Technical Equipment Panels (2 Columns with vertical hairline) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#D8C7AF]/70 dark:divide-[#1E3352]/70 font-mono text-xs flex-1 flex flex-col justify-center">
        
        {/* Column 1: Feeder Stability */}
        <div className="pr-0 sm:pr-5 pb-3 sm:pb-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-[#556880] dark:text-[#8CA2BF] tracking-wider font-bold">
              Feeder Stability
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isVoltageNominal
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
            }`}>
              {isVoltageNominal ? 'NOMINAL' : 'SAG WARNING'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#172A46] dark:text-[#FFF8EA] tracking-tight tabular-nums">
                {telemetry.voltage}
              </span>
              <span className="text-xs text-[#556880] dark:text-[#8CA2BF] ml-1">V RMS</span>
            </div>
            <span className="text-[#556880] dark:text-[#8CA2BF] text-xs font-semibold tabular-nums">
              {telemetry.frequency ? `${telemetry.frequency} Hz` : '50.0 Hz'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#556880] dark:text-[#8CA2BF] pt-2 border-t border-[#D8C7AF]/50 dark:border-[#1E3352]/50">
            <span className="font-medium">Bus Current:</span>
            <span className={isCritical ? 'text-rose-700 dark:text-rose-400 font-bold tabular-nums' : 'text-[#172A46] dark:text-[#E8DCC8] font-bold tabular-nums'}>
              {telemetry.current} A <span className="font-normal text-[#556880] dark:text-[#8CA2BF]">(rated 28A)</span>
            </span>
          </div>
        </div>

        {/* Column 2: Transformer TF-05 Core Telemetry */}
        <div className="pl-0 sm:pl-5 pt-3 sm:pt-0 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-[#556880] dark:text-[#8CA2BF] tracking-wider font-bold">
              Transformer TF-05
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isCritical
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
            }`}>
              {isCritical ? 'HIGH LOAD' : 'NOMINAL'}
            </span>
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between items-baseline text-[11px]">
              <span className="text-[#556880] dark:text-[#8CA2BF] font-medium">Core Utilization:</span>
              <span className={`font-bold text-sm sm:text-base tabular-nums ${utilization > 80 ? 'text-rose-700 dark:text-rose-400' : 'text-[#172A46] dark:text-[#FFF8EA]'}`}>
                {utilization}%
              </span>
            </div>

            <div className="w-full h-1.5 bg-[#D8C7AF]/60 dark:bg-[#162740] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  utilization > 80 ? 'bg-rose-600' : utilization > 65 ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, utilization)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#556880] dark:text-[#8CA2BF] pt-2 border-t border-[#D8C7AF]/50 dark:border-[#1E3352]/50">
            <span className="font-medium">Winding Temp:</span>
            <span className={isHighTemp ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-[#172A46] dark:text-[#E8DCC8] font-bold'}>
              {temp}°C <span className="text-[#556880] dark:text-[#8CA2BF] font-normal">(Forced Cooling)</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
