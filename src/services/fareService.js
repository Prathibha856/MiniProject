import axios from 'axios';
import { API_CONFIG, API_HEADERS } from '../config/api';
import { 
  handleAPIError, retryRequest, cacheManager, formatFareResponse,
  validateFareRequest, generateCacheKey, logAPIRequest, logAPIResponse
} from '../utils/apiUtils';

// Axios instance for Fare API
const fareClient = axios.create({
  baseURL: API_CONFIG.FARE_API.baseURL,
  timeout: API_CONFIG.FARE_API.timeout,
  headers: API_HEADERS
});

export const fareService = {
  // Health check
  health: async () => {
    const url = API_CONFIG.FARE_API.endpoints.health;
    try {
      logAPIRequest('GET', url);
      const res = await retryRequest(() => fareClient.get(url));
      logAPIResponse(url, res.data);
      return res.data;
    } catch (err) {
      throw handleAPIError(err);
    }
  },

  // Get all stops
  getStops: async ({ useCache = true } = {}) => {
    const url = API_CONFIG.FARE_API.endpoints.stops;
    const cacheKey = 'fare:allStops';

    try {
      if (useCache) {
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;
      }

      logAPIRequest('GET', url);
      const res = await retryRequest(() => fareClient.get(url));
      logAPIResponse(url, res.data);

      if (useCache) cacheManager.set(cacheKey, res.data);
      return res.data;
    } catch (err) {
      throw handleAPIError(err);
    }
  },

  // Search stops
  searchStops: async (query, { useCache = true } = {}) => {
    if (!query || typeof query !== 'string') {
      throw handleAPIError({ response: { status: 400, data: { error: 'Search query is required' } } });
    }

    const url = API_CONFIG.FARE_API.endpoints.stopsSearch;
    const cacheKey = generateCacheKey('fare:searchStops', { query });

    try {
      if (useCache) {
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;
      }

      logAPIRequest('GET', url, { query });
      const res = await retryRequest(() => fareClient.get(url, { params: { q: query } }));
      logAPIResponse(url, res.data);

      if (useCache) cacheManager.set(cacheKey, res.data);
      return res.data;
    } catch (err) {
      throw handleAPIError(err);
    }
  },

  // Calculate fare
  calculateFare: async (params, { useCache = true } = {}) => {
    // Validate params
    const validation = validateFareRequest(params);
    if (!validation.isValid) {
      throw handleAPIError({ response: { status: 400, data: { error: 'Invalid parameters', details: validation.errors } } });
    }

    const url = API_CONFIG.FARE_API.endpoints.calculateFare;
    const cacheKey = generateCacheKey('fare:calculate', params);

    try {
      if (useCache) {
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;
      }

      logAPIRequest('POST', url, params);
      const res = await retryRequest(() => fareClient.post(url, params));
      logAPIResponse(url, res.data);

      const formatted = formatFareResponse(res.data);
      if (useCache) cacheManager.set(cacheKey, formatted);
      return formatted;
    } catch (err) {
      throw handleAPIError(err);
    }
  },

  // Get routes
  getRoutes: async ({ useCache = true } = {}) => {
    const url = API_CONFIG.FARE_API.endpoints.routes;
    const cacheKey = 'fare:allRoutes';

    try {
      if (useCache) {
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;
      }

      logAPIRequest('GET', url);
      const res = await retryRequest(() => fareClient.get(url));
      logAPIResponse(url, res.data);

      if (useCache) cacheManager.set(cacheKey, res.data);
      return res.data;
    } catch (err) {
      throw handleAPIError(err);
    }
  },

  // Plan journey
  planJourney: async (fromStop, toStop, { useCache = true } = {}) => {
    if (!fromStop || !toStop) {
      throw handleAPIError({ response: { status: 400, data: { error: 'fromStop and toStop are required' } } });
    }

    const url = API_CONFIG.FARE_API.endpoints.journeyPlan;
    const cacheKey = generateCacheKey('fare:journey', { fromStop, toStop });

    try {
      if (useCache) {
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;
      }

      logAPIRequest('GET', url, { fromStop, toStop });
      const res = await retryRequest(() => 
        fareClient.get(url, { 
          params: { 
            fromStop, 
            toStop 
          } 
        })
      );
      logAPIResponse(url, res.data);

      if (useCache) cacheManager.set(cacheKey, res.data);
      return res.data;
    } catch (err) {
      throw handleAPIError(err);
    }
  }
};

export default fareService;
