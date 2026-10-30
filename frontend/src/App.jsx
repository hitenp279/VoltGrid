import React, { useState } from 'react';
import { GridAppProvider, useGridApp } from './context/GridAppContext';
import Header from './components/common/Header';
import NavigationTabs from './components/common/NavigationTabs';
import UserDashboard from './components/user/UserDashboard';
import StationDiscovery from './components/user/StationDiscovery';
import ActiveChargingCard from './components/user/ActiveChargingCard';
import ChargingHistory from './components/user/ChargingHistory';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginPage from './components/auth/LoginPage';
import { Zap } from 'lucide-react';

function MainApp() {
  const {
    auth,
    adminViewMode,
    userNavTab,
    setUserNavTab,
    setAdminViewMode,
    telemetry
  } = useGridApp();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const role = auth.role || 'guest';
  const isAdminView = auth.isAuthenticated && role === 'admin' && adminViewMode === 'admin';

  // Route & URL Hash Protection
  React.useEffect(() => {
    if (auth.loading) return;

    const handleHash = () => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (hash === 'admin') {
        if (auth.isAuthenticated && role === 'admin') {
          setAdminViewMode('admin');
        } else if (auth.isAuthenticated) {
          // Normal user trying to access admin
          window.location.hash = '#overview';
          setUserNavTab('overview');
        } else {
          // Guest trying to access admin
          window.location.hash = '#stations';
          setUserNavTab('stations');
          setIsAuthOpen(true);
        }
      } else if (['overview', 'stations', 'session', 'history'].includes(hash)) {
        if (!auth.isAuthenticated && (hash === 'overview' || hash === 'session' || hash === 'history')) {
          // Guest attempting private route
          window.location.hash = '#stations';
          setUserNavTab('stations');
        } else {
          setUserNavTab(hash);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [auth.loading, auth.isAuthenticated, role, setUserNavTab, setAdminViewMode]);

  // Loading screen while Firebase Auth and RTDB role are initializing
  if (auth.loading) {
    return (
      <div className="min-h-screen bg-[#F1E9DA] text-[#172A46] dark:bg-[#0B1422] dark:text-[#FFF8EA] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3.5 p-6 rounded-2xl bg-[#FFF9EE] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-sm">
            <Zap className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div className="flex items-center gap-2.5 font-mono text-xs text-[#556880] dark:text-[#8CA2BF]">
            <span className="w-4 h-4 border-2 border-[#172A46]/30 dark:border-[#FFF8EA]/30 border-t-[#172A46] dark:border-t-[#FFF8EA] rounded-full animate-spin" />
            <span className="font-medium">Verifying Grid Authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1E9DA] text-[#172A46] dark:bg-[#0B1422] dark:text-[#FFF8EA] flex flex-col font-sans selection:bg-[#172A46] selection:text-[#FFF8EA] dark:selection:bg-[#E8DCC8] dark:selection:text-[#0B1422] transition-colors duration-200">
      
      {/* Top Header with Theme Switcher & System Telemetry */}
      <Header onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Navigation Bar */}
      <NavigationTabs />

      {/* Main Content Area: Refined Warm Ivory Page Surface with Cream Cards */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        
        {/* Admin Dashboard: only accessible when authenticated as admin */}
        {isAdminView ? (
          <AdminDashboard />
        ) : (
          <div>
            {userNavTab === 'overview' && <UserDashboard />}
            {userNavTab === 'stations' && (
              <StationDiscovery onOpenAuth={() => setIsAuthOpen(true)} />
            )}
            {userNavTab === 'session' && (
              <ActiveChargingCard onFindStation={() => setUserNavTab('stations')} />
            )}
            {userNavTab === 'history' && <ChargingHistory />}
          </div>
        )}

      </main>

      {/* Clean Global Footer */}
      <footer className="bg-[#DFCFAF]/60 dark:bg-[#080E18] border-t border-[#D0BEA2] dark:border-[#1A2D48] px-4 lg:px-8 py-8 mt-12 text-xs text-[#556880] dark:text-[#8CA2BF] transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-sm">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="font-mono font-bold text-[#172A46] dark:text-[#FFF8EA] tracking-tight text-sm">
                VOLTGRID
              </span>
            </div>
            <p className="text-[#556880] dark:text-[#8CA2BF] text-[11px] max-w-md leading-relaxed">
              Intelligent Smart Grid & EV Fast-Charging Orchestration. Real-time transformer telemetry coupled with deadline-aware load throttling.
            </p>
          </div>

          {/* Quick Access dialog toggle in footer */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#FFF8EA] dark:bg-[#121F33] text-[#172A46] dark:text-[#FFF8EA] border border-[#D8C7AF] dark:border-[#1E3352] hover:bg-[#F5EBD9] dark:hover:bg-[#182942] text-xs font-mono transition-colors cursor-pointer shadow-xs"
            >
              Auth Dialog
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-[#D0BEA2]/60 dark:border-[#16253C] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#667890] dark:text-[#72859E]">
          <p className="flex items-center flex-wrap gap-2">
            <span>SCADA Node #05 • Polling: <code className="text-[#172A46] dark:text-[#E8DCC8] font-semibold">http://127.0.0.1:8000/api/telemetry</code></span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
              telemetry?.backendConnected 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
            }`}>
              {telemetry?.backendConnected ? 'ONLINE (CONNECTED)' : 'OFFLINE (FALLBACK)'}
            </span>
          </p>
          <p>
            B.Tech Major Project • Hiten Patel
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      {isAuthOpen && (
        <LoginPage onClose={() => setIsAuthOpen(false)} />
      )}

    </div>
  );
}

export default function App() {
  return (
    <GridAppProvider>
      <MainApp />
    </GridAppProvider>
  );
}