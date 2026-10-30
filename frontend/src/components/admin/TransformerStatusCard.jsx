import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import {
  Thermometer,
  Gauge,
  Wind,
  Cpu
} from 'lucide-react';

export default function TransformerStatusCard() {
  const { telemetry, isCritical } = useGridApp();

  const temp = telemetry.temperature || 38.5;
  const utilization = telemetry.transformerUtilization || 58;
  const isHighTemp = temp > 50;

  return (
    <div className="bg-[#FFF8EA] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs transition-colors">
      
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#D8C7AF]/60 dark:border-[#1E3352]/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">Transformer TF-05 Diagnostics</h4>
            <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-medium">DLF Cyber Feeder Substation • 65 MVA Core</p>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
          isCritical
            ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
            : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
        }`}>
          {isCritical ? 'ALERT: HIGH LOAD' : 'NOMINAL'}
        </span>
      </div>

      {/* Primary Telemetry: Utilization & Temperature */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Utilization Column */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-mono font-bold text-[#556880] dark:text-[#8CA2BF]">Core Utilization</span>
            <span className="text-[11px] font-mono text-[#556880] dark:text-[#8CA2BF]">28A Rated Capacity</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-bold font-mono tracking-tight ${
              utilization > 80 ? 'text-rose-700 dark:text-rose-400' : 'text-[#172A46] dark:text-[#FFF8EA]'
            }`}>
              {utilization}%
            </span>
            <span className="text-xs font-mono text-[#556880] dark:text-[#8CA2BF]">
              ({telemetry.current || '14.5'} A / 28.0 A)
            </span>
          </div>
          
          <div className="w-full h-2 bg-[#D8C7AF]/60 dark:bg-[#0B1422] rounded-full border border-[#D8C7AF] dark:border-[#1E3352] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                utilization > 80
                  ? 'bg-rose-600'
                  : utilization > 65
                    ? 'bg-amber-500'
                    : 'bg-emerald-600 dark:bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, utilization)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-[#556880] dark:text-[#8CA2BF] font-mono pt-0.5">
            <span>0% Idle</span>
            <span>75% Caution</span>
            <span className="text-rose-700 dark:text-rose-400 font-bold">85% Shed Trigger</span>
          </div>
        </div>

        {/* Winding Temperature Column */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-mono font-bold text-[#556880] dark:text-[#8CA2BF] flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Winding Temperature
            </span>
            <span className="text-[11px] font-mono text-[#556880] dark:text-[#8CA2BF]">Thermal Limit: 75°C</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-bold font-mono tracking-tight ${
              isHighTemp ? 'text-rose-700 dark:text-rose-400' : 'text-[#172A46] dark:text-[#FFF8EA]'
            }`}>
              {temp}°C
            </span>
            <span className={`text-xs font-mono font-bold ${
              isHighTemp ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}>
              {isHighTemp ? 'ELEVATED' : 'STABLE'}
            </span>
          </div>

          <div className="w-full h-2 bg-[#D8C7AF]/60 dark:bg-[#0B1422] rounded-full border border-[#D8C7AF] dark:border-[#1E3352] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isHighTemp ? 'bg-rose-600' : 'bg-emerald-600 dark:bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (temp / 75) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-[#556880] dark:text-[#8CA2BF] font-mono pt-0.5">
            <span>25°C Ambient</span>
            <span>50°C Warning</span>
            <span className="text-rose-700 dark:text-rose-400 font-bold">75°C Critical</span>
          </div>
        </div>

      </div>

      {/* Technical Specifications Rail (Clean hairline strip, no nested cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#D8C7AF]/70 dark:border-[#1E3352] text-xs font-mono">
        <div className="space-y-0.5">
          <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] block uppercase font-bold tracking-wider">Rated MVA</span>
          <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold text-sm">65.0 MVA</span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] block uppercase font-bold tracking-wider">Cooling Mode</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm flex items-center gap-1">
            <Wind className="w-3.5 h-3.5" /> Forced Air (ON)
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] block uppercase font-bold tracking-wider">Grid Frequency</span>
          <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold text-sm">{telemetry.frequency || 50.01} Hz</span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] block uppercase font-bold tracking-wider">Tap Position</span>
          <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold text-sm">TAP #04 (Nominal)</span>
        </div>
      </div>

    </div>
  );
}
