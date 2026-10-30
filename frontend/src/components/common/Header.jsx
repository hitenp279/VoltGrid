import React from 'react';
import { useGridApp } from '../../context/GridAppContext';
import { Zap, LogOut, LogIn, Activity, AlertTriangle, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function Header({ onOpenAuth }) {
  const {
    auth,
    logout,
    switchRole,
    adminViewMode,
    telemetry,
    isCritical,
    isStressSimulated,
    toggleGridStress,
    theme,
    toggleTheme
  } = useGridApp();

  const role = auth.role || 'guest';
  const isAdmin = auth.isAuthenticated && role === 'admin';

  return (
    <header className="border-b border-[#D8C7AF] dark:border-[#1E3352] bg-[#FFF9EE]/95 dark:bg-[#121F33]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand: 60/30/10 Premium EV & Grid orchestration */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-sm transition-colors">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight text-base font-sans leading-none">
                VoltGrid
              </span>
              <span className="text-[10px] font-mono text-[#556880] dark:text-[#8CA2BF] tracking-wider uppercase mt-0.5 font-medium">
                Energy & EV SCADA
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center border-l border-[#D8C7AF] dark:border-[#1E3352] pl-3.5 text-xs text-[#556880] dark:text-[#8CA2BF] font-mono">
            <span>Substation #05</span>
          </div>
        </div>

        {/* Center: Live Grid Telemetry & Admin Simulation Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={`flex items-center justify-between gap-3 px-4 py-1.5 rounded-full border text-xs font-mono transition-colors shadow-xs shrink-0 whitespace-nowrap min-w-[240px] sm:min-w-[270px] ${
            isCritical
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-[#E8DCC8]/70 dark:bg-[#0B1422] border-[#D8C7AF] dark:border-[#1E3352] text-[#172A46] dark:text-[#E8DCC8]'
          }`}>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 dark:bg-emerald-400'}`} />
              <span className={isCritical ? 'text-rose-700 dark:text-rose-300 font-semibold' : 'font-semibold'}>
                {isCritical ? 'Grid Overload' : 'Grid Normal'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 pl-1">
              <span className="w-px h-3.5 bg-[#D8C7AF] dark:bg-[#1E3352]" aria-hidden="true" />
              <span className="text-[#556880] dark:text-[#8CA2BF] tabular-nums font-medium">
                {telemetry.voltage} V <span className="text-[#D8C7AF] dark:text-[#1E3352] mx-0.5">•</span> {telemetry.current} A
              </span>
            </div>
          </div>

          {/* Backend Connection Indicator */}
          <div 
            title={telemetry.backendConnected ? 'Connected to VoltGrid SCADA Express Backend API (Port 8000)' : 'Running in Local Offline Fallback Mode'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono transition-colors shadow-xs ${
              telemetry.backendConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${telemetry.backendConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className="font-medium text-[11px]">
              {telemetry.backendConnected ? 'API Connected' : 'Local Fallback'}
            </span>
          </div>

          {/* Grid Stress Simulation: Strictly Admin-Only */}
          {isAdmin && (
            <button
              onClick={toggleGridStress}
              className={`text-xs px-2.5 py-1 rounded-md border font-mono font-medium transition-all cursor-pointer hidden xl:flex items-center gap-1.5 shadow-xs ${
                isStressSimulated
                  ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                  : 'bg-[#FFF8EA] dark:bg-[#162740] border-[#D8C7AF] dark:border-[#263E63] text-[#172A46] dark:text-[#FFF8EA] hover:bg-[#F2E5D2] dark:hover:bg-[#1E3352]'
              }`}
            >
              {isStressSimulated ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-white" />
                  <span>Reset Grid</span>
                </>
              ) : (
                <>
                  <Activity className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Simulate Stress</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Theme Switcher & User Authentication / Perspective Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
            className="p-1.5 rounded-lg border border-[#D8C7AF] dark:border-[#1E3352] bg-[#E8DCC8]/70 dark:bg-[#162740] text-[#172A46] dark:text-[#FFF8EA] hover:bg-[#DFCFAF] dark:hover:bg-[#1E3352] transition-colors cursor-pointer flex items-center justify-center shadow-xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-[#172A46]" />
            )}
          </button>

          {/* Admin perspective switcher */}
          {isAdmin && (
            <div className="hidden sm:flex items-center rounded-lg border border-[#D8C7AF] dark:border-[#1E3352] bg-[#E8DCC8]/80 dark:bg-[#0B1422] p-0.5 text-xs font-medium">
              <button
                onClick={() => switchRole('admin')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                  adminViewMode === 'admin'
                    ? 'bg-[#172A46] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] shadow-xs'
                    : 'text-[#556880] dark:text-[#8CA2BF] hover:text-[#172A46] dark:hover:text-[#FFF8EA]'
                }`}
              >
                SCADA Control
              </button>
              <button
                onClick={() => switchRole('user')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                  adminViewMode === 'user'
                    ? 'bg-[#172A46] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] shadow-xs'
                    : 'text-[#556880] dark:text-[#8CA2BF] hover:text-[#172A46] dark:hover:text-[#FFF8EA]'
                }`}
              >
                EV Driver View
              </button>
            </div>
          )}

          {auth.loading ? (
            <div className="flex items-center gap-2 text-xs text-[#556880] dark:text-[#8CA2BF] font-mono">
              <span className="w-3.5 h-3.5 border-2 border-[#172A46]/30 dark:border-[#FFF8EA]/30 border-t-[#172A46] dark:border-t-[#FFF8EA] rounded-full animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : auth.isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                isAdmin
                  ? 'bg-[#172A46]/10 dark:bg-[#FFF8EA]/10 border-[#172A46]/30 dark:border-[#FFF8EA]/30 text-[#172A46] dark:text-[#FFF8EA]'
                  : 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}>
                {isAdmin ? 'Admin' : 'Driver'}
              </span>
              <span className="text-xs text-[#172A46] dark:text-[#FFF8EA] font-semibold max-w-[130px] truncate">
                {auth.user?.name}
              </span>
              <button
                onClick={logout}
                title="Log out"
                aria-label="Log out"
                className="text-[#556880] dark:text-[#8CA2BF] hover:text-[#172A46] dark:hover:text-[#FFF8EA] p-1.5 rounded-md hover:bg-[#E8DCC8]/70 dark:hover:bg-[#162740] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-[#556880] dark:text-[#8CA2BF] font-mono hidden md:inline">
                Guest Explorer
              </span>
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#172A46] hover:bg-[#233A5E] text-[#FFF8EA] dark:bg-[#FFF8EA] dark:text-[#172A46] dark:hover:bg-[#E8DCC8] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
