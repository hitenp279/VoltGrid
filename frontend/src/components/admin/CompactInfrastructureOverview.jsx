import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import { Layers, ArrowRight } from 'lucide-react';

export default function CompactInfrastructureOverview() {
  const { stations, isCritical, setAdminNavTab, activeSession } = useGridApp();

  // Helper: calculate active power load for a station
  const getStationLoadKw = (station) => {
    if (!station?.slots) return 0;
    return station.slots.reduce((total, slot) => {
      if (activeSession?.isActive && activeSession.stationId === station.id && activeSession.slotId === slot.id) {
        return total + (activeSession.currentPowerKw || 0);
      }
      if (slot.status !== 'OCCUPIED' && slot.status !== 'CHARGING') return total;
      if (isCritical && slot.priority === 'FLEXIBLE') {
        return total + 0.5;
      }
      const num = parseFloat((slot.allocatedPower || '0').replace(/[^0-9.]/g, '')) || 0;
      return total + num;
    }, 0);
  };

  const totalStations = stations.length;
  const allSlots = stations.flatMap(st => st.slots || []);
  const totalPorts = allSlots.length;
  const activePorts = allSlots.filter(sl => sl.status === 'OCCUPIED' || sl.status === 'CHARGING').length;
  const availablePorts = allSlots.filter(sl => sl.status === 'AVAILABLE').length;
  const maintenancePorts = allSlots.filter(sl => sl.status === 'MAINTENANCE').length;
  const throttledPorts = isCritical
    ? allSlots.filter(sl => sl.priority === 'FLEXIBLE' && (sl.status === 'OCCUPIED' || sl.status === 'CHARGING')).length
    : 0;

  const totalInfrastructureLoadKw = stations.reduce((acc, st) => acc + getStationLoadKw(st), 0);

  return (
    <div className="bg-[#FFF9EE] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-2xl shadow-xs p-6 space-y-4 font-sans transition-colors h-full flex flex-col justify-between">
      
      {/* Header & Quick Action */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D8C7AF]/60 dark:border-[#1E3352]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
              Charging Infrastructure Overview
            </h3>
            <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono">
              4 Substation Hubs · {totalPorts} Fleet Charging Bays
            </p>
          </div>
        </div>

        <button
          onClick={() => setAdminNavTab('infrastructure')}
          className="text-xs font-mono font-bold text-[#172A46] hover:text-[#233A5E] dark:text-[#E8DCC8] dark:hover:text-[#FFF8EA] flex items-center gap-1 transition-colors group cursor-pointer"
        >
          <span>View Infrastructure</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Restrained SCADA Summary Strip */}
      <div
        data-testid="scada-summary-strip"
        className="py-2.5 px-3 bg-[#F1E9DA]/50 dark:bg-[#0B1422]/60 border-y border-[#D8C7AF]/60 dark:border-[#1E3352]/60 rounded-lg flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono"
      >
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[#556880] dark:text-[#8CA2BF] uppercase text-[10px] font-bold">Stations:</span>
            <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold">{totalStations}</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-[#D8C7AF]/70 dark:border-[#1E3352]/70 pl-3 sm:pl-4">
            <span className="text-[#556880] dark:text-[#8CA2BF] uppercase text-[10px] font-bold">Total Ports:</span>
            <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold">{totalPorts}</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-[#D8C7AF]/70 dark:border-[#1E3352]/70 pl-3 sm:pl-4">
            <span className="w-2 h-2 rounded-full bg-[#172A46] dark:bg-cyan-400"></span>
            <span className="text-[#172A46] dark:text-cyan-300 font-bold">{activePorts} Active</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-[#D8C7AF]/70 dark:border-[#1E3352]/70 pl-3 sm:pl-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">{availablePorts} Available</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-[#D8C7AF]/70 dark:border-[#1E3352]/70 pl-3 sm:pl-4">
            <span className={`w-2 h-2 rounded-full ${throttledPorts > 0 ? 'bg-rose-500 animate-pulse' : 'bg-[#556880] dark:bg-slate-600'}`}></span>
            <span className={throttledPorts > 0 ? 'text-rose-700 dark:text-rose-300 font-bold' : 'text-[#556880] dark:text-[#8CA2BF]'}>
              {throttledPorts} Throttled
            </span>
          </div>

          {maintenancePorts > 0 && (
            <div className="flex items-center gap-1.5 border-l border-[#D8C7AF]/70 dark:border-[#1E3352]/70 pl-3 sm:pl-4">
              <span className="w-2 h-2 rounded-full bg-[#556880]"></span>
              <span className="text-[#556880] dark:text-[#8CA2BF]">{maintenancePorts} Offline</span>
            </div>
          )}
        </div>

        <div className="text-[11px] font-mono">
          <span className="text-[#556880] dark:text-[#8CA2BF]">Load: </span>
          <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold tabular-nums">{totalInfrastructureLoadKw.toFixed(1)} kW</span>
        </div>
      </div>

      {/* Clean Operational Hub Fleet Table (High-density asset register) */}
      <div className="overflow-x-auto flex-1 flex flex-col justify-center">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[#556880] dark:text-[#8CA2BF] uppercase text-[10px] tracking-wider border-b border-[#D8C7AF]/60 dark:border-[#1E3352]/60">
            <tr>
              <th className="py-2 px-2 font-bold">Station</th>
              <th className="py-2 px-2 font-bold">Status</th>
              <th className="py-2 px-2 font-bold">Ports</th>
              <th className="py-2 px-2 font-bold">Load</th>
              <th className="py-2 px-2 font-bold">Utilization</th>
              <th className="py-2 px-2 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8C7AF]/40 dark:divide-[#1E3352]/40">
            {stations.map(station => {
              const loadKw = getStationLoadKw(station);
              const occupied = station.slots?.filter(s => s.status === 'OCCUPIED' || s.status === 'CHARGING').length || station.occupiedSlots;
              const hasThrottled = isCritical && station.slots?.some(s => s.priority === 'FLEXIBLE' && (s.status === 'OCCUPIED' || s.status === 'CHARGING'));
              const hubName = `${station.name.split(' ')[0]} Hub`;
              const utilPct = Math.round((occupied / station.totalSlots) * 100);

              return (
                <tr
                  key={station.id}
                  onClick={() => setAdminNavTab('infrastructure')}
                  className="hover:bg-[#F1E9DA]/40 dark:hover:bg-[#162740]/50 transition-colors cursor-pointer group"
                >
                  <td className="py-2.5 px-2 font-bold text-[#172A46] dark:text-[#FFF8EA]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#172A46] dark:bg-cyan-400" />
                      <span className="group-hover:text-[#233A5E] dark:group-hover:text-[#E8DCC8] transition-colors truncate">
                        {hubName}
                      </span>
                    </div>
                  </td>

                  <td className="py-2.5 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${
                      hasThrottled
                        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        : utilPct >= 75
                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${hasThrottled ? 'bg-rose-500 animate-pulse' : utilPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {hasThrottled ? 'THROTTLED' : utilPct >= 75 ? 'HIGH LOAD' : 'ONLINE'}
                    </span>
                  </td>

                  <td className="py-2.5 px-2 text-[#172A46] dark:text-[#FFF8EA]">
                    <span>{occupied}/{station.totalSlots} bays</span>
                  </td>

                  <td className="py-2.5 px-2 font-bold text-[#172A46] dark:text-[#E8DCC8] tabular-nums">
                    {loadKw.toFixed(0)} kW
                  </td>

                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-[#D8C7AF]/60 dark:bg-[#162740] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${utilPct >= 75 ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-400'}`}
                          style={{ width: `${utilPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] tabular-nums">{utilPct}%</span>
                    </div>
                  </td>

                  <td className="py-2.5 px-2 text-right">
                    <span className="text-[#172A46] dark:text-[#E8DCC8] group-hover:translate-x-0.5 inline-flex items-center gap-1 transition-all text-[11px] font-bold">
                      Inspect Hub <ArrowRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
