import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import { ArrowRight, Zap, Shield, BatteryCharging, Gauge, MapPin } from 'lucide-react';

export default function UserDashboard() {
  const {
    auth,
    activeSession,
    stations,
    setUserNavTab,
    setSelectedStationId,
    isCritical
  } = useGridApp();

  const user = auth.user;
  const isCharging = auth.isAuthenticated && activeSession.isActive;

  return (
    <div className="space-y-7">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#D8C7AF] dark:border-[#1E3352]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
            EV Charging Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#556880] dark:text-[#8CA2BF] mt-1 font-medium">
            {auth.isAuthenticated ? (
              <span className="flex items-center gap-2 flex-wrap">
                <span>Vehicle:</span>
                <span className="text-[#172A46] dark:text-[#FFF8EA] font-semibold">{user?.vehicle || 'Tesla Model Y Dual Motor'}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#FFF8EA] dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] text-[#172A46] dark:text-[#E8DCC8] font-bold">
                  {user?.plate || 'DL-01-EV-4092'}
                </span>
              </span>
            ) : (
              <span>Public Guest Mode • Real-time station availability & grid dispatch status</span>
            )}
          </p>
        </div>

        {/* Grid Feeder Status Pill */}
        <div className="flex items-center gap-2 text-xs font-mono bg-[#FFF8EA] dark:bg-[#121F33] px-3.5 py-1.5 rounded-full border border-[#D8C7AF] dark:border-[#1E3352] self-start sm:self-auto shadow-xs">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 dark:bg-emerald-400'}`} />
          <span className={isCritical ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-[#172A46] dark:text-[#E8DCC8] font-medium'}>
            Feeder: {isCritical ? 'High Demand (Throttled)' : 'Normal (230V Nominal)'}
          </span>
        </div>
      </div>

      {/* Hero Active Charging Banner or Ready-to-Charge Callout */}
      {!auth.isAuthenticated ? (
        <div className="p-5 sm:p-6 rounded-2xl border border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF8EA] dark:bg-[#121F33] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <p className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA]">Public EV Charger Network</p>
            </div>
            <p className="text-xs text-[#556880] dark:text-[#8CA2BF] max-w-xl leading-relaxed font-medium">
              Explore nearby rapid and ultra-fast charging depots in the DLF CyberCity grid district. Select any available charger bay to inspect power output, connector formats, and live tariff rates.
            </p>
          </div>
          <button
            onClick={() => setUserNavTab('stations')}
            className="text-xs font-bold px-4 py-2.5 rounded-lg bg-[#172A46] hover:bg-[#233A5E] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] dark:hover:bg-[#E8DCC8] transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-xs"
          >
            <span>Browse stations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : isCharging ? (
        <div className="p-6 sm:p-8 rounded-3xl border border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF8EA] dark:bg-[#121F33] relative overflow-hidden shadow-xs transition-colors space-y-6">
          {/* Subtle accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${
            activeSession.status === 'THROTTLED' ? 'bg-amber-500' : 'bg-emerald-500'
          }`} />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-4 border-b border-[#D8C7AF]/60 dark:border-[#1E3352]/60">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  <BatteryCharging className="w-3.5 h-3.5" />
                  Charging Active
                </span>
                <span className="text-xs text-[#556880]">•</span>
                <span className="text-xs font-mono text-[#172A46] dark:text-[#E8DCC8] font-bold">
                  {activeSession.slotId} at {activeSession.stationName}
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#172A46] dark:text-[#FFF8EA] mt-1 tracking-tight">
                {activeSession.vehicle}
              </h2>
            </div>

            <button
              onClick={() => setUserNavTab('session')}
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-[#172A46] hover:bg-[#233A5E] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] dark:hover:bg-[#E8DCC8] transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-xs"
            >
              <span>View charging details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary Telemetry: Battery %, Time Remaining, Power, Energy */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 font-mono">
            <div>
              <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block mb-1">Battery Level</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
                  {Math.round(activeSession.batteryPct)}
                </span>
                <span className="text-sm font-bold text-[#556880] dark:text-[#8CA2BF]">%</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block mb-1">Time Remaining</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
                  {activeSession.estimatedMinutesRemaining}
                </span>
                <span className="text-xs font-bold text-[#556880] dark:text-[#8CA2BF]">min</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block mb-1">Charging Power</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
                  {activeSession.currentPowerKw}
                </span>
                <span className="text-xs font-bold text-[#556880] dark:text-[#8CA2BF]">kW</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block mb-1">Energy Delivered</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
                  {activeSession.energyDeliveredKwh}
                </span>
                <span className="text-xs font-bold text-[#556880] dark:text-[#8CA2BF]">kWh</span>
              </div>
            </div>
          </div>

          {/* Visual Battery Progress Bar */}
          <div className="w-full h-2 bg-[#D8C7AF]/60 dark:bg-[#0B1422] rounded-full overflow-hidden border border-[#D8C7AF] dark:border-[#1E3352]">
            <div
              className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round(activeSession.batteryPct))}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6 rounded-2xl border border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF8EA] dark:bg-[#121F33] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs transition-colors">
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA]">No active charging session</p>
            <p className="text-xs text-[#556880] dark:text-[#8CA2BF] leading-relaxed max-w-xl font-medium">
              Your vehicle is disconnected. Find an available charger bay at any nearby hub to begin rapid charging.
            </p>
          </div>
          <button
            onClick={() => setUserNavTab('stations')}
            className="text-xs font-bold px-4 py-2.5 rounded-lg bg-[#172A46] hover:bg-[#233A5E] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] dark:hover:bg-[#E8DCC8] transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-xs"
          >
            <span>Find stations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Nearby Stations Directory */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#556880] dark:text-[#8CA2BF] font-mono">
            Nearby Stations
          </h2>
          <button
            onClick={() => setUserNavTab('stations')}
            className="text-xs text-[#172A46] dark:text-[#E8DCC8] font-bold hover:underline transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>View all ({stations.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stations.slice(0, 2).map(station => {
            const hasAvailable = station.availableSlots > 0;
            return (
              <div
                key={station.id}
                className="p-5 rounded-2xl border border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF8EA] dark:bg-[#121F33] hover:border-[#172A46]/60 dark:hover:border-[#E8DCC8]/60 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight group-hover:text-[#233A5E] dark:group-hover:text-[#E8DCC8] transition-colors">
                        {station.name}
                      </h3>
                      <p className="text-xs text-[#556880] dark:text-[#8CA2BF] mt-0.5 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-[#556880] dark:text-[#8CA2BF] shrink-0" />
                        <span>{station.location}</span>
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#172A46] dark:text-[#E8DCC8] px-2 py-0.5 rounded bg-[#E8DCC8]/70 dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] shrink-0">
                      {station.distanceKm} km
                    </span>
                  </div>

                  {/* Key station specs */}
                  <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-y border-[#D8C7AF]/70 dark:border-[#1E3352] text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block">Available</span>
                      <span className={`font-bold ${hasAvailable ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#556880]'}`}>
                        {station.availableSlots} of {station.totalSlots} bays
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block">Max Speed</span>
                      <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold">{station.maxPowerKw} kW</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block">Tariff</span>
                      <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold">₹ {station.pricingPerKwh.toFixed(2)}/kWh</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-1">
                  <span className="text-xs text-[#556880] dark:text-[#8CA2BF] font-mono">
                    {station.connectorTypes.join(' • ')}
                  </span>
                  <button
                    onClick={() => setSelectedStationId(station.id)}
                    className="text-xs font-bold text-[#172A46] dark:text-[#E8DCC8] hover:underline transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-2 rounded-md"
                  >
                    <span>Select bay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid-Aware Smart Charging Explanation */}
      <div className="p-5 rounded-2xl border border-[#D8C7AF] dark:border-[#1E3352] bg-[#E8DCC8]/40 dark:bg-[#0B1422] space-y-2.5">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#172A46] dark:text-[#FFF8EA] font-mono">
            How Grid-Aware Charging Works
          </h3>
        </div>
        <p className="text-xs text-[#556880] dark:text-[#8CA2BF] leading-relaxed font-medium">
          VoltGrid monitors local transformer core telemetry in real time. Under standard conditions, all vehicles receive maximum charging output. During peak electrical grid demand, flexible charging sessions are dynamically throttled to prevent substation overloads, while urgent sessions with tight departure deadlines remain prioritized.
        </p>
      </div>

    </div>
  );
}
