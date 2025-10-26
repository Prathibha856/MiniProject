/**
 * Fare API Service - Connects to Python Flask Fare Backend
 * Running on http://localhost:5001
 */

import axios from 'axios';

const FARE_API_URL = process.env.REACT_APP_FARE_API_URL || 'http://localhost:5001/api';

const fareApi = axios.create({
  baseURL: FARE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Response interceptor for error handling
fareApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Fare API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const fareApiService = {
  /**
   * Health check for Fare API
   */
  checkHealth: async () => {
    try {
      const response = await fareApi.get('/health');
      return response.data;
    } catch (error) {
      console.error('Fare API health check failed:', error);
      throw error;
    }
  },

  /**
   * Get all bus stops from GTFS data
   */
  getAllStops: async () => {
    try {
      const response = await fareApi.get('/stops');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stops:', error);
      throw error;
    }
  },

  /**
   * Search stops by name
   * @param {String} query - Search query
   */
  searchStops: async (query) => {
    try {
      const response = await fareApi.get('/stops/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Stop search error:', error);
      throw error;
    }
  },

  /**
   * Calculate fare between two stops
   * @param {String} origin - Origin stop name
   * @param {String} destination - Destination stop name
   */
  calculateFare: async (origin, destination) => {
    try {
      const response = await fareApi.post('/calculate_fare', {
        origin: origin,
        destination: destination
      });
      return response.data;
    } catch (error) {
      console.error('Fare calculation error:', error);
      throw error;
    }
  },

  /**
   * Get all routes
   */
  getRoutes: async () => {
    try {
      const response = await fareApi.get('/routes');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch routes:', error);
      throw error;
    }
  },

  /**
   * Get fare rules for debugging
   * @param {Number} originId - Origin stop ID
   * @param {Number} destinationId - Destination stop ID
   */
  getFareRules: async (originId = null, destinationId = null) => {
    try {
      const params = {};
      if (originId) params.origin_id = originId;
      if (destinationId) params.destination_id = destinationId;
      
      const response = await fareApi.get('/fare-rules', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch fare rules:', error);
      throw error;
    }
  }
};

export default fareApiService;
