import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import {
  Zap,
  AlertTriangle,
  ShieldCheck,
  Radio
} from 'lucide-react';
import GridHealthOverview from './GridHealthOverview';
import ChargingInfrastructure from './ChargingInfrastructure';
import CompactInfrastructureOverview from './CompactInfrastructureOverview';
import CompactGridAndTransformer from './CompactGridAndTransformer';
import CompactAILoadManagement from './CompactAILoadManagement';
import CompactEVDispatchQueue from './CompactEVDispatchQueue';
import CompactAlertsPreview from './CompactAlertsPreview';
import GridChartsEnhanced from './GridChartsEnhanced';
import TransformerStatusCard from './TransformerStatusCard';
import AIControlPanel from './AIControlPanel';
import EVChargingQueueTable from './EVChargingQueueTable';
import AlertsLogPanel from './AlertsLogPanel';

export default function AdminDashboard() {
  const {
    auth,
    setUserNavTab,
    adminNavTab,
    telemetry,
    isCritical,
    loadHistory,
    voltageHistory,
    theme
  } = useGridApp();

  const role = auth.role || 'guest';
  const isAdmin = auth.isAuthenticated && role === 'admin';

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-7 bg-[#FFF8EA] dark:bg-[#121F33] border border-rose-300 dark:border-rose-800/80 rounded-2xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#172A46] dark:text-[#FFF8EA]">Restricted SCADA Access</h2>
          <p className="text-xs text-[#556880] dark:text-[#8CA2BF] mt-1.5 leading-relaxed">
            Grid administration controls and transformer telemetry require authenticated administrative credentials.
          </p>
        </div>
        <button
          onClick={() => setUserNavTab(auth.isAuthenticated ? 'overview' : 'stations')}
          className="px-4 py-2.5 rounded-lg bg-[#172A46] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] hover:bg-[#233A5E] dark:hover:bg-[#E8DCC8] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        >
          {auth.isAuthenticated ? 'Return to EV Dashboard' : 'Return to Public Stations'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      
      {/* 1. HERO / SYSTEM INTRODUCTION (Unboxed commanding editorial surface) */}
      <div className="pt-2 pb-6 border-b border-[#D8C7AF]/80 dark:border-[#1E3352]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-[#556880] dark:text-[#8CA2BF] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span>VOLTGRID SCADA</span>
              </span>
              <span className="text-[#D8C7AF] dark:text-[#1E3352]">·</span>
              <span className="text-[#172A46] dark:text-[#E8DCC8] font-bold">SCADA NODE #05</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
              Smart Grid AI Control Room
            </h1>
          </div>

          {/* Hero Right: System State & Live Electrical Values */}
          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2.5 font-mono">
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border shadow-xs ${
              isCritical
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>{isCritical ? 'ALERT: LOAD SHEDDING ACTIVE' : 'GRID NOMINAL: 230V / 50Hz'}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-[#172A46] dark:text-[#FFF8EA] flex items-center gap-2 pt-0.5">
              <span className="tabular-nums">{telemetry.voltage} V</span>
              <span className="text-[#556880] dark:text-[#8CA2BF]">·</span>
              <span className="tabular-nums">{telemetry.current} A</span>
              <span className="text-[#556880] dark:text-[#8CA2BF]">·</span>
              <span className="tabular-nums">{telemetry.frequency || 50.0} Hz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Overload Warning Banner (Authoritative utility alert) */}
      {isCritical && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-white font-sans flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-colors">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/50 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide text-rose-900 dark:text-rose-100 uppercase font-mono">
                Automated Load Shedding Activated: THROTTLE_POWER
              </p>
              <p className="text-xs text-rose-800 dark:text-rose-200 mt-1 leading-relaxed max-w-3xl font-medium">
                SCADA telemetry detected impending transformer overload ({telemetry.current}A, {telemetry.transformerUtilization}% capacity). Dispatched throttle command to edge microcontrollers. Non-urgent flexible EV chargers throttled from 3.6 kW to 0.5 kW.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono shrink-0">
            <span className="bg-[#FFF9EE] dark:bg-[#0B1422] px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-bold shadow-xs">
              CMD: THROTTLE
            </span>
          </div>
        </div>
      )}

      {/* View Switching based on adminNavTab */}
      {adminNavTab === 'overview' && (
        <div className="space-y-6 pt-1">
          {/* 1. MAJOR CARD 1: PRIMARY GRID STATUS (Large Horizontal Instrument Panel) */}
          <GridHealthOverview />

          {/* 2. OPERATIONAL WORKSPACE: Major Cards 2 & 3 (Infrastructure & Feeder/Transformer) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column (7 cols): Charging Infrastructure */}
            <div className="lg:col-span-7 flex flex-col">
              <CompactInfrastructureOverview />
            </div>

            {/* Right Column (5 cols): Grid Feeder & Transformer TF-05 */}
            <div className="lg:col-span-5 flex flex-col">
              <CompactGridAndTransformer />
            </div>
          </div>

          {/* 3. SECONDARY WORKSPACE: Major Cards 4 & 5 (EV Priority Dispatch & AI Load Management) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column (5 cols): EV Priority Dispatch */}
            <div className="lg:col-span-5 flex flex-col">
              <CompactEVDispatchQueue />
            </div>

            {/* Right Column (7 cols): AI Dynamic Load Management */}
            <div className="lg:col-span-7 flex flex-col">
              <CompactAILoadManagement />
            </div>
          </div>

          {/* 4. MAJOR CARD 6: RECENT OPERATIONAL ALERTS / EVENT STREAM */}
          <CompactAlertsPreview />
        </div>
      )}

      {adminNavTab === 'telemetry' && (
        <div className="space-y-6">
          <GridHealthOverview />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GridChartsEnhanced
              data={loadHistory}
              title="Transformer Current Load Stream"
              description="Live SCADA 3-second polling against 28A overload envelope"
              unit="A"
              strokeColor={isCritical ? "#e11d48" : (theme === 'dark' ? '#38bdf8' : '#172A46')}
              fillGradientId="loadGrad2"
              warningThreshold={20}
              criticalThreshold={28}
              minDomain={0}
              maxDomain={40}
            />

            <GridChartsEnhanced
              data={voltageHistory}
              title="Feeder Voltage Stability Stream"
              description="Voltage sag & swell monitoring (Target: 230V RMS nominal)"
              unit="V"
              strokeColor="#d97706"
              fillGradientId="voltGrad2"
              warningThreshold={220}
              criticalThreshold={215}
              minDomain={200}
              maxDomain={250}
            />
          </div>
          <TransformerStatusCard />
        </div>
      )}

      {adminNavTab === 'ev-queue' && (
        <div className="space-y-6">
          <EVChargingQueueTable />
        </div>
      )}

      {adminNavTab === 'ai-management' && (
        <div className="space-y-6">
          <AIControlPanel />
          <EVChargingQueueTable />
        </div>
      )}

      {adminNavTab === 'infrastructure' && (
        <div className="space-y-6">
          <ChargingInfrastructure />
        </div>
      )}

      {adminNavTab === 'alerts' && (
        <div className="space-y-6">
          <AlertsLogPanel />
        </div>
      )}

    </div>
  );
}
