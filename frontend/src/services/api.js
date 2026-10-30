import axios from 'axios';

// Base API URL: Prefer configured environment variable, default to direct backend endpoint
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 3500,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // 1. Health Check
  checkHealth: async () => {
    const res = await axios.get('http://127.0.0.1:8000/', { timeout: 2000 });
    return res.data;
  },

  // 2. SCADA Telemetry
  getTelemetry: async () => {
    const res = await apiClient.get('/telemetry');
    return res.data;
  },
  getTelemetryHistory: async () => {
    const res = await apiClient.get('/telemetry/history');
    return res.data;
  },
  toggleStress: async (enabled) => {
    const res = await apiClient.post('/telemetry/stress', { enabled });
    return res.data;
  },

  // 3. Charging Stations & Slots
  getStations: async () => {
    const res = await apiClient.get('/stations');
    return res.data;
  },
  getStation: async (id) => {
    const res = await apiClient.get(`/stations/${id}`);
    return res.data;
  },
  startStationSession: async (stationId, slotId, sessionData) => {
    const res = await apiClient.post(`/stations/${stationId}/slots/${slotId}/session`, sessionData);
    return res.data;
  },
  stopStationSession: async (stationId, slotId) => {
    const res = await apiClient.post(`/stations/${stationId}/slots/${slotId}/stop`);
    return res.data;
  },

  // 4. EV Priority Queue
  getEvQueue: async () => {
    const res = await apiClient.get('/ev-queue');
    return res.data;
  },
  throttleQueueItem: async (queueId, action) => {
    const res = await apiClient.post('/ev-queue/throttle', { queueId, action });
    return res.data;
  },

  // 5. Sessions & History
  getSessionHistory: async () => {
    const res = await apiClient.get('/sessions/history');
    return res.data;
  },
  addSessionHistory: async (record) => {
    const res = await apiClient.post('/sessions/history', record);
    return res.data;
  },
  getActiveSession: async () => {
    const res = await apiClient.get('/sessions/active');
    return res.data;
  },
  updateActiveSession: async (sessionState) => {
    const res = await apiClient.put('/sessions/active', sessionState);
    return res.data;
  },

  // 6. System Events Log
  getEvents: async () => {
    const res = await apiClient.get('/events');
    return res.data;
  },
  addEvent: async (eventData) => {
    const res = await apiClient.post('/events', eventData);
    return res.data;
  },

  // 7. Users Profile
  getUserProfile: async (uid) => {
    const res = await apiClient.get(`/users/profile/${uid}`);
    return res.data;
  },
  upsertUserProfile: async (userData) => {
    const res = await apiClient.post('/users/profile', userData);
    return res.data;
  },
};

export default api;
