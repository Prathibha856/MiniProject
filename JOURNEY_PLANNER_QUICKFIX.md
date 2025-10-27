# Journey Planner - Quick Fix & Testing Guide

## ⚠️ Issue Found
Your Flask backends were NOT running, causing the "Error finding routes" message.

##  Changes Made

### 1. ✅ Added CORS Support for Port 3002
**File:** `ml/.env` (line 21)
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173,http://127.0.0.1:3000,http://192.168.1.4:3000
```

### 2. ✅ Added Environment Variable Loading
**Files:** `ml/fare_service.py` and `ml/predict_api.py`
```python
from dotenv import load_dotenv
load_dotenv()
```

### 3. ✅ Fixed API URLs (Done Previously)
**File:** `src/services/api.js`
- Changed to use `FARE_API_URL` with proper `/api` prefix

## 🚀 Start the Backends

### **Option 1: Start Both Services**
```powershell
cd F:\MiniProject\ml
python start_services.py
```

### **Option 2: Start Individually**

**Terminal 1 - Prediction API (Port 5000):**
```powershell
cd F:\MiniProject\ml
python predict_api.py
```

**Terminal 2 - Fare Service (Port 5001):**
```powershell
cd F:\MiniProject\ml
python fare_service.py
```

## 🧪 Test Backend Endpoints

### **1. Browser Console Test (Recommended)**

Open your browser console (F12) on `http://localhost:3002` and run:

```javascript
// Test Journey Planner API
fetch('http://localhost:5001/api/journey/plan?fromStop=Kempegowda Bus Station&toStop=Doddaballapura Bus Stand')
  .then(response => {
    console.log('✅ Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Response:', data);
    if (data.length > 0) {
      console.log('\n📊 Route Found:');
      console.log('  Route:', data[0].route.routeShortName);
      console.log('  Fare: ₹' + data[0].metrics.fare);
      console.log('  Distance:', data[0].metrics.distance + ' km');
      console.log('  Time:', data[0].metrics.estimatedTimeMinutes + ' mins');
    }
  })
  .catch(err => console.error('❌ Error:', err));
```

### **2. Test Health Endpoints**

```javascript
// Test Fare API Health
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(d => console.log('Fare API:', d))
  .catch(e => console.error('Fare API Error:', e));

// Test Prediction API Health  
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(d => console.log('Prediction API:', d))
  .catch(e => console.error('Prediction API Error:', e));
```

### **3. PowerShell Test**

```powershell
# Test Journey Plan Endpoint
Invoke-RestMethod -Uri "http://localhost:5001/api/journey/plan?fromStop=Kempegowda Bus Station&toStop=Doddaballapura Bus Stand" -Method Get | ConvertTo-Json -Depth 5

# Test Health
Invoke-RestMethod -Uri "http://localhost:5001/api/health" -Method Get
```

## 🔍 Verify CORS is Working

Run this in browser console from `http://localhost:3002`:

```javascript
fetch('http://localhost:5001/api/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  if (response.ok) {
    console.log('✅ CORS is working! No errors.');
    return response.json();
  } else {
    console.error('❌ HTTP Error:', response.status);
  }
})
.then(data => console.log('Response:', data))
.catch(error => {
  if (error.message.includes('CORS')) {
    console.error('❌ CORS Error:', error);
    console.log('💡 Make sure backend .env has port 3002 in CORS_ORIGINS');
  } else {
    console.error('❌ Network Error:', error);
    console.log('💡 Make sure Flask backend is running on port 5001');
  }
});
```

## 📍 Available Stop Names

The GTFS data uses specific stop names. Here are some examples:

### **Major Stops:**
- `Kempegowda Bus Station(Majestic/KBS)` (Not just "Majestic")
- `Doddaballapura Bus Stand`
- `Doddaballapura KEB Circle`
- `Doddaballapura Railway Station`
- `10th Cross Magadi Road`
- `14th Main HSR Layout`

### **Search for Stops:**

```javascript
// Search stops by name
fetch('http://localhost:5001/api/stops/search?q=Doddaball')
  .then(r => r.json())
  .then(data => {
    console.log('Found', data.count, 'stops:');
    data.stops.forEach(stop => console.log(' -', stop.stop_name));
  });
```

### **Get All Stops:**

```javascript
fetch('http://localhost:5001/api/stops')
  .then(r => r.json())
  .then(data => {
    console.log('Total stops:', data.count);
    console.log('First 10:', data.stops.slice(0, 10));
  });
```

## 🎯 Test Through React UI

1. **Start React App** (if not running):
   ```powershell
   cd F:\MiniProject
   npm start
   ```
   (Should open on port 3002)

2. **Navigate to Journey Planner**

3. **Try these stop combinations:**
   
   **Test 1: Kempegowda to Doddaballapura**
   - Origin: Type "Kempegowda" - select `Kempegowda Bus Station(Majestic/KBS)`
   - Destination: Type "Doddaball" - select `Doddaballapura Bus Stand`
   - Click "Search Routes"

   **Test 2: Simple stop names**
   - Origin: "10th Cross Magadi Road"
   - Destination: "14th Main HSR Layout"

4. **Check Browser Console** for:
   - ✅ API request URL
   - ✅ Response data
   - ❌ Any CORS or network errors

## 🐛 Troubleshooting

### Problem: "Unable to connect to remote server"
**Solution:** Backends are not running
```powershell
# Check if ports are in use
netstat -ano | findstr :5000
netstat -ano | findstr :5001

# If empty, start the backends
cd F:\MiniProject\ml
python start_services.py
```

### Problem: CORS Error in Browser
**Solution:** Port 3002 not in CORS origins
1. Check `ml/.env` line 21 contains `http://localhost:3002`
2. Restart Flask backends after updating .env

### Problem: "Stop not found"
**Solution:** Use exact stop names from GTFS data
- Search for stops first using `/api/stops/search?q=<name>`
- Use the exact `stop_name` returned
- Backend uses fuzzy matching but exact names work best

### Problem: Empty routes array `[]`
**Solution:** No direct route exists in GTFS data
- Try different stop combinations
- The backend returns sample routes for testing
- Check backend logs for GTFS loading errors

## 📝 Complete Test Checklist

Run these in order:

```javascript
// ✅ Step 1: Check backends are running
Promise.all([
  fetch('http://localhost:5000/health').then(r => r.json()),
  fetch('http://localhost:5001/api/health').then(r => r.json())
]).then(([pred, fare]) => {
  console.log('✅ Prediction API:', pred.status);
  console.log('✅ Fare API:', fare.status);
}).catch(e => console.error('❌ Backend not running:', e));

// ✅ Step 2: Check CORS from your React app origin
fetch('http://localhost:5001/api/health', {
  method: 'OPTIONS'
}).then(r => console.log('✅ CORS preflight OK:', r.status))
  .catch(e => console.error('❌ CORS error:', e));

// ✅ Step 3: Search for stops
fetch('http://localhost:5001/api/stops/search?q=Majestic')
  .then(r => r.json())
  .then(d => console.log('✅ Found stops:', d.stops.map(s => s.stop_name)));

// ✅ Step 4: Test journey planner
fetch('http://localhost:5001/api/journey/plan?fromStop=Kempegowda Bus Station&toStop=Doddaballapura Bus Stand')
  .then(r => r.json())
  .then(data => console.log('✅ Journey plan:', data))
  .catch(e => console.error('❌ Journey plan error:', e));
```

## 🎉 Success Indicators

When everything works:
1. ✅ No console errors
2. ✅ Routes appear in UI with fare, distance, time
3. ✅ Map shows route polyline and markers
4. ✅ Stop suggestions appear when typing
5. ✅ Recent searches are saved

## 📞 Quick Commands Reference

```powershell
# Start backends
cd F:\MiniProject\ml; python start_services.py

# Start React
cd F:\MiniProject; npm start

# Check ports
netstat -ano | findstr ":5000 :5001 :3002"

# View backend logs
Get-Content F:\MiniProject\ml\fare_api.log -Tail 20
Get-Content F:\MiniProject\ml\predict_api.log -Tail 20

# Test endpoints
Invoke-RestMethod http://localhost:5001/api/health
Invoke-RestMethod http://localhost:5000/health
```

## 🔑 Key Files Modified

1. `ml/.env` - Added port 3002 to CORS
2. `ml/fare_service.py` - Added dotenv loading
3. `ml/predict_api.py` - Added dotenv loading  
4. `src/services/api.js` - Fixed API URLs (done earlier)

---

**Next:** Restart Flask backends and test using browser console commands above!
