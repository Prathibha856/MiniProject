# 🚨 URGENT FIX GUIDE - Journey Planner Not Showing Data

## Problem: Frontend shows nothing when searching for routes

---

## 🔍 STEP 1: Verify Backend is Actually Running

### Test 1: Check if port 5001 is listening
```powershell
netstat -ano | findstr :5001
```

**Expected output:** You should see something like:
```
TCP    0.0.0.0:5001    0.0.0.0:0    LISTENING    12345
```

**If you see NOTHING:** Backend is NOT running, despite what the terminal says!

---

## 🔧 STEP 2: Run Diagnostic Script

```powershell
cd F:\MiniProject\ml
python diagnose_and_fix.py
```

This will check:
- ✅ Port status
- ✅ Backend API accessibility
- ✅ GTFS data files
- ✅ Configuration

---

## ⚡ STEP 3: Start Backend Properly

### Option A: Use the startup script (RECOMMENDED)
```powershell
cd F:\MiniProject\ml
.\start_backend.ps1
```

### Option B: Manual start with verbose logging
```powershell
cd F:\MiniProject\ml
$env:FARE_API_HOST = "0.0.0.0"
$env:FARE_API_PORT = "5001"
$env:CORS_ORIGINS = "http://localhost:3000,http://localhost:3001"
python fare_service.py
```

**Watch the terminal for these startup messages:**
```
Loading GTFS data from...
Loaded 9360 stops from stops.txt
Loaded 4190 routes from routes.txt
Loaded 2100000 shape points from shapes.txt
GTFS data loaded successfully
Running on http://0.0.0.0:5001
```

**If you see errors like:**
- `File not found: stops.txt` → GTFS data is missing
- `Module not found` → Install missing Python packages
- `Port already in use` → Kill the process using port 5001

---

## 🧪 STEP 4: Test Backend Directly

### Test 1: Open the test HTML file
```powershell
# Open in browser
start F:\MiniProject\test_journey_planner.html
```

This standalone test page will:
- ✅ Check if backend is online
- ✅ Test all API endpoints
- ✅ Show detailed error messages

### Test 2: Use curl/PowerShell
```powershell
# Health check
curl http://localhost:5001/api/health

# Get stops
curl http://localhost:5001/api/stops

# Test journey planning
curl "http://localhost:5001/api/journey/plan?fromStop=Majestic&toStop=Whitefield"
```

**Expected response for journey plan:**
```json
[
  {
    "route": { "routeShortName": "500D" },
    "stops": [...],
    "metrics": { "distance": 18.5, "fare": 25 },
    "shapes": [...]
  }
]
```

---

## 🌐 STEP 5: Check Frontend Console

1. Open your React app at `http://localhost:3001`
2. Press **F12** to open DevTools
3. Go to **Console** tab

### Look for these errors:

#### Error Type 1: Network Error (Backend not running)
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```
**Fix:** Backend is not running. Go back to Step 3.

#### Error Type 2: CORS Error
```
Access to fetch at 'http://localhost:5001/api/journey/plan' 
has been blocked by CORS policy
```
**Fix:** CORS not configured. Verify config.py has port 3001:
```python
CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001']
```
Restart backend after changing config.

#### Error Type 3: API Returns Error
```
404 Not Found
500 Internal Server Error
```
**Fix:** Check backend terminal for error messages.

### Check Network Tab
1. Go to **Network** tab in DevTools
2. Search for "journey/plan"
3. Click on the request
4. Check **Response** section

---

## 🔥 COMMON ISSUES & FIXES

### Issue 1: Backend shows "Running" but isn't accessible
**Cause:** Bound to 127.0.0.1 instead of 0.0.0.0, or GTFS data failed to load

**Fix:**
```powershell
# Force bind to all interfaces
$env:FARE_API_HOST = "0.0.0.0"
python fare_service.py
```

### Issue 2: "stops.txt not found"
**Cause:** GTFS data not in correct location

**Fix:**
1. Verify files exist in: `F:\MiniProject\ml\dataset\gtfs\`
2. Check these files:
   - stops.txt
   - routes.txt
   - shapes.txt
   - fare_attributes.txt
   - fare_rules.txt

### Issue 3: Frontend makes request to wrong URL
**Cause:** .env file not configured correctly

**Fix:** Verify `F:\MiniProject\.env`:
```env
REACT_APP_FARE_API_URL=http://localhost:5001/api
```

After changing .env, restart React:
```powershell
# Stop React (Ctrl+C in terminal)
# Start again
npm start
```

### Issue 4: Data loads but map doesn't show
**Cause:** Google Maps API issue or missing map initialization

**Fix:**
1. Check browser console for Google Maps errors
2. Verify API key in .env
3. Check if map div has height set

---

## 🎯 QUICK DIAGNOSIS CHECKLIST

Run through this checklist:

- [ ] Port 5001 is listening: `netstat -ano | findstr :5001`
- [ ] Backend responds to health check: `curl http://localhost:5001/api/health`
- [ ] Backend responds to journey API: Test with curl (see above)
- [ ] Frontend .env has correct API URL
- [ ] Browser console shows no CORS errors
- [ ] Browser Network tab shows successful API calls
- [ ] React is running on port 3001: `http://localhost:3001`

---

## 📞 STEP-BY-STEP RESTART PROCEDURE

If nothing works, do a complete restart:

### 1. Stop Everything
```powershell
# Stop React (Ctrl+C in React terminal)
# Stop Backend (Ctrl+C in backend terminal)

# Kill any processes on ports
netstat -ano | findstr :5001
netstat -ano | findstr :3001
# Note the PID and kill them:
taskkill /PID <PID> /F
```

### 2. Clear Browser Cache
- Press Ctrl+Shift+Delete
- Clear cached images and files
- Close all browser tabs

### 3. Restart Backend
```powershell
cd F:\MiniProject\ml
.\start_backend.ps1
```

Wait for "Running on http://0.0.0.0:5001" message.

### 4. Verify Backend
```powershell
curl http://localhost:5001/api/health
```

### 5. Restart Frontend
```powershell
cd F:\MiniProject
npm start
```

### 6. Test in Browser
1. Open `http://localhost:3001`
2. Open DevTools (F12)
3. Type "Majestic" in origin
4. Type "Whitefield" in destination
5. Click "Search Routes"
6. Watch Console and Network tabs

---

## 🐛 DEBUGGING TIPS

### Enable Verbose Logging

Edit `config.py`:
```python
DEBUG = True
LOG_LEVEL = 'DEBUG'
```

Restart backend and check logs in `F:\MiniProject\ml\fare_api.log`

### Check API Response Format

The backend should return:
```json
[
  {
    "route": { "routeId": "...", "routeShortName": "..." },
    "stops": [
      { "stopName": "...", "stopLat": 12.xx, "stopLon": 77.xx }
    ],
    "metrics": { "distance": X, "estimatedTimeMinutes": Y, "fare": Z },
    "shapes": [
      { "shapePtLat": 12.xx, "shapePtLon": 77.xx, "shapePtSequence": 0 }
    ]
  }
]
```

### Test with Simple Curl
```powershell
curl -v "http://localhost:5001/api/journey/plan?fromStop=test&toStop=test"
```

The `-v` flag shows full request/response including headers.

---

## 📝 Log Files to Check

1. **Backend logs:** `F:\MiniProject\ml\fare_api.log`
2. **Browser console:** F12 → Console tab
3. **Backend terminal:** Where you ran `python fare_service.py`

---

## ✅ SUCCESS INDICATORS

You know it's working when:

1. ✅ `netstat -ano | findstr :5001` shows LISTENING
2. ✅ `curl http://localhost:5001/api/health` returns JSON
3. ✅ Test HTML page shows "Backend Online"
4. ✅ Browser Network tab shows 200 OK for journey/plan
5. ✅ Browser Console has no errors
6. ✅ Routes appear in the Journey Planner UI
7. ✅ Map shows markers and route lines

---

## 🆘 If Still Not Working

1. **Run diagnostic:** `python diagnose_and_fix.py`
2. **Check test page:** Open `test_journey_planner.html` in browser
3. **Verify GTFS data:** Ensure stops.txt, routes.txt exist
4. **Check backend terminal:** Look for error messages
5. **Check browser console:** Look for error messages
6. **Verify API URL:** Check .env file
7. **Restart everything:** Follow restart procedure above

---

## 📚 Files Created for Debugging

1. `diagnose_and_fix.py` - Diagnostic script
2. `start_backend.ps1` - Startup script with checks
3. `test_journey_planner.html` - Standalone test page
4. `URGENT_FIX_GUIDE.md` - This guide

Run these tools to identify the exact issue!
