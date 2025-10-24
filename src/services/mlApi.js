/**
 * ML API Service - Connects to Python Flask ML Backend
 * Running on http://localhost:5000
 */

import axios from 'axios';

const ML_API_URL = process.env.REACT_APP_ML_API_URL || 'http://localhost:5000';

const mlApi = axios.create({
  baseURL: ML_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Response interceptor for error handling
mlApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('ML API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const mlApiService = {
  /**
   * Health check for ML API
   */
  checkHealth: async () => {
    try {
      const response = await mlApi.get('/health');
      return response.data;
    } catch (error) {
      console.error('ML API health check failed:', error);
      throw error;
    }
  },

  /**
   * Get crowd prediction for a specific stop and time
   * @param {Object} params - { stop_lat, stop_lon, time, day_of_week }
   */
  predictCrowd: async (params) => {
    try {
      const response = await mlApi.post('/predict', params);
      return response.data;
    } catch (error) {
      console.error('Crowd prediction error:', error);
      throw error;
    }
  },

  /**
   * Get batch predictions for multiple stops
   * @param {Array} requests - Array of { stop_lat, stop_lon, time, day_of_week }
   */
  predictCrowdBatch: async (requests) => {
    try {
      const response = await mlApi.post('/predict/batch', { requests });
      return response.data;
    } catch (error) {
      console.error('Batch prediction error:', error);
      throw error;
    }
  },

  /**
   * Get model information
   */
  getModelInfo: async () => {
    try {
      const response = await mlApi.get('/model/info');
      return response.data;
    } catch (error) {
      console.error('Model info error:', error);
      throw error;
    }
  },

  /**
   * Predict crowd for a bus route with all stops
   * @param {String} routeId - BMTC route ID
   * @param {String} time - Time in HH:MM format
   * @param {Number} dayOfWeek - 0-6 (Monday-Sunday)
   */
  predictRouteStops: async (routeId, time = '08:00', dayOfWeek = null) => {
    try {
      // Get current day if not provided
      const day = dayOfWeek !== null ? dayOfWeek : new Date().getDay();
      
      // Load GTFS stops data
      const stopsResponse = await fetch('/data/stops.json');
      const stops = await stopsResponse.json();

      // Get stops for this route (if route-specific data available)
      // For now, sample random stops
      const routeStops = stops.slice(0, 10); // Take first 10 stops as example

      // Create batch prediction requests
      const requests = routeStops.map(stop => ({
        stop_lat: stop.lat || stop.stop_lat,
        stop_lon: stop.lon || stop.stop_lon,
        time: time,
        day_of_week: day
      }));

      // Get predictions
      const predictions = await this.predictCrowdBatch(requests);

      // Combine stop data with predictions
      return routeStops.map((stop, idx) => ({
        ...stop,
        prediction: predictions.predictions[idx]
      }));
    } catch (error) {
      console.error('Route stops prediction error:', error);
      throw error;
    }
  }
};

export default mlApiService;
