import axios from 'axios';
import { API_CONFIG, API_HEADERS } from '../config/api';
import { 
  handleAPIError, retryRequest, cacheManager, formatPredictionResponse,
  validatePredictionRequest, generateCacheKey, logAPIRequest, logAPIResponse
} from '../utils/apiUtils';

// Axios instance for Prediction API
const predictionClient = axios.create({
  baseURL: API_CONFIG.PREDICTION_API.baseURL,
  timeout: API_CONFIG.PREDICTION_API.timeout,
  headers: API_HEADERS
});

export const predictionService = {
  // Health check
  health: async () => {
    const url = API_CONFIG.PREDICTION_API.endpoints.health;
    try {
      logAPIRequest('GET', url);
      const res = await retryRequest(() => predictionClient.get(url));
      logAPIResponse(url, res.data);
      return res.data;
    } catch (err) {
      throw handleAPIError(err);
    }
  },

  // Single prediction
  predict: async (params, { useCache = true } = {}) => {
    // Validate params
    const validation = validatePredictionRequest(params);
    if (!validation.isValid) {
      throw handleAPIError({ response: { status: 400, data: { error: 'Invalid parameters', details: validation.errors } } });
    }

    const url = API_CONFIG.PREDICTION_API.endpoints.predict;
    const cacheKey = generateCacheKey('predict', params);

    try {
      if (useCache) {
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;
      }

      logAPIRequest('POST', url, params);
      const res = await retryRequest(() => predictionClient.post(url, params));
      logAPIResponse(url, res.data);

      const formatted = formatPredictionResponse(res.data);
      if (useCache) cacheManager.set(cacheKey, formatted);
      return formatted;
    } catch (err) {
      throw handleAPIError(err);
    }
  },

  // Batch prediction
  predictBatch: async (requests, { useCache = true } = {}) => {
    if (!Array.isArray(requests) || requests.length === 0) {
      throw handleAPIError({ response: { status: 400, data: { error: 'Requests array is required' } } });
    }

    const url = API_CONFIG.PREDICTION_API.endpoints.predictBatch;
    const cacheKey = generateCacheKey('predictBatch', { requests });

    try {
      if (useCache) {
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;
      }

      logAPIRequest('POST', url, { requests });
      const res = await retryRequest(() => predictionClient.post(url, { requests }));
      logAPIResponse(url, res.data);

      if (!res.data || !res.data.success) {
        throw new Error(res.data?.error || 'Batch prediction failed');
      }

      if (useCache) cacheManager.set(cacheKey, res.data);
      return res.data;
    } catch (err) {
      throw handleAPIError(err);
    }
  },

  // Model info
  modelInfo: async () => {
    const url = API_CONFIG.PREDICTION_API.endpoints.modelInfo;
    try {
      logAPIRequest('GET', url);
      const res = await retryRequest(() => predictionClient.get(url));
      logAPIResponse(url, res.data);
      return res.data;
    } catch (err) {
      throw handleAPIError(err);
    }
  }
};

export default predictionService;
