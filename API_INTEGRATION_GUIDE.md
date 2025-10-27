# API Integration Guide

Complete guide for integrating the BMTC Bus Crowd Prediction APIs with the React frontend.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [API Services](#api-services)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Caching](#caching)
- [Component Integration](#component-integration)

---

## 🏗️ Architecture Overview

### API Structure

```
Frontend (React) ← → Backend APIs (Flask)
     ↓
├── Prediction API (Port 5000)
│   ├── /health
│   ├── /predict
│   ├── /predict/batch
│   └── /model/info
│
└── Fare API (Port 5001)
    ├── /api/health
    ├── /api/stops
    ├── /api/stops/search
    ├── /api/calculate_fare
    └── /api/journey/plan
```

### File Structure

```
src/
├── config/
│   └── api.js                 # API configuration & constants
├── services/
│   ├── predictionService.js   # Prediction API client
│   └── fareService.js         # Fare API client
└── utils/
    └── apiUtils.js            # Error handling & utilities
```

---

## 🔌 API Services

### Prediction Service

```javascript
import predictionService from './services/predictionService';
```

#### Methods

**`health()`** - Check API health
```javascript
const health = await predictionService.health();
// Returns: { status: 'healthy', model_loaded: true, features: [...] }
```

**`predict(params, options)`** - Get crowd prediction
```javascript
const prediction = await predictionService.predict({
  stop_lat: 12.9716,
  stop_lon: 77.5946,
  time: '14:30',          // Optional: HH:MM format
  day_of_week: 1          // Optional: 0-6 (Monday-Sunday)
}, { useCache: true });    // Optional: enable/disable cache

// Returns formatted prediction with crowd level, confidence, probabilities
```

**`predictBatch(requests, options)`** - Batch predictions
```javascript
const results = await predictionService.predictBatch([
  { stop_lat: 12.9716, stop_lon: 77.5946, time: '08:00' },
  { stop_lat: 13.0827, stop_lon: 77.5877, time: '18:00' }
], { useCache: true });
```

**`modelInfo()`** - Get model information
```javascript
const info = await predictionService.modelInfo();
// Returns: { model_type: 'RandomForestClassifier', features: [...] }
```

---

### Fare Service

```javascript
import fareService from './services/fareService';
```

#### Methods

**`health()`** - Check API health
```javascript
const health = await fareService.health();
```

**`getStops(options)`** - Get all GTFS stops
```javascript
const stops = await fareService.getStops({ useCache: true });
// Returns: { stops: [...], count: 1234 }
```

**`searchStops(query, options)`** - Search stops by name
```javascript
const results = await fareService.searchStops('Majestic', { useCache: true });
// Returns: { stops: [...], count: 5, query: 'Majestic' }
```

**`calculateFare(params, options)`** - Calculate fare
```javascript
const fare = await fareService.calculateFare({
  origin: 'Majestic',
  destination: 'Whitefield'
}, { useCache: true });

// Returns formatted fare with distance, GST, total
```

**`planJourney(from, to, options)`** - Plan journey
```javascript
const journey = await fareService.planJourney(
  'Majestic',
  'Electronic City',
  { useCache: true }
);
```

---

## 💡 Usage Examples

### Example 1: Crowd Prediction Component

```javascript
import React, { useState } from 'react';
import predictionService from '../services/predictionService';
import { formatTime, getDayOfWeek } from '../config/api';

function CrowdPredictor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const handlePredict = async (lat, lon) => {
    setLoading(true);
    setError(null);

    try {
      const result = await predictionService.predict({
        stop_lat: lat,
        stop_lon: lon,
        time: formatTime(),
        day_of_week: getDayOfWeek()
      });

      setPrediction(result);
    } catch (err) {
      setError(err.message);
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {prediction && (
        <div>
          <h3>Crowd Level: {prediction.crowdLevel}</h3>
          <p>Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Fare Calculator Component

```javascript
import React, { useState, useEffect } from 'react';
import fareService from '../services/fareService';

function FareCalculator() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Search stops as user types
  const handleSearch = async (query) => {
    if (query.length < 2) return;

    try {
      const data = await fareService.searchStops(query);
      setSuggestions(data.stops || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Calculate fare
  const handleCalculate = async () => {
    if (!from || !to) {
      setError('Please select both origin and destination');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fare = await fareService.calculateFare({
        origin: from,
        destination: to
      });

      setResult(fare);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={from}
        onChange={(e) => {
          setFrom(e.target.value);
          handleSearch(e.target.value);
        }}
        placeholder="From"
      />
      
      <input 
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="To"
      />

      <button onClick={handleCalculate} disabled={loading}>
        {loading ? 'Calculating...' : 'Calculate Fare'}
      </button>

      {error && <p className="error">{error}</p>}
      
      {result && (
        <div>
          <h3>Fare: ₹{result.total.toFixed(2)}</h3>
          <p>Base: ₹{result.fare.toFixed(2)}</p>
          <p>GST: ₹{result.gst.toFixed(2)}</p>
          <p>Distance: {result.distanceKm} km</p>
        </div>
      )}
    </div>
  );
}
```

### Example 3: Batch Predictions with Error Handling

```javascript
import predictionService from '../services/predictionService';
import { CROWD_LEVELS } from '../config/api';

async function predictMultipleStops(stops) {
  const requests = stops.map(stop => ({
    stop_lat: stop.lat,
    stop_lon: stop.lon,
    time: '08:00',
    day_of_week: 1
  }));

  try {
    const results = await predictionService.predictBatch(requests);

    return results.predictions.map((pred, idx) => ({
      stopName: stops[idx].name,
      crowdLevel: pred.crowd_level,
      color: CROWD_LEVELS[pred.crowd_level_code]?.color,
      confidence: pred.confidence
    }));

  } catch (error) {
    if (error.statusCode === 400) {
      console.error('Invalid request:', error.details);
    } else if (error.statusCode === 503) {
      console.error('Service unavailable:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    
    throw error;
  }
}
```

---

## 🚨 Error Handling

### Error Types

All API errors are standardized using the `APIError` class:

```javascript
{
  message: 'User-friendly error message',
  statusCode: 400,
  details: { /* Additional error details */ },
  timestamp: '2025-10-27T00:00:00Z'
}
```

### Common Status Codes

- **400** - Invalid request parameters
- **404** - Resource not found
- **408** - Request timeout
- **500** - Server error
- **503** - Service unavailable
- **0** - Network error

### Best Practices

```javascript
try {
  const prediction = await predictionService.predict(params);
  // Handle success
} catch (error) {
  // Error is already formatted and user-friendly
  console.error('API Error:', error.message);
  
  // Check specific error types
  if (error.statusCode === 0) {
    alert('Network error. Please check your connection.');
  } else if (error.statusCode === 400) {
    alert(`Invalid input: ${error.details.join(', ')}`);
  } else {
    alert(error.message);
  }
}
```

---

## 💾 Caching

### Automatic Caching

All API services support automatic caching with 5-minute expiry:

```javascript
// First call - hits API
const stops = await fareService.getStops();

// Second call within 5 minutes - returns cached data
const stopsAgain = await fareService.getStops();

// Disable cache for fresh data
const freshStops = await fareService.getStops({ useCache: false });
```

### Manual Cache Management

```javascript
import { cacheManager } from '../utils/apiUtils';

// Clear all cache
cacheManager.clear();

// Delete specific cache entry
cacheManager.delete('fare:allStops');

// Set custom cache
cacheManager.set('myKey', data, 10 * 60 * 1000); // 10 minutes

// Get from cache
const cached = cacheManager.get('myKey');
```

---

## 🔧 Component Integration

### Step 1: Import Services

```javascript
import predictionService from '../services/predictionService';
import fareService from '../services/fareService';
import { formatTime, getDayOfWeek, CROWD_LEVELS } from '../config/api';
```

### Step 2: Add State Management

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);
```

### Step 3: Create API Call Handler

```javascript
const fetchData = async () => {
  setLoading(true);
  setError(null);

  try {
    const result = await predictionService.predict({
      stop_lat: 12.9716,
      stop_lon: 77.5946
    });
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Step 4: Handle Loading States

```javascript
if (loading) return <div>Loading...</div>;
if (error) return <div className="error">{error}</div>;
if (!data) return <div>No data available</div>;

return <div>{/* Render data */}</div>;
```

---

## 🧪 Testing API Services

### Health Check Test

```javascript
// Test if both APIs are running
async function testAPIs() {
  try {
    const predictionHealth = await predictionService.health();
    console.log('✓ Prediction API:', predictionHealth);

    const fareHealth = await fareService.health();
    console.log('✓ Fare API:', fareHealth);

    return true;
  } catch (error) {
    console.error('✗ API Test Failed:', error);
    return false;
  }
}
```

### Run in Browser Console

```javascript
// Import in component then test
import predictionService from './services/predictionService';

// Test prediction
predictionService.predict({
  stop_lat: 12.9716,
  stop_lon: 77.5946
}).then(console.log).catch(console.error);
```

---

## 🌐 Environment Configuration

Update `.env` file with your backend URLs:

```bash
# Development
REACT_APP_PREDICTION_API_URL=http://localhost:5000
REACT_APP_FARE_API_URL=http://localhost:5001/api

# Production
REACT_APP_PREDICTION_API_URL=https://api.yourdomain.com/prediction
REACT_APP_FARE_API_URL=https://api.yourdomain.com/fare
```

---

## 📞 Support

For issues or questions:
1. Check API health endpoints
2. Review browser console for errors
3. Verify backend services are running
4. Check network tab in browser DevTools

---

**Happy Coding! 🚀**
