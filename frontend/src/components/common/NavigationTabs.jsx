import React from 'react';
import { useGridApp } from '../../context/GridAppContext';

export default function NavigationTabs() {
  const {
    auth,
    adminViewMode,
    userNavTab,
    setUserNavTab,
    adminNavTab,
    setAdminNavTab,
    activeSession,
    isCritical
  } = useGridApp();

  const role = auth.role || 'guest';
  const isAdminView = auth.isAuthenticated && role === 'admin' && adminViewMode === 'admin';

  if (isAdminView) {
    const adminTabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'infrastructure', label: 'Charging Infrastructure' },
      { id: 'telemetry', label: 'Grid Telemetry' },
      { id: 'ev-queue', label: 'EV Priority Queue' },
      { id: 'ai-management', label: 'Load Management', badge: isCritical ? 'Active' : null },
      { id: 'alerts', label: 'Alerts' },
    ];

    return (
      <nav className="border-b border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF9EE]/85 dark:bg-[#0E192B]/90 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar">
            {adminTabs.map(tab => {
              const isActive = adminNavTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminNavTab(tab.id)}
                  className={`py-3 text-xs sm:text-sm border-b-2 font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-[#172A46] text-[#172A46] dark:border-[#E8DCC8] dark:text-[#FFF8EA] font-semibold'
                      : 'border-transparent text-[#556880] hover:text-[#172A46] dark:text-[#8CA2BF] dark:hover:text-[#FFF8EA]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#172A46] dark:text-[#E8DCC8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#172A46] dark:bg-[#E8DCC8] animate-pulse" />
            <span className="font-semibold tracking-wide">SCADA OPERATOR ROOM</span>
          </div>
        </div>
      </nav>
    );
  }

  // EV Driver / Guest tabs
  const isGuest = !auth.isAuthenticated;
  const userTabs = isGuest
    ? [
        { id: 'stations', label: 'Charging Stations' },
        { id: 'session', label: 'Active Charging', badge: 'Sign In' },
        { id: 'history', label: 'Session History', badge: 'Sign In' }
      ]
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'stations', label: 'Find Stations' },
        {
          id: 'session',
          label: 'Active Charging',
          badge: activeSession.isActive
            ? (activeSession.status === 'THROTTLED' ? 'Throttled' : `${Math.round(activeSession.batteryPct)}%`)
            : null
        },
        { id: 'history', label: 'Session History' }
      ];

  return (
    <nav className="border-b border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF9EE]/85 dark:bg-[#0E192B]/90 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar">
          {userTabs.map(tab => {
            const isActive = userNavTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setUserNavTab(tab.id)}
                className={`py-3 text-xs sm:text-sm border-b-2 font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#172A46] text-[#172A46] dark:border-[#E8DCC8] dark:text-[#FFF8EA] font-semibold'
                    : 'border-transparent text-[#556880] hover:text-[#172A46] dark:text-[#8CA2BF] dark:hover:text-[#FFF8EA]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                    tab.badge === 'Throttled'
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                      : tab.badge === 'Sign In'
                        ? 'bg-[#E8DCC8] text-[#556880] border-[#D8C7AF] dark:bg-[#162740] dark:text-[#8CA2BF] dark:border-[#263E63]'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:block text-xs font-mono text-[#556880] dark:text-[#8CA2BF]">
          {isGuest
            ? 'Public Network • Real-Time Availability'
            : (isCritical ? 'Feeder: Throttling Active' : 'Feeder: Normal Rate')}
        </div>
      </div>
    </nav>
  );
}
