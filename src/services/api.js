import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bmtc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bmtc_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Bus Tracking
  getAllRunningBuses: async () => {
    try {
      const response = await api.get('/buses/running');
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getBusLocation: async (busNumber) => {
    try {
      const response = await api.get(`/buses/track/${busNumber}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Journey Planning
  searchRoutes: async (origin, destination, filters = {}) => {
    try {
      const response = await api.post('/routes/search', { origin, destination, ...filters });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Stations
  getAllStations: async () => {
    try {
      const response = await api.get('/stations');
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Timetable
  getTimeTableByStations: async (origin, destination, date) => {
    try {
      const response = await api.post('/timetable/stations', { origin, destination, date });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Fare
  calculateFare: async (origin, destination) => {
    try {
      const response = await api.post('/fare/calculate', { origin, destination });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Favorites
  getFavorites: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/favorites`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  addFavorite: async (userId, routeNumber) => {
    try {
      const response = await api.post(`/users/${userId}/favorites`, { routeNumber });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Notifications
  createNotification: async (userId, notificationData) => {
    try {
      const response = await api.post(`/users/${userId}/notifications`, notificationData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Feedback
  submitFeedback: async (feedbackData) => {
    try {
      const response = await api.post('/feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Crowd Prediction
  predictCrowd: async (busNumber) => {
    try {
      const response = await api.get(`/crowd/predict/${busNumber}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Route Search
  getAllRoutes: async () => {
    try {
      const response = await api.get('/routes');
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getRouteDetails: async (routeNumber) => {
    try {
      const response = await api.get(`/routes/${routeNumber}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getRunningBusesOnRoute: async (routeNumber) => {
    try {
      const response = await api.get(`/routes/${routeNumber}/buses`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default api;
