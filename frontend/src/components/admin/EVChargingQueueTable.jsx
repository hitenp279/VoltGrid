import React, { useState } from 'react';
import { useGridApp } from '../../context/GridAppContext';
import {
  ListOrdered,
  Clock,
  Info,
  CheckCircle2,
  TrendingDown,
  Shield
} from 'lucide-react';

export default function EVChargingQueueTable() {
  const { evQueue, isCritical } = useGridApp();
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 font-bold';
      case 'HIGH':
        return 'bg-[#172A46]/10 text-[#172A46] border-[#172A46]/30 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30 font-bold';
      case 'NORMAL':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 font-bold';
      case 'FLEXIBLE':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 font-bold';
      default:
        return 'bg-[#E8DCC8] text-[#556880] border-[#D8C7AF] dark:bg-[#162740] dark:text-[#8CA2BF] dark:border-[#263E63] font-medium';
    }
  };

  return (
    <div className="bg-[#FFF8EA] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-2xl overflow-hidden shadow-xs transition-colors">
      
      {/* Table Header */}
      <div className="p-5 border-b border-[#D8C7AF] dark:border-[#1E3352] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA] flex items-center gap-2 tracking-tight">
              <ListOrdered className="w-4 h-4 text-[#172A46] dark:text-cyan-400" />
              Deadline-Aware EV Priority Charging Queue
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8DCC8] dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] text-[#172A46] dark:text-[#E8DCC8] font-bold">
              SCADA Node #05
            </span>
          </div>
          <p className="text-xs text-[#556880] dark:text-[#8CA2BF] mt-1 font-medium">
            Dynamic prioritization based on departure deadlines, battery deficit, and transformer headroom
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#556880] dark:text-[#8CA2BF]">Dispatch Policy:</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 text-[11px] font-bold">
            Fair Share & Load Shed
          </span>
        </div>
      </div>

      {/* Priority Legend Bar */}
      <div className="px-5 py-2.5 bg-[#E8DCC8]/60 dark:bg-[#0B1422] border-b border-[#D8C7AF] dark:border-[#1E3352] flex flex-wrap items-center gap-5 text-xs font-mono">
        <span className="text-[#556880] dark:text-[#8CA2BF] uppercase tracking-wider text-[10px] font-bold">Priority Tiers:</span>
        
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-amber-800 dark:text-amber-300 font-bold text-[11px]">URGENT:</span>
          <span className="text-[#556880] dark:text-[#8CA2BF] text-[11px]">Dep &lt; 1hr • Max Unthrottled</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#172A46] dark:bg-cyan-400"></span>
          <span className="text-[#172A46] dark:text-cyan-300 font-bold text-[11px]">HIGH:</span>
          <span className="text-[#556880] dark:text-[#8CA2BF] text-[11px]">Dep 1-3 hrs • Steady Rate</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="text-blue-800 dark:text-blue-300 font-bold text-[11px]">FLEXIBLE:</span>
          <span className="text-[#556880] dark:text-[#8CA2BF] text-[11px]">Long dwell • Throttles to 0.5kW during peak</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-[#E8DCC8]/80 dark:bg-[#0B1422]/90 text-[#556880] dark:text-[#8CA2BF] uppercase text-[10px] font-mono tracking-wider border-b border-[#D8C7AF] dark:border-[#1E3352]">
            <tr>
              <th className="p-4 pl-5">Charger Bay</th>
              <th className="p-4">Vehicle & License</th>
              <th className="p-4">Battery SoC</th>
              <th className="p-4">Departure Target</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Allocated Power</th>
              <th className="p-4 pr-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8C7AF]/60 dark:divide-[#1E3352]/60 font-mono text-xs">
            {evQueue.map(item => {
              const isItemThrottled = item.throttled && isCritical;
              const requiredChargePct = Math.max(0, item.targetPct - item.batteryPct);
              return (
                <tr
                  key={item.id}
                  onClick={() => setSelectedVehicle(selectedVehicle?.id === item.id ? null : item)}
                  className={`hover:bg-[#E8DCC8]/35 dark:hover:bg-[#162740]/60 transition-colors cursor-pointer ${
                    selectedVehicle?.id === item.id ? 'bg-[#E8DCC8]/40 dark:bg-[#162740]/80' : ''
                  }`}
                >
                  <td className="p-4 pl-5 font-bold">
                    <span className="px-2 py-0.5 rounded-md bg-[#E8DCC8] dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] text-[#172A46] dark:text-[#FFF8EA] font-mono text-xs font-bold">
                      {item.id}
                    </span>
                  </td>

                  <td className="p-4 font-sans">
                    <p className="font-bold text-[#172A46] dark:text-[#FFF8EA] text-xs">{item.vehicleName}</p>
                    <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono mt-0.5">{item.licensePlate} • {item.connector}</p>
                  </td>

                  <td className="p-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold">{item.batteryPct}%</span>
                        <span className="text-[#556880] dark:text-[#8CA2BF]">Target {item.targetPct}%</span>
                      </div>
                      <div className="w-28 h-1.5 bg-[#D8C7AF]/60 dark:bg-[#0B1422] rounded-full overflow-hidden border border-[#D8C7AF] dark:border-[#1E3352]">
                        <div
                          className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full"
                          style={{ width: `${item.batteryPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] font-mono block">Needs +{requiredChargePct}%</span>
                    </div>
                  </td>

                  <td className="p-4 font-sans">
                    <p className="text-[#172A46] dark:text-[#FFF8EA] font-bold flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-[#556880] dark:text-[#8CA2BF]" />
                      {item.departureTime}
                    </p>
                    <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono mt-0.5">
                      {item.timeRemainingMinutes < 60
                        ? `(${item.timeRemainingMinutes}m left)`
                        : `In ~${Math.round(item.timeRemainingMinutes / 60)} hrs`}
                    </p>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] border inline-block ${getPriorityStyle(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>

                  <td className="p-4">
                    <p className={`text-xs font-bold font-mono ${isItemThrottled ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {item.currentPower}
                    </p>
                    {isItemThrottled && (
                      <p className="text-[10px] text-[#556880] dark:text-[#8CA2BF] line-through mt-0.5">
                        {item.nominalPower}
                      </p>
                    )}
                  </td>

                  <td className="p-4 pr-5 font-sans">
                    {isItemThrottled ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 text-[11px] font-bold font-mono">
                        <TrendingDown className="w-3 h-3" />
                        Throttled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {item.status}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dedicated Scheduling Rationale Inspector Pane */}
      <div className="border-t border-[#D8C7AF] dark:border-[#1E3352] bg-[#E8DCC8]/30 dark:bg-[#0B1422]/60 p-5">
        {selectedVehicle ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#172A46] dark:text-[#FFF8EA] font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-[#172A46] dark:text-cyan-400" />
                Scheduling Engine Rationale: {selectedVehicle.id} · {selectedVehicle.vehicleName} ({selectedVehicle.priority})
              </span>
              <span className="text-[10px] font-mono text-[#556880] dark:text-[#8CA2BF] uppercase">Active Inspector</span>
            </div>
            <p className="text-xs text-[#172A46] dark:text-[#E8DCC8] leading-relaxed font-sans font-medium pl-6">
              {selectedVehicle.priorityReason}
            </p>
          </div>
        ) : (
          <div className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#556880] dark:text-[#8CA2BF]" />
            Select any vehicle row in the queue above to inspect its real-time AI dispatch & deadline scheduling breakdown.
          </div>
        )}
      </div>

    </div>
  );
}
