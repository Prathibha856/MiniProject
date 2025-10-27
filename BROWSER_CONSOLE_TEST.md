# Browser Console API Tests

Quick tests you can run directly in your browser console.

## 🧪 Open Browser Console

1. Open your React app: http://localhost:3002
2. Press **F12** (or Right-click → Inspect)
3. Go to **Console** tab
4. Copy-paste the scripts below

---

## Test 1: Direct API Health Checks

```javascript
// Test Prediction API Health
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(data => {
    console.log('✓ Prediction API Health:', data);
  })
  .catch(err => {
    console.error('✗ Prediction API Failed:', err);
  });

// Test Fare API Health
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(data => {
    console.log('✓ Fare API Health:', data);
  })
  .catch(err => {
    console.error('✗ Fare API Failed:', err);
  });
```

---

## Test 2: Crowd Prediction

```javascript
// Test crowd prediction
fetch('http://localhost:5000/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    stop_lat: 12.9716,
    stop_lon: 77.5946,
    time: '14:30',
    day_of_week: 1
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('✓ Crowd Prediction:', data);
    console.log('  Crowd Level:', data.prediction.crowd_level);
    console.log('  Confidence:', (data.prediction.confidence * 100).toFixed(1) + '%');
  })
  .catch(err => {
    console.error('✗ Prediction Failed:', err);
  });
```

---

## Test 3: Fare Calculation

```javascript
// Test fare calculation
fetch('http://localhost:5001/api/calculate_fare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin: 'Majestic',
    destination: 'Whitefield'
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('✓ Fare Calculation:', data);
    console.log('  Total Fare: ₹' + data.total);
    console.log('  Distance:', data.distance_km + ' km');
  })
  .catch(err => {
    console.error('✗ Fare Calculation Failed:', err);
  });
```

---

## Test 4: Get GTFS Stops

```javascript
// Test get stops
fetch('http://localhost:5001/api/stops')
  .then(r => r.json())
  .then(data => {
    console.log('✓ Get Stops:', data);
    console.log('  Total Stops:', data.count);
    console.log('  First 5 stops:', data.stops.slice(0, 5));
  })
  .catch(err => {
    console.error('✗ Get Stops Failed:', err);
  });
```

---

## Test 5: Search Stops

```javascript
// Test search stops
fetch('http://localhost:5001/api/stops/search?q=Majestic')
  .then(r => r.json())
  .then(data => {
    console.log('✓ Search Stops:', data);
    console.log('  Found:', data.count, 'stops');
    console.log('  Results:', data.stops);
  })
  .catch(err => {
    console.error('✗ Search Failed:', err);
  });
```

---

## Test 6: All-in-One Test

```javascript
// Run all tests sequentially
(async function testAllAPIs() {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Prediction API Health
    console.log('1️⃣ Testing Prediction API Health...');
    const predHealth = await fetch('http://localhost:5000/health').then(r => r.json());
    console.log('✓ Prediction API:', predHealth.status, '| Model:', predHealth.model_loaded ? 'Loaded' : 'Not Loaded');

    // Test 2: Fare API Health
    console.log('\n2️⃣ Testing Fare API Health...');
    const fareHealth = await fetch('http://localhost:5001/api/health').then(r => r.json());
    console.log('✓ Fare API:', fareHealth.status, '| Version:', fareHealth.version);

    // Test 3: Crowd Prediction
    console.log('\n3️⃣ Testing Crowd Prediction...');
    const prediction = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stop_lat: 12.9716,
        stop_lon: 77.5946,
        time: '14:30',
        day_of_week: 1
      })
    }).then(r => r.json());
    console.log('✓ Crowd Level:', prediction.prediction.crowd_level, 
                '| Confidence:', (prediction.prediction.confidence * 100).toFixed(1) + '%');

    // Test 4: Fare Calculation
    console.log('\n4️⃣ Testing Fare Calculation...');
    const fare = await fetch('http://localhost:5001/api/calculate_fare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Majestic',
        destination: 'Whitefield'
      })
    }).then(r => r.json());
    console.log('✓ Fare: ₹' + fare.total, '| Distance:', fare.distance_km + ' km');

    // Test 5: Get Stops
    console.log('\n5️⃣ Testing Get Stops...');
    const stops = await fetch('http://localhost:5001/api/stops').then(r => r.json());
    console.log('✓ Total Stops:', stops.count);

    console.log('\n✅ ALL TESTS PASSED! 🎉');
    console.log('Your APIs are working correctly!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
  }
})();
```

---

## Expected Results

### ✅ Success Output:
```
✓ Prediction API Health: {status: "healthy", model_loaded: true, features: Array(5)}
✓ Fare API Health: {status: "healthy", service: "BMTC Fare Calculation Service", version: "1.0"}
✓ Crowd Prediction: {success: true, prediction: {...}, input: {...}}
  Crowd Level: Medium
  Confidence: 87.5%
✓ Fare Calculation: {origin: "Majestic", destination: "Whitefield", total: 25.50, ...}
  Total Fare: ₹25.50
  Distance: 20 km
✓ Get Stops: {stops: Array(1234), count: 1234}
  Total Stops: 1234
```

### ❌ Error Examples:
```
// Network Error
✗ Prediction API Failed: TypeError: Failed to fetch

// API Not Running
✗ Fare API Failed: net::ERR_CONNECTION_REFUSED

// Invalid Request
✗ Prediction Failed: {error: "Invalid request data", details: ["stop_lat is required"]}
```

---

## Troubleshooting

### If APIs Fail:

1. **Check Backend Services**
   ```powershell
   # In PowerShell (separate windows)
   cd F:\MiniProject\ml
   python start_services.py
   ```

2. **Check Ports**
   ```powershell
   netstat -ano | findstr :5000
   netstat -ano | findstr :5001
   ```

3. **Check CORS**
   - Backends should have `Access-Control-Allow-Origin: *`
   - Check Network tab in DevTools for CORS errors

4. **Check Environment**
   - Verify `.env` has correct URLs
   - Restart React app after `.env` changes

---

## Quick Links

- **API Tester Page**: http://localhost:3002/api-tester
- **Prediction API Docs**: http://localhost:5000/docs
- **Prediction Health**: http://localhost:5000/health
- **Fare Health**: http://localhost:5001/api/health

---

**Happy Testing! 🚀**
