import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import { History, Zap, IndianRupee, Layers } from 'lucide-react';

export default function ChargingHistory() {
  const { history, auth, setUserNavTab } = useGridApp();

  if (!auth.isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 p-8 bg-[#FFF8EA] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-3xl shadow-xs transition-colors">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-xs">
          <History className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#172A46] dark:text-[#FFF8EA]">Authentication Required</h2>
        <p className="text-xs sm:text-sm text-[#556880] dark:text-[#8CA2BF] leading-relaxed font-medium">
          Personal charging session history is only available to authenticated EV Drivers. Please sign in to view your past charging records and invoices.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setUserNavTab('stations')}
            className="text-xs font-bold px-5 py-2.5 rounded-xl bg-[#172A46] hover:bg-[#233A5E] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] dark:hover:bg-[#E8DCC8] transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
          >
            <span>Browse public stations</span>
          </button>
        </div>
      </div>
    );
  }

  const totalKwh = history.reduce((sum, h) => sum + (h.energyDeliveredKwh || 0), 0);
  const totalCost = history.reduce((sum, h) => {
    const numericCost = parseFloat((h.cost || '0').replace(/[^0-9.]/g, '')) || 0;
    return sum + numericCost;
  }, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D8C7AF] dark:border-[#1E3352]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight">Charging History</h1>
          <p className="text-xs sm:text-sm text-[#556880] dark:text-[#8CA2BF] mt-1 font-medium">
            Verified dispatch sessions for vehicle <span className="font-mono text-[#172A46] dark:text-[#E8DCC8] font-bold">{auth.user?.plate || 'DL-01-EV-4092'}</span>
          </p>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-6 text-xs font-mono bg-[#FFF8EA] dark:bg-[#121F33] px-4 py-2.5 rounded-2xl border border-[#D8C7AF] dark:border-[#1E3352] shadow-xs">
          <div>
            <span className="text-[#556880] dark:text-[#8CA2BF] block text-[10px] uppercase font-bold">Total Energy</span>
            <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold text-sm">{totalKwh.toFixed(1)} kWh</span>
          </div>
          <div className="border-l border-[#D8C7AF] dark:border-[#1E3352] pl-4">
            <span className="text-[#556880] dark:text-[#8CA2BF] block text-[10px] uppercase font-bold">Total Spent</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">₹ {totalCost.toFixed(2)}</span>
          </div>
          <div className="border-l border-[#D8C7AF] dark:border-[#1E3352] pl-4">
            <span className="text-[#556880] dark:text-[#8CA2BF] block text-[10px] uppercase font-bold">Sessions</span>
            <span className="text-[#172A46] dark:text-[#FFF8EA] font-bold text-sm">{history.length}</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl border border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF8EA] dark:bg-[#121F33] overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#E8DCC8]/80 dark:bg-[#0B1422]/90 text-[#556880] dark:text-[#8CA2BF] uppercase text-[10px] font-mono tracking-wider border-b border-[#D8C7AF] dark:border-[#1E3352]">
              <tr>
                <th className="py-3.5 px-5">Date & Station</th>
                <th className="py-3.5 px-4">Bay</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Energy</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Cost</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8C7AF]/60 dark:divide-[#1E3352]/60 font-sans">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-[#E8DCC8]/30 dark:hover:bg-[#162740]/50 transition-colors">
                  <td className="py-3.5 px-5">
                    <p className="font-bold text-[#172A46] dark:text-[#FFF8EA] text-xs">{item.stationName}</p>
                    <p className="text-[11px] text-[#556880] dark:text-[#8CA2BF] font-mono mt-0.5">{item.date}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#E8DCC8]/70 dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] text-[#172A46] dark:text-[#E8DCC8] text-[11px] font-bold">
                      {item.bayId}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#172A46] dark:text-[#FFF8EA] font-semibold text-xs">
                    {item.vehicle}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#172A46] dark:text-[#FFF8EA] font-bold">
                    {item.energyDeliveredKwh} kWh
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#556880] dark:text-[#8CA2BF]">
                    {item.duration}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                      item.priorityTier === 'FLEXIBLE'
                        ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                        : item.priorityTier === 'URGENT'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                          : 'bg-[#E8DCC8] text-[#172A46] border-[#D8C7AF] dark:bg-[#162740] dark:text-[#E8DCC8]'
                    }`}>
                      {item.priorityTier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#172A46] dark:text-[#FFF8EA] font-bold">
                    {item.cost}
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono">
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                      Settled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
