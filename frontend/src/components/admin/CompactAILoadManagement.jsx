import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import { Cpu, ArrowRight, Activity, AlertTriangle } from 'lucide-react';

export default function CompactAILoadManagement() {
  const {
    telemetry,
    isCritical,
    isStressSimulated,
    toggleGridStress,
    setAdminNavTab
  } = useGridApp();

  return (
    <div className={`rounded-2xl p-6 space-y-4 font-sans transition-colors shadow-xs h-full flex flex-col justify-between border ${
      isCritical
        ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
        : 'bg-[#FFF9EE] dark:bg-[#121F33] border-[#D8C7AF] dark:border-[#1E3352]'
    }`}>
      
      {/* Header & Operator Actions */}
      <div className="pb-3.5 border-b border-[#D8C7AF]/60 dark:border-[#1E3352]/60 space-y-1.5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Left: 1. Icon, 2. Title, 3. SCADA Rule Node badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* 1. Icon */}
            <div className="w-8 h-8 rounded-lg bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs shrink-0">
              <Cpu className="w-4 h-4" />
            </div>

            {/* 2. Title */}
            <h3 className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight whitespace-nowrap shrink-0">
              AI Dynamic Load Management
            </h3>

            {/* 3. SCADA Rule Node badge */}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F1E9DA] dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] text-[#172A46] dark:text-[#E8DCC8] font-bold whitespace-nowrap shrink-0 ml-1">
              SCADA Rule Node
            </span>
          </div>

          {/* Right: 4. Simulate Stress / Reset Grid button, 5. Policy Details action */}
          <div className="flex items-center gap-2.5 shrink-0 self-start xl:self-auto">
            {/* 4. Dedicated Industrial Operator Control */}
            <button
              onClick={toggleGridStress}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs whitespace-nowrap shrink-0 ${
                isStressSimulated
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700'
                  : 'bg-[#F1E9DA] hover:bg-[#E8DCC8] dark:bg-[#0B1422] dark:hover:bg-[#162740] text-amber-800 dark:text-amber-300 border-[#D8C7AF] dark:border-amber-500/40'
              }`}
            >
              {isStressSimulated ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span>Reset Grid</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Simulate Stress</span>
                </>
              )}
            </button>

            {/* 5. Policy Details action */}
            <button
              onClick={() => setAdminNavTab('ai-management')}
              className="text-xs font-mono font-bold text-[#172A46] hover:text-[#233A5E] dark:text-[#E8DCC8] dark:hover:text-[#FFF8EA] flex items-center gap-1 transition-colors group cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Policy Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Description directly below the title, fully readable without truncation */}
        <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono pl-10.5 sm:pl-11 leading-normal">
          Deterministic priority scheduling & predictive load shedding
        </p>
      </div>

      {/* Unified Cause → Decision → Result Pipeline (Continuous process flow inside card) */}
      <div className={`border rounded-xl transition-colors overflow-hidden flex-1 flex flex-col justify-center ${
        isCritical
          ? 'border-rose-300 dark:border-rose-800/80 bg-rose-100/40 dark:bg-rose-950/40'
          : 'border-[#D8C7AF]/60 dark:border-[#1E3352]/60 bg-[#F1E9DA]/40 dark:bg-[#0B1422]/50'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#D8C7AF]/70 dark:divide-[#1E3352]/70 font-mono text-xs">
          
          {/* Step 1: CURRENT STATE */}
          <div className="p-3.5 space-y-1 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-[#556880] dark:text-[#8CA2BF] tracking-wider font-bold">
                1. Current State
              </span>
              <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 dark:bg-emerald-400'}`} />
            </div>
            <p className={`font-bold text-sm tracking-tight ${isCritical ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {isCritical ? 'CRITICAL HIGH LOAD' : 'BALANCED'}
            </p>
            <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF]">
              {telemetry.transformerUtilization}% Core · {telemetry.current} A Bus
            </p>
          </div>

          {/* Step 2: AI DECISION */}
          <div className="p-3.5 space-y-1 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-[#556880] dark:text-[#8CA2BF] tracking-wider font-bold">
                2. AI Policy
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#556880] dark:text-[#8CA2BF] hidden md:block" />
            </div>
            <p className={`font-bold text-sm tracking-tight ${isCritical ? 'text-rose-700 dark:text-rose-300' : 'text-[#172A46] dark:text-[#FFF8EA]'}`}>
              {isCritical ? 'LOAD SHEDDING' : 'NORMAL ALLOCATION'}
            </p>
            <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF]">
              Policy: <span className="text-[#172A46] dark:text-[#E8DCC8] font-bold">Priority Fair Share</span>
            </p>
          </div>

          {/* Step 3: DISPATCH ACTION */}
          <div className={`p-3.5 space-y-1 transition-colors ${
            isCritical ? 'bg-rose-100/60 dark:bg-rose-950/50' : ''
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase text-[#556880] dark:text-[#8CA2BF] tracking-wider font-bold">
                3. Action
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                isCritical
                  ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              }`}>
                {isCritical ? 'THROTTLED' : 'DISPATCHING'}
              </span>
            </div>
            <p className={`font-bold text-sm tracking-tight ${isCritical ? 'text-rose-800 dark:text-rose-300' : 'text-[#172A46] dark:text-[#FFF8EA]'}`}>
              {isCritical ? 'THROTTLE FLEXIBLE BAYS' : 'NO THROTTLING'}
            </p>
            <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-sans">
              {isCritical ? (
                <span className="text-rose-700 dark:text-rose-300 font-mono font-bold">Curtailment: 3.6 kW → 0.5 kW</span>
              ) : (
                <span className="font-mono">All bays delivering 100% nominal</span>
              )}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
