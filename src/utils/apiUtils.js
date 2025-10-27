/**
 * API Utilities
 * Common utilities for API error handling, caching, and response formatting
 */

import { API_CONFIG } from '../config/api';

// Simple in-memory cache
const cache = new Map();

/**
 * Cache manager
 */
export const cacheManager = {
  get: (key) => {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      cache.delete(key);
      return null;
    }
    
    return item.data;
  },

  set: (key, data, timeout = API_CONFIG.common.cacheTimeout) => {
    cache.set(key, {
      data,
      expiry: Date.now() + timeout
    });
  },

  clear: () => {
    cache.clear();
  },

  delete: (key) => {
    cache.delete(key);
  }
};

/**
 * API Error class for structured error handling
 */
export class APIError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      error: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

/**
 * Handle API errors and convert to user-friendly messages
 */
export const handleAPIError = (error) => {
  console.error('API Error:', error);

  // Network error
  if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
    return new APIError(
      'Network connection failed. Please check your internet connection.',
      0,
      { type: 'network', originalError: error.message }
    );
  }

  // Timeout error
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return new APIError(
      'Request timed out. The server took too long to respond.',
      408,
      { type: 'timeout', originalError: error.message }
    );
  }

  // Response error
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new APIError(
          data?.error || 'Invalid request. Please check your input.',
          400,
          data?.details || null
        );
      
      case 404:
        return new APIError(
          data?.error || 'Resource not found.',
          404,
          data?.details || null
        );
      
      case 500:
        return new APIError(
          data?.error || 'Server error. Please try again later.',
          500,
          data?.details || null
        );
      
      case 503:
        return new APIError(
          'Service temporarily unavailable. Please try again later.',
          503,
          data?.details || null
        );
      
      default:
        return new APIError(
          data?.error || `Request failed with status ${status}`,
          status,
          data?.details || null
        );
    }
  }

  // Unknown error
  return new APIError(
    'An unexpected error occurred. Please try again.',
    500,
    { type: 'unknown', originalError: error.message }
  );
};

/**
 * Retry failed requests with exponential backoff
 */
export const retryRequest = async (
  requestFn,
  maxAttempts = API_CONFIG.common.retryAttempts,
  delay = API_CONFIG.common.retryDelay
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (400-499)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw handleAPIError(error);
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Retry attempt ${attempt}/${maxAttempts} after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw handleAPIError(lastError);
};

/**
 * Format API response to consistent structure
 */
export const formatResponse = (response, transformFn = null) => {
  const data = response.data;
  
  if (transformFn && typeof transformFn === 'function') {
    return transformFn(data);
  }
  
  return data;
};

/**
 * Validate prediction request parameters
 */
export const validatePredictionRequest = (params) => {
  const errors = [];

  if (params.stop_lat === undefined || params.stop_lat === null) {
    errors.push('stop_lat is required');
  } else if (typeof params.stop_lat !== 'number' || params.stop_lat < 12.7 || params.stop_lat > 13.2) {
    errors.push('stop_lat must be a number between 12.7 and 13.2 (Bangalore bounds)');
  }

  if (params.stop_lon === undefined || params.stop_lon === null) {
    errors.push('stop_lon is required');
  } else if (typeof params.stop_lon !== 'number' || params.stop_lon < 77.3 || params.stop_lon > 77.9) {
    errors.push('stop_lon must be a number between 77.3 and 77.9 (Bangalore bounds)');
  }

  if (params.time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(params.time)) {
    errors.push('time must be in HH:MM format (e.g., "14:30")');
  }

  if (params.day_of_week !== undefined && params.day_of_week !== null) {
    if (typeof params.day_of_week !== 'number' || params.day_of_week < 0 || params.day_of_week > 6) {
      errors.push('day_of_week must be a number between 0 and 6 (0=Monday, 6=Sunday)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate fare request parameters
 */
export const validateFareRequest = (params) => {
  const errors = [];

  if (!params.origin || params.origin.trim() === '') {
    errors.push('origin is required');
  }

  if (!params.destination || params.destination.trim() === '') {
    errors.push('destination is required');
  }

  if (params.origin === params.destination) {
    errors.push('origin and destination cannot be the same');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format prediction response for display
 */
export const formatPredictionResponse = (response) => {
  if (!response.success || !response.prediction) {
    throw new Error('Invalid prediction response');
  }

  const { prediction, input } = response;

  return {
    crowdLevel: prediction.crowd_level,
    crowdLevelCode: prediction.crowd_level_code,
    confidence: prediction.confidence,
    probabilities: prediction.probabilities,
    input: {
      stopLat: input.stop_lat,
      stopLon: input.stop_lon,
      time: input.time,
      dayOfWeek: input.day_of_week,
      hour: input.hour,
      isRushHour: input.is_rush_hour === 1
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Format fare response for display
 */
export const formatFareResponse = (response) => {
  return {
    origin: response.origin,
    destination: response.destination,
    actualOriginName: response.actual_origin_name,
    actualDestinationName: response.actual_destination_name,
    fare: parseFloat(response.fare),
    currency: response.currency,
    distanceKm: response.distance_km,
    gst: parseFloat(response.gst),
    total: parseFloat(response.total),
    source: response.source,
    message: response.message,
    routeId: response.route_id || null,
    routeName: response.route_name || null
  };
};

/**
 * Generate cache key for requests
 */
export const generateCacheKey = (prefix, params) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  
  return `${prefix}:${sortedParams}`;
};

/**
 * Log API request for debugging
 */
export const logAPIRequest = (method, url, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API ${method}]`, url, data || '');
  }
};

/**
 * Log API response for debugging
 */
export const logAPIResponse = (url, response) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Response]`, url, response);
  }
};

export default {
  cacheManager,
  APIError,
  handleAPIError,
  retryRequest,
  formatResponse,
  validatePredictionRequest,
  validateFareRequest,
  formatPredictionResponse,
  formatFareResponse,
  generateCacheKey,
  logAPIRequest,
  logAPIResponse
};
