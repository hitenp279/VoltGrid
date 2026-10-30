import React, { useState, useMemo } from 'react';
import { useGridApp } from '../../context/GridAppContext';
import { Search, ArrowRight, Zap, MapPin, CheckCircle2 } from 'lucide-react';
import StationDetailModal from './StationDetailModal';

export default function StationDiscovery({ onOpenAuth }) {
  const { stations, selectedStationId, setSelectedStationId } = useGridApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [speedFilter, setSpeedFilter] = useState('ALL'); // 'ALL' | 'ULTRA' | 'FAST' | 'AC'
  const [availabilityOnly, setAvailabilityOnly] = useState(false);

  const filteredStations = useMemo(() => {
    return stations.filter(st => {
      const matchesSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpeed =
        speedFilter === 'ALL' ||
        (speedFilter === 'ULTRA' && st.maxPowerKw >= 150) ||
        (speedFilter === 'FAST' && st.maxPowerKw >= 60 && st.maxPowerKw < 150) ||
        (speedFilter === 'AC' && st.maxPowerKw < 60);

      const matchesAvail = !availabilityOnly || st.availableSlots > 0;

      return matchesSearch && matchesSpeed && matchesAvail;
    });
  }, [stations, searchQuery, speedFilter, availabilityOnly]);

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D8C7AF] dark:border-[#1E3352]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">
            Charging Stations
          </h1>
          <p className="text-xs sm:text-sm text-[#556880] dark:text-[#8CA2BF] mt-1 font-medium">
            Real-time charger availability and grid-coupled capacity across DLF CyberCity
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#556880] dark:text-[#8CA2BF] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stations, hubs, or city..."
            className="w-full pl-10 pr-3.5 py-2 bg-[#FFF8EA] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-xl text-xs sm:text-sm text-[#172A46] dark:text-[#FFF8EA] placeholder-[#556880] dark:placeholder-[#8CA2BF] focus:outline-none focus:border-[#172A46] dark:focus:border-[#FFF8EA] transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Filter Tabs & Availability Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#E8DCC8]/60 dark:bg-[#0B1422] rounded-xl border border-[#D8C7AF] dark:border-[#1E3352]">
          {[
            { id: 'ALL', label: 'All Speeds' },
            { id: 'ULTRA', label: '150 kW+ Ultra' },
            { id: 'FAST', label: '60 kW Fast' },
            { id: 'AC', label: 'Type 2 AC' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSpeedFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold text-xs ${
                speedFilter === f.id
                  ? 'bg-[#172A46] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] shadow-xs'
                  : 'text-[#556880] hover:text-[#172A46] dark:text-[#8CA2BF] dark:hover:text-[#FFF8EA]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-[#556880] dark:text-[#8CA2BF] hover:text-[#172A46] dark:hover:text-[#FFF8EA] cursor-pointer select-none text-xs font-semibold">
          <input
            type="checkbox"
            checked={availabilityOnly}
            onChange={(e) => setAvailabilityOnly(e.target.checked)}
            className="w-4 h-4 rounded border-[#D8C7AF] bg-[#FFF8EA] text-[#172A46] focus:ring-0 cursor-pointer accent-[#172A46] dark:accent-[#FFF8EA]"
          />
          <span>Available bays only</span>
        </label>
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredStations.map(station => {
          const hasAvailable = station.availableSlots > 0;
          return (
            <div
              key={station.id}
              className="p-5 sm:p-6 rounded-2xl border border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF8EA] dark:bg-[#121F33] hover:border-[#172A46]/60 dark:hover:border-[#E8DCC8]/60 transition-all flex flex-col justify-between shadow-xs group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight group-hover:text-[#233A5E] dark:group-hover:text-[#E8DCC8] transition-colors">
                      {station.name}
                    </h3>
                    <p className="text-xs text-[#556880] dark:text-[#8CA2BF] mt-0.5 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-[#556880] dark:text-[#8CA2BF] shrink-0" />
                      <span>{station.location}, {station.city}</span>
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#172A46] dark:text-[#E8DCC8] px-2 py-0.5 rounded bg-[#E8DCC8]/70 dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] shrink-0">
                    {station.distanceKm} km away
                  </span>
                </div>

                {/* Technical specs strip */}
                <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-y border-[#D8C7AF]/70 dark:border-[#1E3352] text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block">Available</span>
                    <span className={`font-bold ${hasAvailable ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#556880]'}`}>
                      {station.availableSlots} / {station.totalSlots} free
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block">Max Speed</span>
                    <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold">{station.maxPowerKw} kW</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#556880] dark:text-[#8CA2BF] uppercase font-bold block">Tariff</span>
                    <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold">₹ {station.pricingPerKwh.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-xs text-[#556880] dark:text-[#8CA2BF] font-mono">
                  {station.connectorTypes.join(' • ')}
                </span>

                <button
                  onClick={() => setSelectedStationId(station.id)}
                  className={`text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                    hasAvailable
                      ? 'bg-[#172A46] hover:bg-[#233A5E] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] dark:hover:bg-[#E8DCC8]'
                      : 'bg-[#E8DCC8] text-[#556880] border border-[#D8C7AF] dark:bg-[#162740] dark:text-[#8CA2BF] dark:border-[#263E63]'
                  }`}
                >
                  <span>Select Charger Bay & Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStations.length === 0 && (
        <div className="p-12 text-center border border-[#D8C7AF] dark:border-[#1E3352] rounded-2xl bg-[#FFF8EA] dark:bg-[#121F33]">
          <p className="text-sm text-[#556880] dark:text-[#8CA2BF] font-medium">No charging stations match your search query or filter criteria.</p>
        </div>
      )}

      {/* Station Modal */}
      {selectedStationId && (
        <StationDetailModal
          stationId={selectedStationId}
          onClose={() => setSelectedStationId(null)}
          onOpenAuth={onOpenAuth}
        />
      )}

    </div>
  );
}
