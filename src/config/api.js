/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Environment-based API URLs
export const API_CONFIG = {
  // Prediction API (ML Backend) - Port 5000
  PREDICTION_API: {
    baseURL: process.env.REACT_APP_PREDICTION_API_URL || 'http://localhost:5000',
    timeout: 15000,
    endpoints: {
      health: '/health',
      predict: '/predict',
      predictBatch: '/predict/batch',
      modelInfo: '/model/info'
    }
  },

  // Fare API (GTFS Backend) - Port 5001
  FARE_API: {
    baseURL: process.env.REACT_APP_FARE_API_URL || 'http://localhost:5001/api',
    timeout: 10000,
    endpoints: {
      health: '/health',
      stops: '/stops',
      stopsSearch: '/stops/search',
      calculateFare: '/calculate_fare',
      routes: '/routes',
      routesSearch: '/routes/search',
      routeDetails: '/routes',  // + '/{route_id}/details'
      journeyPlan: '/journey/plan'
    }
  },

  // Common configuration
  common: {
    retryAttempts: 3,
    retryDelay: 1000,
    enableCache: true,
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
  }
};

// Request headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Bangalore coordinate bounds for validation
export const BANGALORE_BOUNDS = {
  lat: {
    min: 12.7,
    max: 13.2
  },
  lon: {
    min: 77.3,
    max: 77.9
  }
};

// Crowd level mappings
export const CROWD_LEVELS = {
  0: { label: 'Low', color: '#4caf50', icon: 'fa-check-circle', percent: 30 },
  1: { label: 'Medium', color: '#ff9800', icon: 'fa-users', percent: 55 },
  2: { label: 'High', color: '#ff5722', icon: 'fa-exclamation-triangle', percent: 75 },
  3: { label: 'Very High', color: '#f44336', icon: 'fa-exclamation-circle', percent: 90 }
};

// Map crowd level string to code
export const CROWD_LEVEL_MAP = {
  'Low': 0,
  'Medium': 1,
  'High': 2,
  'Very High': 3
};

// Rush hour configuration
export const RUSH_HOURS = {
  morning: { start: 7, end: 9 },
  evening: { start: 17, end: 19 }
};

// Check if current time is rush hour
export const isRushHour = (hour = new Date().getHours()) => {
  return (
    (hour >= RUSH_HOURS.morning.start && hour <= RUSH_HOURS.morning.end) ||
    (hour >= RUSH_HOURS.evening.start && hour <= RUSH_HOURS.evening.end)
  );
};

// Validate coordinates are within Bangalore bounds
export const validateCoordinates = (lat, lon) => {
  return (
    lat >= BANGALORE_BOUNDS.lat.min &&
    lat <= BANGALORE_BOUNDS.lat.max &&
    lon >= BANGALORE_BOUNDS.lon.min &&
    lon <= BANGALORE_BOUNDS.lon.max
  );
};

// Format time to HH:MM
export const formatTime = (date = new Date()) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Get day of week (0-6, Monday-Sunday)
export const getDayOfWeek = (date = new Date()) => {
  return date.getDay();
};

export default API_CONFIG;
