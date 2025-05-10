import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8090',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Add timeout to prevent hanging requests
});

// Session API functions
export const sessionApi = {
  // Get all sessions
  getSessions: async () => {
    const response = await api.get('/sessions/');
    return response.data;
  },

  // Get a single session by ID
  getSession: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  // Create a new session
  createSession: async (sessionData) => {
    const response = await api.post('/sessions/', sessionData);
    return response.data;
  },

  // Start a session
  startSession: async (sessionId) => {
    const response = await api.patch(`/sessions/${sessionId}/start`);
    return response.data;
  },

  // Pause a session
  pauseSession: async (sessionId, { reason }) => {
    const response = await api.patch(`/sessions/${sessionId}/pause`, { reason });
    return response.data;
  },

  // Resume a session
  resumeSession: async (sessionId) => {
    const response = await api.patch(`/sessions/${sessionId}/resume`);
    return response.data;
  },

  // Complete a session
  completeSession: async (sessionId) => {
    const response = await api.patch(`/sessions/${sessionId}/complete`);
    return response.data;
  },

  // Get session history
  getSessionHistory: async () => {
    const response = await api.get('/sessions/history');
    return response.data;
  },

  // Get session interruptions
  getSessionInterruptions: async (sessionId) => {
    const response = await api.get(`/sessions/${sessionId}/interruptions`);
    return response.data;
  },
};

export default api;
