import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import { ArrowRight, Power, BatteryCharging, Zap, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ActiveChargingCard({ onFindStation }) {
  const {
    auth,
    activeSession,
    stopChargingSession,
    isCritical,
    telemetry
  } = useGridApp();

  if (!auth.isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 p-8 bg-[#FFF8EA] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-3xl shadow-xs transition-colors">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <h2 className="text-lg font-bold text-[#172A46] dark:text-[#FFF8EA]">Authentication Required</h2>
        <p className="text-xs sm:text-sm text-[#556880] dark:text-[#8CA2BF] leading-relaxed font-medium">
          Guests cannot access personal active charging telemetry. Please sign in to connect your EV and monitor your charging sessions.
        </p>
        <div className="pt-2">
          <button
            onClick={onFindStation}
            className="text-xs font-bold px-5 py-2.5 rounded-xl bg-[#172A46] hover:bg-[#233A5E] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] dark:hover:bg-[#E8DCC8] transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
          >
            <span>Browse public stations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (!activeSession.isActive) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 p-8 bg-[#FFF8EA] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-3xl shadow-xs transition-colors">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs">
          <BatteryCharging className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#172A46] dark:text-[#FFF8EA]">No active charging session</h2>
        <p className="text-xs sm:text-sm text-[#556880] dark:text-[#8CA2BF] leading-relaxed font-medium">
          Connect your vehicle at an available charging bay to monitor real-time battery SoC and grid dispatch rates.
        </p>
        <button
          onClick={onFindStation}
          className="text-xs font-bold px-5 py-2.5 rounded-xl bg-[#172A46] hover:bg-[#233A5E] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] dark:hover:bg-[#E8DCC8] transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
        >
          <span>Find a charging station</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  const formatDuration = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const isThrottled = isCritical && activeSession.priority === 'FLEXIBLE';
  const batteryPct = Math.min(100, Math.round(activeSession.batteryPct));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Grid Load Shedding Status Notice */}
      {isThrottled ? (
        <div className="p-4 rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-900 dark:text-rose-300">Grid Load Shedding Active: </span>
              <span className="text-rose-800 dark:text-rose-200 font-medium">
                Transformer load reached {telemetry.transformerUtilization}%. Session throttled to {activeSession.currentPowerKw} kW for grid relief.
              </span>
            </div>
          </div>
          <span className="font-mono text-rose-800 dark:text-rose-300 px-2.5 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 shrink-0 text-[11px] font-bold">
            {telemetry.current} A load
          </span>
        </div>
      ) : isCritical ? (
        <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-300">High Grid Demand: </span>
              <span className="text-amber-800 dark:text-amber-200 font-medium">
                Urgent session priority preserved. Delivering full {activeSession.currentPowerKw} kW nominal rate.
              </span>
            </div>
          </div>
          <span className="font-mono text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 shrink-0 text-[11px] font-bold">
            {telemetry.current} A load
          </span>
        </div>
      ) : null}

      {/* Main Charging Panel: Automotive digital cockpit */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF8EA] dark:bg-[#121F33] space-y-8 shadow-xs transition-colors">
        
        {/* Vehicle Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#556880] dark:text-[#8CA2BF] font-bold block mb-1">
              Connected Vehicle
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
              {activeSession.vehicle}
            </h1>
            <p className="text-xs text-[#556880] dark:text-[#8CA2BF] mt-1 font-mono flex items-center gap-2">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">{activeSession.slotId}</span>
              <span>•</span>
              <span className="text-[#172A46] dark:text-[#FFF8EA] font-semibold">{activeSession.stationName}</span>
              <span>•</span>
              <span>{activeSession.connector}</span>
            </p>
          </div>

          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono uppercase font-bold border ${
              isThrottled
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
            }`}>
              {isThrottled ? 'Throttled' : activeSession.status}
            </span>
          </div>
        </div>

        {/* Primary Battery State */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-bold font-mono text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
                {batteryPct}%
              </span>
              <span className="text-xs sm:text-sm text-[#556880] dark:text-[#8CA2BF] font-mono font-medium">
                / {activeSession.targetPct}% target
              </span>
            </div>
            <span className="text-xs font-mono text-[#556880] dark:text-[#8CA2BF] flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Est. departure: {activeSession.departureTime}</span>
            </span>
          </div>

          {/* Clean precision progress bar */}
          <div className="w-full h-2.5 bg-[#D8C7AF]/60 dark:bg-[#0B1422] rounded-full overflow-hidden border border-[#D8C7AF] dark:border-[#1E3352]">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                isThrottled ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-400'
              }`}
              style={{ width: `${batteryPct}%` }}
            />
          </div>
        </div>

        {/* Primary Telemetry Metrics Row */}
        <div className="grid grid-cols-3 gap-4 pt-5 border-t border-[#D8C7AF]/70 dark:border-[#1E3352]">
          <div>
            <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-mono tracking-wider font-bold block mb-1">
              Power
            </span>
            <p className={`text-xl sm:text-2xl font-bold font-mono ${isThrottled ? 'text-rose-700 dark:text-rose-400' : 'text-[#172A46] dark:text-[#FFF8EA]'}`}>
              {activeSession.currentPowerKw} <span className="text-xs font-normal text-[#556880] dark:text-[#8CA2BF] font-sans">kW</span>
            </p>
            {isThrottled && (
              <span className="text-[10px] text-rose-700 dark:text-rose-400 block font-mono mt-0.5 font-bold">
                Curtailed from 7.2 kW
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-mono tracking-wider font-bold block mb-1">
              Energy
            </span>
            <p className="text-xl sm:text-2xl font-bold font-mono text-[#172A46] dark:text-[#FFF8EA]">
              {activeSession.energyDeliveredKwh} <span className="text-xs font-normal text-[#556880] dark:text-[#8CA2BF] font-sans">kWh</span>
            </p>
            <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] block font-mono mt-0.5 font-medium">
              Delivered
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-mono tracking-wider font-bold block mb-1">
              Remaining
            </span>
            <p className="text-xl sm:text-2xl font-bold font-mono text-[#172A46] dark:text-[#FFF8EA]">
              {activeSession.estimatedMinutesRemaining} <span className="text-xs font-normal text-[#556880] dark:text-[#8CA2BF] font-sans">min</span>
            </p>
            <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] block font-mono mt-0.5 font-medium">
              To target SoC
            </span>
          </div>
        </div>

        {/* Secondary Details (Card Reduction: Integrated Inline Parameter Strip) */}
        <div className="p-4 bg-[#E8DCC8]/40 dark:bg-[#0B1422]/70 rounded-2xl border border-[#D8C7AF]/80 dark:border-[#1E3352] grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D8C7AF]/70 dark:divide-[#1E3352]/70 text-xs font-mono">
          <div className="pb-2 sm:pb-0 sm:pr-4">
            <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block">Duration</span>
            <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold text-sm">{formatDuration(activeSession.durationSeconds)}</span>
          </div>

          <div className="py-2 sm:py-0 sm:px-4">
            <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block">Start Time</span>
            <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold text-sm">{activeSession.startTime}</span>
          </div>

          <div className="py-2 sm:py-0 sm:px-4">
            <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block">Priority</span>
            <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold text-sm">{activeSession.priority}</span>
          </div>

          <div className="pt-2 sm:pt-0 sm:pl-4">
            <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block">Current Cost</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">₹ {activeSession.costSoFar.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Button & Dispatch Reference */}
        <div className="pt-4 border-t border-[#D8C7AF]/70 dark:border-[#1E3352] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs text-[#556880] dark:text-[#8CA2BF] font-mono">
            Grid Dispatch: DLF Cyber Feeder SCADA Node #05
          </span>

          <button
            onClick={stopChargingSession}
            className="text-xs font-bold px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Stop charging session</span>
          </button>
        </div>

      </div>

    </div>
  );
}
