# Journey Planner API Connection - Fix Summary

## Issues Identified and Fixed

### 1. ✅ Frontend API Configuration (`src/services/api.js`)

**Problem:** The `planJourney` function was using `SMART_BACKEND_URL` which didn't include the `/api` prefix, causing incorrect API calls.

**Fixed:**
- Changed from: `const SMART_BACKEND_URL = 'http://localhost:5001'`
- Changed to: `const FARE_API_URL = process.env.REACT_APP_FARE_API_URL || 'http://localhost:5001/api'`
- Updated `planJourney` to use: `${FARE_API_URL}/journey/plan` instead of `${SMART_BACKEND_URL}/api/journey/plan`

**Impact:** The API now correctly calls `http://localhost:5001/api/journey/plan` with query parameters.

### 2. ✅ CORS Configuration (`ml/fare_service.py`)

**Problem:** Basic CORS setup might not allow all necessary headers and methods.

**Fixed:**
```python
CORS(app, 
     origins=config.CORS_ORIGINS,  # ['http://localhost:3000', 'http://localhost:3001']
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     supports_credentials=config.CORS_ALLOW_CREDENTIALS)
```

**Impact:** Frontend on port 3001 can now make cross-origin requests without CORS errors.

### 3. ✅ Environment Variables Verified (`.env`)

**Confirmed correct:**
```env
REACT_APP_PREDICTION_API_URL=http://localhost:5000
REACT_APP_FARE_API_URL=http://localhost:5001/api
```

### 4. ✅ API Configuration (`src/config/api.js`)

**Verified correct:**
- `FARE_API.baseURL` uses `process.env.REACT_APP_FARE_API_URL` ✓
- `FARE_API.endpoints.journeyPlan` is set to `/journey/plan` ✓

### 5. ✅ Fare Service (`src/services/fareService.js`)

**Verified correct:**
- `planJourney` function properly constructs GET request with query parameters ✓
- Uses `fromStop` and `toStop` as expected by backend ✓

## Backend API Endpoint Details

### Journey Plan Endpoint
- **URL:** `http://localhost:5001/api/journey/plan`
- **Method:** GET
- **Query Parameters:**
  - `fromStop` (required): Origin stop name
  - `toStop` (required): Destination stop name
- **Response:** Array of journey objects with route, stops, metrics, and shapes

### Example Response Structure
```json
[
  {
    "route": {
      "routeId": "sample_route_1",
      "routeShortName": "500",
      "routeLongName": "Direct Route",
      "routeType": 3
    },
    "stops": [
      {
        "stopId": "1234",
        "stopName": "Majestic",
        "stopLat": 12.9767,
        "stopLon": 77.5719
      },
      {
        "stopId": "5678",
        "stopName": "Silk Board",
        "stopLat": 12.9174,
        "stopLon": 77.6222
      }
    ],
    "metrics": {
      "distance": 12.5,
      "estimatedTimeMinutes": 37,
      "fare": 25
    },
    "departureTime": "09:00 AM",
    "arrivalTime": "09:30 AM",
    "shapes": [...]
  }
]
```

## Testing Instructions

### 1. Restart Backend Services

Make sure to restart the Flask backend to apply CORS changes:

```bash
# Stop the current fare_service.py if running (Ctrl+C)

# Restart it
python ml/fare_service.py
```

You should see:
```
INFO - Bus Fare Calculation API - Starting
INFO - Available Endpoints:
  - GET  /api/health
  - GET  /api/stops
  - GET  /api/stops/search
  - POST /api/calculate_fare
  - GET  /api/journey/plan
  - GET  /api/export-fares
INFO - Running on http://0.0.0.0:5001
```

### 2. Restart React Frontend

```bash
# In your project root
npm start
```

The app should start on port 3001 (or your configured port).

### 3. Test Backend Directly

**Option A: Using Browser Console**

Open your browser console and paste the test script from `test-journey-api.js`:

```javascript
const testJourneyAPI = async () => {
  const url = 'http://localhost:5001/api/journey/plan?fromStop=Majestic&toStop=Silk%20Board';
  const response = await fetch(url);
  const data = await response.json();
  console.log('✅ Success!', data);
};
testJourneyAPI();
```

**Option B: Using curl**

```bash
curl "http://localhost:5001/api/journey/plan?fromStop=Majestic&toStop=Silk%20Board"
```

**Option C: Using PowerShell**

```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/journey/plan?fromStop=Majestic&toStop=Silk Board" -Method Get
```

### 4. Test Through React UI

1. Open the app at `http://localhost:3001`
2. Navigate to Journey Planner
3. Enter origin: "Majestic"
4. Enter destination: "Silk Board"
5. Click "Search Routes"

**Expected Result:**
- Routes should appear with fare, duration, and stops
- Map view should show the route if shapes data is available
- No CORS errors in browser console

## Troubleshooting

### If you see CORS errors:

1. **Check backend is running:**
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Verify CORS origins include your frontend port:**
   - Default includes ports 3000 and 3001
   - Check console output when starting `fare_service.py`

3. **Check browser console for exact error:**
   - Open DevTools → Console tab
   - Look for red CORS-related errors

### If you see "Stop not found" errors:

1. **Use exact stop names from GTFS data:**
   - The backend uses fuzzy matching but try common stops like:
     - "Majestic"
     - "Silk Board"
     - "KR Puram"
     - "Jayanagar"

2. **Check available stops:**
   ```bash
   curl http://localhost:5001/api/stops
   ```

### If network request fails:

1. **Verify backend port:**
   ```bash
   netstat -ano | findstr :5001
   ```

2. **Check firewall isn't blocking:**
   - Temporarily disable firewall to test
   - Add exception for Python if needed

3. **Verify .env file is loaded:**
   - Check if `REACT_APP_FARE_API_URL` is set
   - Restart React app after .env changes

## Files Modified

### Frontend Files
1. ✅ `src/services/api.js` - Fixed API URL configuration
2. ✅ `src/config/api.js` - Already correct
3. ✅ `src/services/fareService.js` - Already correct
4. ✅ `src/components/JourneyPlanner.js` - Already correct

### Backend Files
1. ✅ `ml/fare_service.py` - Enhanced CORS configuration

### Configuration Files
1. ✅ `.env` - Already correct

## Next Steps

After applying these fixes:

1. ✅ Restart Flask backend (`python ml/fare_service.py`)
2. ✅ Restart React frontend (`npm start`)
3. ✅ Test using browser console script
4. ✅ Test through React UI
5. ✅ Check browser DevTools Network tab for successful API calls

## Additional Notes

- The backend uses GTFS data for stop names and routes
- Stop name matching is fuzzy (case-insensitive, partial match)
- The journey planner returns estimated times based on 20 km/h average speed
- Fares are calculated based on distance or GTFS fare rules
- Route shapes are included if available in GTFS shapes.txt
