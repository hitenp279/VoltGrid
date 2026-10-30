import React, { useState } from 'react';
import { useGridApp } from '../../context/GridAppContext';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  Zap,
  BatteryCharging,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  X
} from 'lucide-react';

export default function ChargingInfrastructure({ defaultExpandedStationId = null }) {
  const { stations, isCritical, activeSession } = useGridApp();
  const [expandedStationId, setExpandedStationId] = useState(defaultExpandedStationId);

  // Helper: calculate active power load for a station
  const getStationLoadKw = (station) => {
    if (!station?.slots) return 0;
    return station.slots.reduce((total, slot) => {
      // If this slot is the user's active session, use activeSession's current power
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

  // Helper: evaluate overall station status
  const getStationStatus = (station) => {
    const hasThrottled = isCritical && station.slots?.some(s =>
      s.priority === 'FLEXIBLE' && (s.status === 'OCCUPIED' || s.status === 'CHARGING')
    );
    if (hasThrottled) {
      return {
        label: 'THROTTLED',
        classes: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
      };
    }
    if (station.status === 'HIGH_LOAD' || (station.occupiedSlots / station.totalSlots) >= 0.75) {
      return {
        label: 'HIGH LOAD',
        classes: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
      };
    }
    return {
      label: 'ONLINE',
      classes: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
    };
  };

  // Helper: evaluate port status
  const getPortInfo = (station, slot) => {
    // Check if slot is the active user session
    const isUserActive = activeSession?.isActive && activeSession.stationId === station.id && activeSession.slotId === slot.id;

    if (slot.status === 'MAINTENANCE') {
      return {
        statusText: 'OFFLINE / FAULT',
        badgeClasses: 'bg-[#E8DCC8] text-[#556880] border-[#D8C7AF] dark:bg-[#162740] dark:text-[#8CA2BF] dark:border-[#263E63]',
        powerText: '0 kW',
        batteryPct: null,
        vehicleText: 'Out of Service',
        isThrottled: false
      };
    }

    if (slot.status === 'AVAILABLE' && !isUserActive) {
      return {
        statusText: 'AVAILABLE',
        badgeClasses: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        powerText: '0 kW',
        batteryPct: null,
        vehicleText: 'Unoccupied',
        isThrottled: false
      };
    }

    // Occupied or Charging
    const isThrottled = isCritical && (slot.priority === 'FLEXIBLE' || (isUserActive && activeSession.priority === 'FLEXIBLE'));
    const vehicle = isUserActive ? activeSession.vehicle : (slot.vehicle || 'Connected EV');
    const battery = isUserActive ? Math.round(activeSession.batteryPct) : slot.battery;
    const power = isUserActive
      ? `${activeSession.currentPowerKw} kW`
      : (isThrottled ? '0.5 kW' : (slot.allocatedPower || '7.2 kW'));

    return {
      statusText: isThrottled ? 'THROTTLED' : 'CHARGING',
      badgeClasses: isThrottled
        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
        : 'bg-[#172A46]/10 text-[#172A46] border-[#172A46]/30 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30 font-bold',
      powerText: power,
      batteryPct: battery,
      vehicleText: vehicle,
      isThrottled,
      nominalPower: isUserActive ? `${activeSession.nominalPowerKw || 7.2} kW` : (slot.allocatedPower || '7.2 kW')
    };
  };

  // Aggregated Summary Statistics
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

  const toggleStation = (stationId) => {
    setExpandedStationId(prev => (prev === stationId ? null : stationId));
  };

  return (
    <div className="bg-[#FFF8EA] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-2xl overflow-hidden shadow-xs space-y-0 transition-colors">
      
      {/* 1. Header & Compact Summary Strip */}
      <div className="p-5 border-b border-[#D8C7AF] dark:border-[#1E3352] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight flex items-center gap-2">
                Charging Infrastructure Overview
              </h3>
              <p className="text-xs text-[#556880] dark:text-[#8CA2BF] mt-0.5 font-medium">
                Substation Feeder Hubs • Real-time bay occupancy, power dispatch & port telemetry
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-[#556880] dark:text-[#8CA2BF] flex items-center gap-2 self-start sm:self-auto">
            <span>Aggregate EV Demand:</span>
            <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold font-mono text-sm px-2.5 py-0.5 rounded-md bg-[#E8DCC8]/70 dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352]">
              {totalInfrastructureLoadKw.toFixed(1)} kW
            </span>
          </div>
        </div>

        {/* Compact Restrained Summary Row */}
        <div data-testid="scada-summary-strip" className="px-4 py-2.5 bg-[#E8DCC8]/60 dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <span className="text-[#556880] dark:text-[#8CA2BF] uppercase text-[10px] font-bold">Stations:</span>
              <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold">{totalStations}</span>
            </div>

            <div className="flex items-center gap-1.5 border-l border-[#D8C7AF] dark:border-[#1E3352] pl-4 sm:pl-6">
              <span className="text-[#556880] dark:text-[#8CA2BF] uppercase text-[10px] font-bold">Total Ports:</span>
              <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold">{totalPorts}</span>
            </div>

            <div className="flex items-center gap-1.5 border-l border-[#D8C7AF] dark:border-[#1E3352] pl-4 sm:pl-6">
              <span className="w-2 h-2 rounded-full bg-[#172A46] dark:bg-cyan-400"></span>
              <span className="text-[#172A46] dark:text-cyan-300 font-bold">{activePorts} Active</span>
            </div>

            <div className="flex items-center gap-1.5 border-l border-[#D8C7AF] dark:border-[#1E3352] pl-4 sm:pl-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">{availablePorts} Available</span>
            </div>

            <div className="flex items-center gap-1.5 border-l border-[#D8C7AF] dark:border-[#1E3352] pl-4 sm:pl-6">
              <span className={`w-2 h-2 rounded-full ${throttledPorts > 0 ? 'bg-rose-500 animate-pulse' : 'bg-[#556880]'}`}></span>
              <span className={throttledPorts > 0 ? 'text-rose-700 dark:text-rose-300 font-bold' : 'text-[#556880] dark:text-[#8CA2BF]'}>
                {throttledPorts} Throttled
              </span>
            </div>

            {maintenancePorts > 0 && (
              <div className="flex items-center gap-1.5 border-l border-[#D8C7AF] dark:border-[#1E3352] pl-4 sm:pl-6">
                <span className="w-2 h-2 rounded-full bg-[#556880]"></span>
                <span className="text-[#556880] dark:text-[#8CA2BF] font-medium">{maintenancePorts} Offline</span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-[#556880] dark:text-[#8CA2BF] hidden lg:inline font-mono">
            SCADA Dispatch Policy: Priority Fair Share
          </span>
        </div>
      </div>

      {/* 2. Stations SCADA Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-[#E8DCC8]/70 dark:bg-[#0B1422]/90 text-[#556880] dark:text-[#8CA2BF] uppercase text-[10px] font-mono tracking-wider border-b border-[#D8C7AF] dark:border-[#1E3352]">
            <tr>
              <th className="p-4 pl-5">Station Hub</th>
              <th className="p-4">Status</th>
              <th className="p-4">Port Occupancy</th>
              <th className="p-4">Power Load</th>
              <th className="p-4 pr-5 text-right">Port Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8C7AF]/60 dark:divide-[#1E3352]/60 font-sans">
            {stations.map(station => {
              const isExpanded = expandedStationId === station.id;
              const loadKw = getStationLoadKw(station);
              const status = getStationStatus(station);
              const occupiedCount = station.slots?.filter(s => s.status === 'OCCUPIED' || s.status === 'CHARGING').length || station.occupiedSlots;
              const freeCount = station.slots?.filter(s => s.status === 'AVAILABLE').length || station.availableSlots;

              return (
                <React.Fragment key={station.id}>
                  <tr
                    onClick={() => toggleStation(station.id)}
                    className={`hover:bg-[#E8DCC8]/35 dark:hover:bg-[#162740]/60 transition-colors cursor-pointer ${
                      isExpanded ? 'bg-[#E8DCC8]/30 dark:bg-[#162740]/40' : ''
                    }`}
                  >
                    {/* Station Name & Location */}
                    <td className="p-4 pl-5">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-[#E8DCC8]/80 dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] text-[#172A46] dark:text-cyan-400 mt-0.5 shrink-0">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-[#172A46] dark:text-[#FFF8EA] text-xs sm:text-sm tracking-tight">
                            {station.name}
                          </p>
                          <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] mt-0.5 flex items-center gap-1 font-sans font-medium">
                            <MapPin className="w-3 h-3 text-[#556880] dark:text-[#8CA2BF] shrink-0" />
                            <span>{station.location}, {station.city}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Overall Status */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${status.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.label === 'THROTTLED' ? 'bg-rose-500' : status.label === 'HIGH LOAD' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {status.label}
                      </span>
                    </td>

                    {/* Ports Occupancy */}
                    <td className="p-4 font-mono text-xs">
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-[#172A46] dark:text-[#FFF8EA]">
                            {occupiedCount} / {station.totalSlots}
                          </span>
                          <span className="text-[11px] text-[#556880] dark:text-[#8CA2BF]">
                            ({freeCount} available)
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-[#D8C7AF]/60 dark:bg-[#0B1422] rounded-full overflow-hidden border border-[#D8C7AF] dark:border-[#1E3352]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              occupiedCount / station.totalSlots >= 0.75 ? 'bg-amber-500' : 'bg-[#172A46] dark:bg-cyan-400'
                            }`}
                            style={{ width: `${Math.min(100, (occupiedCount / station.totalSlots) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Current Power Load */}
                    <td className="p-4 font-mono text-xs">
                      <p className={`font-bold text-sm ${status.label === 'THROTTLED' ? 'text-rose-700 dark:text-rose-300' : 'text-[#172A46] dark:text-[#FFF8EA]'}`}>
                        {loadKw.toFixed(1)} kW
                      </p>
                      <p className="text-[10px] text-[#556880] dark:text-[#8CA2BF]">
                        Rated Max: {station.maxPowerKw} kW
                      </p>
                    </td>

                    {/* Action */}
                    <td className="p-4 pr-5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStation(station.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono inline-flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs ${
                          isExpanded
                            ? 'bg-[#172A46] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] border-[#172A46]'
                            : 'bg-[#E8DCC8]/70 hover:bg-[#DFCFAF] dark:bg-[#0B1422] dark:hover:bg-[#1A2D48] text-[#172A46] dark:text-[#E8DCC8] border-[#D8C7AF] dark:border-[#1E3352]'
                        }`}
                      >
                        <span>{isExpanded ? 'Hide Ports' : 'Inspect Ports'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* 3. Expandable Station Port Drilldown */}
                  {isExpanded && (
                    <tr className="bg-[#E8DCC8]/25 dark:bg-[#0B1422]/70">
                      <td colSpan={5} className="p-4 sm:p-5 border-y border-[#D8C7AF] dark:border-[#1E3352]">
                        <div className="space-y-4">
                          
                          {/* Station Subheader & Grid Context */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8C7AF]/70 dark:border-[#1E3352]">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold uppercase text-[#172A46] dark:text-[#FFF8EA] tracking-wider">
                                  {station.name} — Port Level SCADA Telemetry
                                </span>
                                <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold border ${status.classes}`}>
                                  ● {status.label}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] mt-0.5 font-mono">
                                Substation: <span className="text-[#172A46] dark:text-[#E8DCC8] font-bold">{station.substationId}</span> • Zone: <span className="text-[#172A46] dark:text-[#E8DCC8]">{station.gridZone}</span> • Tariff: <span className="text-[#172A46] dark:text-[#E8DCC8] font-bold">₹ {station.pricingPerKwh.toFixed(2)}/kWh</span>
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setExpandedStationId(null)}
                              className="text-[11px] text-[#556880] dark:text-[#8CA2BF] hover:text-[#172A46] dark:hover:text-[#FFF8EA] flex items-center gap-1 self-end sm:self-auto cursor-pointer font-medium"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Collapse</span>
                            </button>
                          </div>

                          {/* Individual Ports SCADA Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {station.slots.map(slot => {
                              const portInfo = getPortInfo(station, slot);
                              return (
                                <div
                                  key={slot.id}
                                  className={`p-3.5 rounded-xl border text-xs transition-all flex flex-col justify-between space-y-2.5 ${
                                    portInfo.statusText === 'THROTTLED'
                                      ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 shadow-xs'
                                      : portInfo.statusText === 'CHARGING'
                                        ? 'bg-[#FFF8EA] dark:bg-[#121F33] border-[#172A46]/30 dark:border-[#2A466E]'
                                        : portInfo.statusText === 'MAINTENANCE'
                                          ? 'bg-[#E8DCC8]/40 dark:bg-[#0B1422]/60 border-[#D8C7AF] dark:border-[#1A283D] opacity-60'
                                          : 'bg-[#FFF8EA] dark:bg-[#0E192B] border-[#D8C7AF] dark:border-[#1E3352]'
                                  }`}
                                >
                                  {/* Port Header */}
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
                                      {slot.id}
                                    </span>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${portInfo.badgeClasses}`}>
                                      {portInfo.statusText}
                                    </span>
                                  </div>

                                  {/* Connector & Power Output */}
                                  <div className="space-y-1">
                                    <div className="flex items-baseline justify-between text-xs font-mono">
                                      <span className="text-[#556880] dark:text-[#8CA2BF] text-[10px] uppercase font-bold">Allocated</span>
                                      <span className={`font-bold ${portInfo.isThrottled ? 'text-rose-700 dark:text-rose-300' : 'text-[#172A46] dark:text-[#FFF8EA]'}`}>
                                        {portInfo.powerText}
                                      </span>
                                    </div>
                                    {portInfo.isThrottled && (
                                      <p className="text-[10px] text-[#556880] dark:text-[#8CA2BF] line-through text-right font-mono">
                                        Nominal: {portInfo.nominalPower}
                                      </p>
                                    )}
                                    <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono truncate">
                                      {slot.connector}
                                    </p>
                                  </div>

                                  {/* Vehicle / Session Detail if Occupied */}
                                  {portInfo.statusText !== 'AVAILABLE' && portInfo.statusText !== 'OFFLINE / FAULT' ? (
                                    <div className="pt-2 border-t border-[#D8C7AF]/60 dark:border-[#1E3352] space-y-1.5 font-sans">
                                      <div className="flex justify-between items-baseline text-[11px]">
                                        <span className="text-[#172A46] dark:text-[#FFF8EA] font-semibold truncate max-w-[120px]" title={portInfo.vehicleText}>
                                          {portInfo.vehicleText}
                                        </span>
                                        {portInfo.batteryPct !== null && (
                                          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                                            {portInfo.batteryPct}% SoC
                                          </span>
                                        )}
                                      </div>

                                      {portInfo.batteryPct !== null && (
                                        <div className="w-full h-1 bg-[#D8C7AF]/60 dark:bg-[#0B1422] rounded-full overflow-hidden border border-[#D8C7AF] dark:border-[#1E3352]">
                                          <div
                                            className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full"
                                            style={{ width: `${portInfo.batteryPct}%` }}
                                          />
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between text-[10px] font-mono text-[#556880] dark:text-[#8CA2BF] pt-0.5">
                                        {slot.priority && (
                                          <span className={`px-1.5 py-0.2 rounded font-bold border ${
                                            slot.priority === 'URGENT'
                                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                              : slot.priority === 'FLEXIBLE'
                                                ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                                                : 'bg-[#E8DCC8] text-[#172A46] border-[#D8C7AF] dark:bg-[#162740] dark:text-[#E8DCC8]'
                                          }`}>
                                            {slot.priority}
                                          </span>
                                        )}
                                        {slot.departure && (
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-[#556880] dark:text-[#8CA2BF]" />
                                            {slot.departure}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="pt-2 border-t border-[#D8C7AF]/60 dark:border-[#1E3352] text-[11px] font-mono text-[#556880] dark:text-[#8CA2BF] flex items-center justify-between">
                                      <span>Ready for EV dispatch</span>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                  )}

                                </div>
                              );
                            })}
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Footer Note */}
      <div className="p-3.5 bg-[#E8DCC8]/60 dark:bg-[#0B1422]/90 border-t border-[#D8C7AF] dark:border-[#1E3352] flex items-center justify-between text-[11px] font-mono text-[#556880] dark:text-[#8CA2BF]">
        <span>Displaying {stations.length} Grid-Connected Charging Depots</span>
        <span>SCADA Telemetry Bus #41</span>
      </div>

    </div>
  );
}
