import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  INITIAL_STATIONS,
  INITIAL_EV_QUEUE,
  INITIAL_USER_SESSIONS_HISTORY,
  INITIAL_GRID_EVENTS
} from '../data/mockData';
import { auth as firebaseAuth, database } from '../firebase/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';



const GridAppContext = createContext(null);

export function GridAppProvider({ children }) {
  // Auth state: starts in loading mode while Firebase Auth state is resolved
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isGuest: true,
    role: 'guest',
    user: {
      name: 'Guest Explorer',
      role: 'guest'
    },
    loading: true
  });

  // Admin View Mode: for authenticated administrators to toggle between SCADA Admin and EV Driver view
  const [adminViewMode, setAdminViewMode] = useState('admin'); // 'admin' | 'user'

  // Navigation state
  const [userNavTab, setUserNavTab] = useState('stations'); // default to 'stations' for guests, updated to 'overview' on login
  const [adminNavTab, setAdminNavTab] = useState('overview'); // 'overview' | 'telemetry' | 'ev-queue' | 'ai-management' | 'alerts'

  // Telemetry state (from existing App.jsx)
  const [telemetry, setTelemetry] = useState({
    voltage: 230,
    current: 14.2,
    temperature: 38.5,
    action: 'NORMAL',
    transformerUtilization: 58.4,
    frequency: 50.02,
    backendConnected: false
  });

  const [voltageHistory, setVoltageHistory] = useState([228.4, 229.8, 230.2, 231.0, 229.5, 230.1, 230.8, 229.9, 230.4]);
  const [loadHistory, setLoadHistory] = useState([13.8, 14.1, 14.5, 13.9, 14.2, 14.8, 14.0, 14.3, 14.2]);

  // Demo Grid Stress Simulation Toggle
  const [isStressSimulated, setIsStressSimulated] = useState(false);

  // Light/Dark Theme state (Default: 'light')
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voltgrid_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      try {
        localStorage.setItem('voltgrid_theme', theme);
      } catch (e) {
        // ignore
      }
    }
  }, [theme]);

  // Stations & EV queue state
  const [stations, setStations] = useState(INITIAL_STATIONS);
  const [evQueue, setEvQueue] = useState(INITIAL_EV_QUEUE);
  const [history, setHistory] = useState(INITIAL_USER_SESSIONS_HISTORY);
  const [events, setEvents] = useState(INITIAL_GRID_EVENTS);

  // Active User Charging Session
  const [activeSession, setActiveSession] = useState({
    isActive: true,
    stationId: 'station-01',
    stationName: 'CyberHub Ultra-Fast Depot',
    slotId: 'BAY-01',
    vehicle: 'Tesla Model Y Dual Motor',
    batteryPct: 74,
    targetPct: 90,
    energyDeliveredKwh: 38.6,
    nominalPowerKw: 7.2,
    currentPowerKw: 7.2,
    priority: 'URGENT',
    departureTime: '06:00 AM',
    durationSeconds: 1420,
    startTime: '11:15 PM',
    connector: 'CCS2 180kW',
    estimatedMinutesRemaining: 18,
    status: 'CHARGING', // 'CHARGING' | 'THROTTLED' | 'COMPLETED'
    costSoFar: 559.70
  });

  // Selected station for modal/detail view
  const [selectedStationId, setSelectedStationId] = useState(null);

  // Helper to append real-time event (stored locally and synced with backend SQLite)
  const addEvent = useCallback((message, type = 'INFO', source = 'AI Engine') => {
    const newEvt = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      source,
      message
    };
    setEvents(prev => [newEvt, ...prev.slice(0, 29)]);
    api.addEvent(newEvt).catch(() => {
      // Local fallback if backend is offline
    });
  }, []);

  // Initial load: Fetch stations, EV queue, sessions history, events, and active session from backend
  useEffect(() => {
    let isMounted = true;
    const loadInitialBackendData = async () => {
      try {
        const [stationsRes, queueRes, historyRes, eventsRes, activeSessRes] = await Promise.allSettled([
          api.getStations(),
          api.getEvQueue(),
          api.getSessionHistory(),
          api.getEvents(),
          api.getActiveSession()
        ]);

        if (!isMounted) return;

        if (stationsRes.status === 'fulfilled' && Array.isArray(stationsRes.value) && stationsRes.value.length > 0) {
          setStations(stationsRes.value);
        }
        if (queueRes.status === 'fulfilled' && Array.isArray(queueRes.value) && queueRes.value.length > 0) {
          setEvQueue(queueRes.value.map(item => ({
            ...item,
            throttled: Boolean(item.throttled)
          })));
        }
        if (historyRes.status === 'fulfilled' && Array.isArray(historyRes.value)) {
          setHistory(historyRes.value);
        }
        if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value) && eventsRes.value.length > 0) {
          setEvents(eventsRes.value);
        }
        if (activeSessRes.status === 'fulfilled' && activeSessRes.value && activeSessRes.value.isActive !== undefined) {
          setActiveSession(prev => ({
            ...prev,
            ...activeSessRes.value,
            isActive: Boolean(activeSessRes.value.isActive)
          }));
        }
      } catch (err) {
        console.warn('Backend initial synchronization notice (running in local mode):', err?.message || err);
      }
    };

    loadInitialBackendData();
    return () => { isMounted = false; };
  }, []);

  // Polling backend API (SCADA telemetry stream with local simulation fallback)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getTelemetry();
        if (data) {
          const { voltage, current, action, temperature, transformerUtilization, frequency, isStressSimulated: backendStress } = data;
          const utilization = transformerUtilization ?? Math.min(100, Math.round(((current || 14) / 45) * 100));

          setTelemetry({
            voltage: voltage ?? 230,
            current: current ?? 14.2,
            temperature: temperature ?? 38.5,
            action: isStressSimulated ? 'THROTTLE_POWER' : (action || 'NORMAL'),
            transformerUtilization: utilization,
            frequency: frequency ?? (50.0 + ((Math.random() - 0.5) * 0.04)),
            backendConnected: true
          });

          if (backendStress !== undefined && backendStress !== isStressSimulated) {
            setIsStressSimulated(backendStress);
          }

          setVoltageHistory(prev => [...prev.slice(-14), Number((voltage ?? 230).toFixed(1))]);
          setLoadHistory(prev => [...prev.slice(-14), Number((current ?? 14.2).toFixed(1))]);
        }
      } catch {
        // Backend offline fallback - realistic continuous telemetry flow
        const baseCurrent = isStressSimulated ? 34.2 : 14.2;
        const currentJitter = (Math.random() - 0.5) * (isStressSimulated ? 1.8 : 0.6);
        const curVal = Number((baseCurrent + currentJitter).toFixed(1));

        const baseVolt = isStressSimulated ? 221.5 : 230.4;
        const voltJitter = (Math.random() - 0.5) * 0.8;
        const voltVal = Number((baseVolt + voltJitter).toFixed(1));

        const baseTemp = isStressSimulated ? 58.2 : 39.1;
        const tempVal = Number((baseTemp + (Math.random() - 0.5) * 0.3).toFixed(1));

        const utilization = isStressSimulated ? 88.4 : Math.min(100, Math.round((curVal / 28) * 100));
        const currentAction = isStressSimulated ? 'THROTTLE_POWER' : 'NORMAL';

        setTelemetry(prev => ({
          ...prev,
          voltage: voltVal,
          current: curVal,
          temperature: tempVal,
          action: currentAction,
          transformerUtilization: utilization,
          frequency: Number((50.0 + (Math.random() - 0.5) * 0.03).toFixed(2)),
          backendConnected: false
        }));

        setVoltageHistory(prev => [...prev.slice(-14), voltVal]);
        setLoadHistory(prev => [...prev.slice(-14), curVal]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [isStressSimulated]);

  // Handle dynamic throttling updates to EV Queue and Active User Session
  const isCritical = telemetry.action === 'THROTTLE_POWER';

  useEffect(() => {
    // Synchronize EV Queue power based on grid critical action
    setEvQueue(prev =>
      prev.map(item => {
        if (item.priority === 'FLEXIBLE') {
          return {
            ...item,
            currentPower: isCritical ? '0.5 kW' : item.nominalPower,
            throttled: isCritical,
            status: isCritical ? 'THROTTLED (GRID RELIEF)' : 'CHARGING'
          };
        }
        return item;
      })
    );

    // If active session is flexible, reflect throttling
    if (activeSession.isActive) {
      if (activeSession.priority === 'FLEXIBLE') {
        setActiveSession(prev => ({
          ...prev,
          currentPowerKw: isCritical ? 0.5 : prev.nominalPowerKw,
          status: isCritical ? 'THROTTLED' : 'CHARGING'
        }));
      } else {
        // Urgent or High gets full requested power
        setActiveSession(prev => ({
          ...prev,
          currentPowerKw: prev.nominalPowerKw,
          status: 'CHARGING'
        }));
      }
    }
  }, [isCritical, activeSession.isActive, activeSession.priority]);

  // Simulation tick for active session progress
  useEffect(() => {
    if (!activeSession.isActive || activeSession.batteryPct >= activeSession.targetPct) {
      return;
    }

    const timer = setInterval(() => {
      setActiveSession(prev => {
        if (!prev.isActive) return prev;

        const powerRate = prev.currentPowerKw; // kW
        // Advance battery and delivered kWh smoothly
        const addedKwh = (powerRate / 3600) * 1.5; // accelerated demo rate
        const newDelivered = Number((prev.energyDeliveredKwh + addedKwh).toFixed(2));
        const newDuration = prev.durationSeconds + 1;

        // Battery increases every ~5 seconds by 1% at normal 7.2kW, or slower if throttled
        const pctIncrement = powerRate > 2.0 ? 0.2 : 0.02;
        const newPct = Math.min(prev.targetPct, Number((prev.batteryPct + pctIncrement).toFixed(1)));
        const newCost = Number((newDelivered * 14.5).toFixed(2));

        const remainingPct = Math.max(0, prev.targetPct - newPct);
        const estMinutes = Math.max(1, Math.round((remainingPct / (powerRate > 2 ? 0.8 : 0.1))));

        if (newPct >= prev.targetPct) {
          addEvent(`Active charging completed for ${prev.vehicle} at ${prev.slotId}`, 'SUCCESS', 'EV Dispatcher');
          const completedSession = {
            ...prev,
            batteryPct: 100,
            status: 'COMPLETED',
            currentPowerKw: 0,
            estimatedMinutesRemaining: 0
          };
          api.updateActiveSession(completedSession).catch(() => {});
          return completedSession;
        }

        const nextActive = {
          ...prev,
          batteryPct: newPct,
          energyDeliveredKwh: newDelivered,
          durationSeconds: newDuration,
          costSoFar: newCost,
          estimatedMinutesRemaining: estMinutes
        };

        // Periodically sync active charging progress to backend
        if (newDuration % 5 === 0) {
          api.updateActiveSession(nextActive).catch(() => {});
        }

        return nextActive;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession.isActive, activeSession.batteryPct, activeSession.targetPct, addEvent]);

  // User Actions
  const startChargingSession = async (stationId, slotId, vehicleName = 'Tesla Model Y Dual Motor', priority = 'NORMAL', departureTime = '08:00 AM') => {
    const station = stations.find(s => s.id === stationId);
    if (!station) return;

    const nominalKw = slotId.includes('180') ? 150 : (slotId.includes('60') ? 60 : 7.2);
    const initialPower = (priority === 'FLEXIBLE' && isCritical) ? 0.5 : 7.2;

    // Update station slot status
    setStations(prev =>
      prev.map(st => {
        if (st.id !== stationId) return st;
        return {
          ...st,
          availableSlots: Math.max(0, st.availableSlots - 1),
          occupiedSlots: st.occupiedSlots + 1,
          slots: st.slots.map(sl => {
            if (sl.id === slotId) {
              return {
                ...sl,
                status: 'OCCUPIED',
                vehicle: vehicleName,
                battery: 52,
                allocatedPower: `${initialPower} kW`,
                priority,
                departure: departureTime
              };
            }
            return sl;
          })
        };
      })
    );

    const newActiveSession = {
      isActive: true,
      stationId: station.id,
      stationName: station.name,
      slotId,
      vehicle: vehicleName,
      batteryPct: 52,
      targetPct: 85,
      energyDeliveredKwh: 0.1,
      nominalPowerKw: nominalKw,
      currentPowerKw: initialPower,
      priority,
      departureTime,
      durationSeconds: 0,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      connector: 'CCS2 150kW High-Power',
      estimatedMinutesRemaining: 28,
      status: (priority === 'FLEXIBLE' && isCritical) ? 'THROTTLED' : 'CHARGING',
      costSoFar: 0.00
    };

    setActiveSession(newActiveSession);
    addEvent(`New EV session initialized: ${vehicleName} at ${station.name} (${slotId}) with priority ${priority}`, 'INFO', 'EV Dispatcher');
    setUserNavTab('session');
    setSelectedStationId(null);

    // Sync with backend API
    try {
      await api.startStationSession(stationId, slotId, { vehicleName, priority, departureTime });
      await api.updateActiveSession(newActiveSession);
      const updatedStations = await api.getStations();
      if (Array.isArray(updatedStations) && updatedStations.length > 0) {
        setStations(updatedStations);
      }
    } catch (e) {
      console.warn('Backend session start notice (running in local mode):', e?.message || e);
    }
  };

  const stopChargingSession = async () => {
    if (!activeSession.isActive) return;

    // Add to history
    const completedRecord = {
      id: `sess-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Just now',
      stationName: activeSession.stationName,
      bayId: activeSession.slotId,
      vehicle: activeSession.vehicle,
      energyDeliveredKwh: activeSession.energyDeliveredKwh,
      duration: `${Math.round(activeSession.durationSeconds / 60)} mins`,
      cost: `₹ ${activeSession.costSoFar.toFixed(2)}`,
      priorityTier: activeSession.priority,
      status: 'COMPLETED',
      peakPower: `${activeSession.nominalPowerKw} kW`
    };

    setHistory(prev => [completedRecord, ...prev]);

    // Free up slot in station
    setStations(prev =>
      prev.map(st => {
        if (st.id !== activeSession.stationId) return st;
        return {
          ...st,
          availableSlots: Math.min(st.totalSlots, st.availableSlots + 1),
          occupiedSlots: Math.max(0, st.occupiedSlots - 1),
          slots: st.slots.map(sl => {
            if (sl.id === activeSession.slotId) {
              return {
                ...sl,
                status: 'AVAILABLE',
                vehicle: null,
                battery: null,
                allocatedPower: '0 kW',
                priority: null,
                departure: null
              };
            }
            return sl;
          })
        };
      })
    );

    addEvent(`Charging session finalized for ${activeSession.vehicle}. Total energy: ${activeSession.energyDeliveredKwh} kWh`, 'SUCCESS', 'Billing Node');

    const prevStationId = activeSession.stationId;
    const prevSlotId = activeSession.slotId;

    setActiveSession(prev => ({
      ...prev,
      isActive: false,
      status: 'COMPLETED'
    }));

    // Sync with backend API
    try {
      if (prevStationId && prevSlotId) {
        await api.stopStationSession(prevStationId, prevSlotId);
      }
      await api.addSessionHistory(completedRecord);
      await api.updateActiveSession({ ...activeSession, isActive: 0, status: 'COMPLETED' });
      const [updatedStations, updatedHistory] = await Promise.all([
        api.getStations(),
        api.getSessionHistory()
      ]);
      if (Array.isArray(updatedStations) && updatedStations.length > 0) setStations(updatedStations);
      if (Array.isArray(updatedHistory)) setHistory(updatedHistory);
    } catch (e) {
      console.warn('Backend session stop notice (running in local mode):', e?.message || e);
    }
  };

  // Firebase Auth state listener to persist and restore session across page refreshes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile = null;
        try {
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snap = await get(userRef);
          if (snap.exists()) {
            profile = snap.val();
          }
        } catch (err) {
          console.warn('Could not read user profile from Realtime Database:', err?.message || err);
        }

        // Realtime Database role is the absolute source of truth.
        // Role is strictly determined from the /users/{uid} profile:
        // If profile exists and profile.role === 'admin', granted admin. Otherwise 'user'.
        const role = profile?.role === 'admin' ? 'admin' : 'user';
        const name = profile?.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'EV Driver');
        const email = profile?.email || firebaseUser.email;
        const createdAt = profile?.createdAt || null;

        // Login / session restoration is STRICTLY READ-ONLY.
        // NO client-side writes to /users/{uid} are performed here.
        setAuth({
          isAuthenticated: true,
          isGuest: false,
          role,
          user: {
            uid: firebaseUser.uid,
            name,
            email,
            role,
            createdAt,
            vehicle: role === 'user' ? 'Tesla Model Y Dual Motor' : 'SCADA Admin Node',
            plate: role === 'user' ? 'DL-01-EV-4092' : 'SYS-ADMIN-01'
          },
          loading: false
        });

        if (role === 'admin') {
          setAdminViewMode('admin');
        }
      } else {
        // Unauthenticated visitor => GUEST
        setAuth({
          isAuthenticated: false,
          isGuest: true,
          role: 'guest',
          user: {
            name: 'Guest Explorer',
            role: 'guest'
          },
          loading: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Firebase Auth: Sign in with email and password
  const loginWithFirebase = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const firebaseUser = userCredential.user;
    const uid = firebaseUser.uid;

    let profile = null;
    try {
      const snap = await get(ref(database, `users/${uid}`));
      if (snap.exists()) {
        profile = snap.val();
      }
    } catch (err) {
      console.warn('Could not fetch user profile from RTDB on login:', err?.message || err);
    }

    // Role is strictly determined from the Realtime Database profile.
    // If profile.role === 'admin', granted admin. Otherwise 'user'.
    const role = profile?.role === 'admin' ? 'admin' : 'user';
    const name = profile?.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'EV Driver');
    const userEmail = profile?.email || firebaseUser.email;
    const createdAt = profile?.createdAt || null;

    // Login is STRICTLY READ-ONLY.
    // NO client-side writes to /users/{uid} are performed here.
    const loggedInUser = {
      uid,
      name,
      email: userEmail,
      role,
      createdAt,
      vehicle: role === 'user' ? 'Tesla Model Y Dual Motor' : 'SCADA Admin Node',
      plate: role === 'user' ? 'DL-01-EV-4092' : 'SYS-ADMIN-01'
    };

    setAuth({
      isAuthenticated: true,
      isGuest: false,
      role,
      user: loggedInUser,
      loading: false
    });

    if (role === 'admin') {
      setAdminViewMode('admin');
    } else {
      setUserNavTab('overview');
    }

    addEvent(`User signed in: ${name} (${firebaseUser.email})`, 'INFO', 'Auth Service');
    api.upsertUserProfile({ uid, name, email: userEmail, role }).catch(() => {});
    return loggedInUser;
  };

  // Firebase Auth: Register new user (Strictly role: "user")
  const registerWithFirebase = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const firebaseUser = userCredential.user;
    const uid = firebaseUser.uid;

    const trimmedName = name?.trim() || 'EV Driver';

    // Strictly role: "user". There is no option to create admin on public registration.
    const profileData = {
      name: trimmedName,
      email: firebaseUser.email,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    // Store user's profile in Realtime Database at /users/{uid} using the Firebase Auth UID
    // Note: NEVER store password in Realtime Database.
    try {
      await set(ref(database, `users/${uid}`), profileData);
    } catch (rtdbErr) {
      console.warn('Realtime Database profile storage error:', rtdbErr?.message || rtdbErr);
    }

    try {
      await updateProfile(firebaseUser, { displayName: trimmedName });
    } catch (e) {
      console.warn('Could not update Firebase profile displayName:', e);
    }

    const newUser = {
      uid,
      name: trimmedName,
      email: firebaseUser.email,
      role: 'user',
      createdAt: profileData.createdAt,
      vehicle: 'Tesla Model Y Dual Motor',
      plate: 'DL-01-EV-4092'
    };

    setAuth({
      isAuthenticated: true,
      isGuest: false,
      role: 'user',
      user: newUser,
      loading: false
    });

    setUserNavTab('overview');

    addEvent(`New user registered: ${trimmedName} (${firebaseUser.email})`, 'SUCCESS', 'Auth Service');
    api.upsertUserProfile({ uid, name: trimmedName, email: firebaseUser.email, role: 'user' }).catch(() => {});
    return newUser;
  };

  // Continue as Guest (Unauthenticated exploration of station locations & live availability)
  const continueAsGuest = async () => {
    if (firebaseAuth.currentUser) {
      try {
        await signOut(firebaseAuth);
      } catch (err) {
        console.warn('Error signing out of Firebase on guest switch:', err);
      }
    }
    const guestUser = {
      name: 'Guest Explorer',
      role: 'guest'
    };
    setAuth({
      isAuthenticated: false,
      isGuest: true,
      role: 'guest',
      user: guestUser,
      loading: false
    });
    setUserNavTab('stations');
  };

  // Sign out from Firebase Auth
  const logout = async () => {
    if (firebaseAuth.currentUser) {
      try {
        await signOut(firebaseAuth);
      } catch (err) {
        console.error('Error signing out of Firebase:', err);
      }
    }
    setAuth({
      isAuthenticated: false,
      isGuest: true,
      role: 'guest',
      user: {
        name: 'Guest Explorer',
        role: 'guest'
      },
      loading: false
    });
    setUserNavTab('stations');
    setAdminViewMode('admin');
  };

  // View switcher for Admins (allows verified admin to toggle between SCADA Admin view and Driver view)
  const switchRole = (newRole) => {
    if (auth.isAuthenticated && auth.role === 'admin') {
      const mode = newRole === 'user' ? 'user' : 'admin';
      setAdminViewMode(mode);
      if (mode === 'user') {
        setUserNavTab('overview');
      }
    } else {
      console.warn('Security alert: Unauthorized role switch attempt. Only verified administrators can toggle views.');
    }
  };

  // Toggle grid overload simulation (ADMIN-ONLY)
  const toggleGridStress = async () => {
    if (!auth.isAuthenticated || auth.role !== 'admin') {
      console.warn('Security alert: Unauthorized grid stress simulation attempted by non-admin.');
      return;
    }
    const nextStress = !isStressSimulated;
    setIsStressSimulated(nextStress);
    if (nextStress) {
      addEvent('OPERATOR TRIGGERED GRID STRESS TEST: Current surge to 34A. Impending transformer overload.', 'WARNING', 'SCADA Simulator');
      addEvent('AI Load Management: Issued THROTTLE_POWER command to mitigate transformer overload.', 'WARNING', 'AI Engine');
    } else {
      addEvent('Grid Stress Test Deactivated: Transformer load returned to normal nominal threshold.', 'SUCCESS', 'SCADA Simulator');
      addEvent('AI Engine: Restored normal nominal charging power across all EV bays.', 'SUCCESS', 'AI Engine');
    }

    try {
      await api.toggleStress(nextStress);
    } catch (e) {
      console.warn('Backend stress endpoint sync notice (running in local mode):', e?.message || e);
    }
  };

  const value = {
    auth,
    loginWithFirebase,
    registerWithFirebase,
    continueAsGuest,
    logout,
    switchRole,
    adminViewMode,
    setAdminViewMode,
    userNavTab,
    setUserNavTab,
    adminNavTab,
    setAdminNavTab,
    telemetry,
    voltageHistory,
    loadHistory,
    isCritical,
    isStressSimulated,
    toggleGridStress,
    stations,
    evQueue,
    history,
    events,
    activeSession,
    startChargingSession,
    stopChargingSession,
    selectedStationId,
    setSelectedStationId,
    addEvent,
    theme,
    setTheme,
    toggleTheme,
    // Role convenience flags
    isAdmin: auth.isAuthenticated && auth.role === 'admin',
    isUser: auth.isAuthenticated && auth.role === 'user',
    isGuest: !auth.isAuthenticated || auth.role === 'guest'
  };

  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    window.__VOLTGRID_TEST_HOOKS__ = {
      setAuth,
      setAdminViewMode,
      setAdminNavTab,
      setUserNavTab,
      setSelectedStationId,
      setIsStressSimulated,
      startChargingSession,
      stopChargingSession,
      theme,
      setTheme,
      toggleTheme
    };
  }

  return (
    <GridAppContext.Provider value={value}>
      {children}
    </GridAppContext.Provider>
  );
}

export function useGridApp() {
  const context = useContext(GridAppContext);
  if (!context) {
    throw new Error('useGridApp must be used within a GridAppProvider');
  }
  return context;
}
