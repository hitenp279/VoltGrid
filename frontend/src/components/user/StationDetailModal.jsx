import React, { useState } from 'react';
import { useGridApp } from '../../context/GridAppContext';
import { X, ArrowRight, Zap, CheckCircle2, Shield, Clock } from 'lucide-react';

export default function StationDetailModal({ stationId, onClose, onOpenAuth }) {
  const {
    stations,
    startChargingSession,
    auth
  } = useGridApp();

  const station = stations.find(s => s.id === stationId);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [priorityTier, setPriorityTier] = useState('NORMAL');
  const [departureTime, setDepartureTime] = useState('08:00 AM');
  const [vehicleName, setVehicleName] = useState(auth.user?.vehicle || 'Tesla Model Y Dual Motor');

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!station) return null;

  const handleStart = (e) => {
    e.preventDefault();
    if (!auth.isAuthenticated) {
      if (onClose) onClose();
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!selectedSlotId) return;
    startChargingSession(station.id, selectedSlotId, vehicleName, priorityTier, departureTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172A46]/60 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFF8EA] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-3xl shadow-2xl overflow-hidden my-8 transition-colors">
        
        {/* Header */}
        <div className="p-6 border-b border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF8EA] dark:bg-[#121F33] flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">{station.name}</h3>
            <p className="text-xs text-[#556880] dark:text-[#8CA2BF] mt-0.5 font-medium">{station.location}, {station.city}</p>
            <div className="flex items-center gap-3 text-xs font-mono text-[#556880] dark:text-[#8CA2BF] mt-2.5">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">{station.availableSlots} of {station.totalSlots} bays free</span>
              <span>•</span>
              <span className="font-semibold text-[#172A46] dark:text-[#FFF8EA]">Max {station.maxPowerKw} kW DC</span>
              <span>•</span>
              <span className="font-semibold text-[#172A46] dark:text-[#FFF8EA]">₹ {station.pricingPerKwh.toFixed(2)}/kWh</span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-[#556880] hover:text-[#172A46] dark:text-[#8CA2BF] dark:hover:text-[#FFF8EA] hover:bg-[#E8DCC8]/60 dark:hover:bg-[#162740] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Charger Bay Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#172A46] dark:text-[#FFF8EA] font-mono">
                Select Charging Bay
              </h4>
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#556880] dark:text-[#8CA2BF]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
                </span>
                <span className="flex items-center gap-1.5 text-[#556880] dark:text-[#8CA2BF]">
                  <span className="w-2 h-2 rounded-full bg-[#556880]" /> Occupied
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {station.slots.map(slot => {
                const isAvailable = slot.status === 'AVAILABLE';
                const isSelected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[92px] cursor-pointer shadow-xs ${
                      isSelected
                        ? 'border-[#172A46] bg-[#172A46]/10 text-[#172A46] dark:border-[#FFF8EA] dark:bg-[#FFF8EA]/10 dark:text-[#FFF8EA] ring-2 ring-[#172A46] dark:ring-[#FFF8EA]'
                        : isAvailable
                          ? 'border-[#D8C7AF] bg-[#E8DCC8]/40 hover:border-[#172A46]/60 dark:border-[#1E3352] dark:bg-[#0B1422] text-[#172A46] dark:text-[#FFF8EA]'
                          : 'border-[#D8C7AF]/50 bg-[#E8DCC8]/20 dark:border-[#1E3352]/40 dark:bg-[#0B1422]/40 text-[#556880] dark:text-[#8CA2BF] cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs font-bold tracking-tight">{slot.id}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isSelected
                          ? 'bg-[#172A46] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46]'
                          : isAvailable
                            ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                            : 'text-[#556880]'
                      }`}>
                        {isSelected ? 'Selected' : slot.status === 'AVAILABLE' ? 'Free' : 'Busy'}
                      </span>
                    </div>

                    <div className="mt-3 text-[11px] font-mono text-[#556880] dark:text-[#8CA2BF] truncate">
                      {slot.connector}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Configuration form */}
          {selectedSlotId && (
            !auth.isAuthenticated ? (
              <div className="pt-4 border-t border-[#D8C7AF] dark:border-[#1E3352] p-5 rounded-2xl bg-[#E8DCC8]/40 dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] text-center space-y-3">
                <p className="text-sm text-[#172A46] dark:text-[#FFF8EA] font-bold">
                  Authentication Required to Start Charging
                </p>
                <p className="text-xs text-[#556880] dark:text-[#8CA2BF] max-w-md mx-auto leading-relaxed font-medium">
                  You are viewing live bay availability as a guest. To reserve <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">{selectedSlotId}</span> and dispatch power to your EV, please sign in or register.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      if (onOpenAuth) onOpenAuth();
                    }}
                    className="py-2.5 px-5 rounded-xl bg-[#172A46] hover:bg-[#233A5E] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] dark:hover:bg-[#E8DCC8] font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
                  >
                    <span>Sign In to Charge at {selectedSlotId}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-5 border-t border-[#D8C7AF] dark:border-[#1E3352] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block text-[#556880] dark:text-[#8CA2BF] mb-1.5 font-bold">Vehicle Specification</label>
                    <input
                      type="text"
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FFF8EA] dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] rounded-xl text-[#172A46] dark:text-[#FFF8EA] font-medium focus:outline-none focus:border-[#172A46] dark:focus:border-[#FFF8EA]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#556880] dark:text-[#8CA2BF] mb-1.5 font-bold">Departure Target Deadline</label>
                    <input
                      type="text"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      placeholder="e.g. 08:00 AM"
                      className="w-full px-3.5 py-2 bg-[#FFF8EA] dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] rounded-xl text-[#172A46] dark:text-[#FFF8EA] font-mono font-medium focus:outline-none focus:border-[#172A46] dark:focus:border-[#FFF8EA]"
                    />
                  </div>
                </div>

                {/* Priority Selection Options */}
                <div className="space-y-2 text-xs">
                  <label className="block text-[#556880] dark:text-[#8CA2BF] font-bold">Charging Priority Profile</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPriorityTier('NORMAL')}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        priorityTier === 'NORMAL'
                          ? 'border-[#172A46] bg-[#172A46]/10 text-[#172A46] dark:border-[#FFF8EA] dark:bg-[#FFF8EA]/10 dark:text-[#FFF8EA] ring-1 ring-[#172A46] dark:ring-[#FFF8EA]'
                          : 'border-[#D8C7AF] bg-[#E8DCC8]/40 text-[#556880] dark:border-[#1E3352] dark:bg-[#0B1422] dark:text-[#8CA2BF]'
                      }`}
                    >
                      <p className="font-bold text-xs text-[#172A46] dark:text-[#FFF8EA]">Standard Priority</p>
                      <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] mt-1 leading-relaxed font-medium">
                        Full nominal charging rate for typical dwell times
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriorityTier('FLEXIBLE')}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        priorityTier === 'FLEXIBLE'
                          ? 'border-[#172A46] bg-[#172A46]/10 text-[#172A46] dark:border-[#FFF8EA] dark:bg-[#FFF8EA]/10 dark:text-[#FFF8EA] ring-1 ring-[#172A46] dark:ring-[#FFF8EA]'
                          : 'border-[#D8C7AF] bg-[#E8DCC8]/40 text-[#556880] dark:border-[#1E3352] dark:bg-[#0B1422] dark:text-[#8CA2BF]'
                      }`}
                    >
                      <p className="font-bold text-xs text-[#172A46] dark:text-[#FFF8EA]">Flexible (Grid-Aware)</p>
                      <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] mt-1 leading-relaxed font-medium">
                        Throttles to 0.5 kW during grid peak stress
                      </p>
                    </button>
                  </div>
                </div>

                {/* Start Session Button */}
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full py-3 px-4 rounded-xl bg-[#172A46] hover:bg-[#233A5E] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] dark:hover:bg-[#E8DCC8] font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-3 shadow-xs"
                >
                  <span>Confirm & Start Active Charging Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
}
