# Quick Start - API Integration

Get started with the new API services in 5 minutes!

## ✅ Prerequisites

1. Backend services running:
   - Prediction API: http://localhost:5000
   - Fare API: http://localhost:5001

2. React app running: http://localhost:3002

---

## 🚀 Quick Start

### 1. Import Services

```javascript
// At the top of your component
import predictionService from '../services/predictionService';
import fareService from '../services/fareService';
import { formatTime, getDayOfWeek } from '../config/api';
```

### 2. Get Crowd Prediction

```javascript
const prediction = await predictionService.predict({
  stop_lat: 12.9716,
  stop_lon: 77.5946,
  time: '14:30',          // Optional
  day_of_week: 1          // Optional (0-6)
});

console.log(prediction.crowdLevel);      // "Medium"
console.log(prediction.confidence);      // 0.87
```

### 3. Calculate Fare

```javascript
const fare = await fareService.calculateFare({
  origin: 'Majestic',
  destination: 'Whitefield'
});

console.log(fare.total);        // 25.50
console.log(fare.distanceKm);   // 20
```

### 4. Search Stops

```javascript
const results = await fareService.searchStops('Majes');

console.log(results.stops);     // [{ stop_id: '1', stop_name: 'Majestic' }]
```

---

## 💡 Complete Component Example

```javascript
import React, { useState } from 'react';
import predictionService from '../services/predictionService';

function CrowdChecker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const checkCrowd = async () => {
    setLoading(true);
    setError(null);

    try {
      const prediction = await predictionService.predict({
        stop_lat: 12.9716,
        stop_lon: 77.5946
      });
      setResult(prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={checkCrowd} disabled={loading}>
        {loading ? 'Checking...' : 'Check Crowd Level'}
      </button>

      {error && <p style={{color: 'red'}}>{error}</p>}

      {result && (
        <div>
          <h2>Crowd Level: {result.crowdLevel}</h2>
          <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}

export default CrowdChecker;
```

---

## 🔥 Common Patterns

### Pattern 1: With Loading State

```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const result = await predictionService.predict(params);
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// In JSX:
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
return <div>{JSON.stringify(data)}</div>;
```

### Pattern 2: Search with Autocomplete

```javascript
const [query, setQuery] = useState('');
const [suggestions, setSuggestions] = useState([]);

const handleSearch = async (value) => {
  setQuery(value);
  if (value.length > 2) {
    const results = await fareService.searchStops(value);
    setSuggestions(results.stops);
  }
};

// In JSX:
<input 
  value={query}
  onChange={(e) => handleSearch(e.target.value)}
/>
<ul>
  {suggestions.map(stop => (
    <li key={stop.stop_id}>{stop.stop_name}</li>
  ))}
</ul>
```

### Pattern 3: Batch Predictions

```javascript
const stops = [
  { lat: 12.9716, lon: 77.5946 },
  { lat: 13.0827, lon: 77.5877 }
];

const requests = stops.map(stop => ({
  stop_lat: stop.lat,
  stop_lon: stop.lon,
  time: '08:00'
}));

const results = await predictionService.predictBatch(requests);

results.predictions.forEach((pred, i) => {
  console.log(`Stop ${i + 1}: ${pred.crowd_level}`);
});
```

---

## 🚨 Error Handling

Errors are automatically formatted and user-friendly:

```javascript
try {
  const data = await predictionService.predict(params);
} catch (error) {
  // Already formatted!
  console.log(error.message);    // "Network connection failed..."
  console.log(error.statusCode); // 0, 400, 500, etc.
}
```

---

## 🧪 Test in Browser Console

1. Open your React app in browser
2. Open Developer Console (F12)
3. Run:

```javascript
// Test Prediction API
fetch('http://localhost:5000/health').then(r => r.json()).then(console.log);

// Test Fare API
fetch('http://localhost:5001/api/health').then(r => r.json()).then(console.log);
```

---

## 📝 Cheat Sheet

| Task | Code |
|------|------|
| Get prediction | `predictionService.predict({ stop_lat, stop_lon })` |
| Batch predictions | `predictionService.predictBatch([{...}, {...}])` |
| Get all stops | `fareService.getStops()` |
| Search stops | `fareService.searchStops('query')` |
| Calculate fare | `fareService.calculateFare({ origin, destination })` |
| Check health | `predictionService.health()` |
| Current time | `formatTime()` |
| Current day | `getDayOfWeek()` |

---

## ✅ Checklist

Before deploying:

- [ ] Backend services are running
- [ ] `.env` has correct API URLs
- [ ] No console errors
- [ ] Loading states work
- [ ] Errors are handled gracefully
- [ ] Cached data refreshes properly

---

## 📚 Need More Help?

- **Detailed Guide**: See `API_INTEGRATION_GUIDE.md`
- **Full Documentation**: See `IMPLEMENTATION_SUMMARY.md`
- **Deployment**: See `DOCKER_DEPLOYMENT.md`

---

**Ready to code! 🎉**
