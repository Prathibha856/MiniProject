# 🚀 Quick Start Guide - BMTC Fare Calculator

## Get Started in 3 Steps!

### Step 1: Start the Backend (Python)

Open PowerShell and run:

```powershell
cd F:\MiniProject
.\start_fare_service.ps1
```

Or manually:
```bash
cd ml
pip install -r requirements_fare.txt
python fare_service.py
```

You should see:
```
Loading GTFS data...
Loaded 62 fare attributes
Loaded 190000+ fare rules
Starting BMTC Fare Service on http://localhost:5001
```

✅ **Backend is now running!**

---

### Step 2: Start the Frontend (React)

Open a **NEW terminal** and run:

```bash
cd F:\MiniProject
npm start
```

The app will open at `http://localhost:3000`

✅ **Frontend is now running!**

---

### Step 3: Test the Fare Calculator

1. Navigate to **Fare Calculator** in the app
2. You should see: **"Live GTFS Data Active"** indicator (green)
3. Try these test routes:

**Test Route 1:**
- From: `Kempegowda Bus Station`
- To: `Electronic City`
- Expected Fare: ₹10-15

**Test Route 2:**
- From: `Whitefield`
- To: `Silk Board`
- Expected Fare: ₹15-20

**Test Route 3:**
- From: `Banashankari`
- To: `Koramangala`
- Expected Fare: ₹12-18

✅ **You should see accurate fares with GTFS data!**

---

## Troubleshooting

### "Using Estimated Fares" showing instead of "Live GTFS Data"

**Problem:** Backend is not connected

**Solution:**
1. Make sure backend is running: `http://localhost:5001/api/fare/health`
2. Check for port conflicts
3. Restart both backend and frontend

### Backend won't start

**Error:** `ModuleNotFoundError`

**Solution:**
```bash
cd ml
pip install flask flask-cors pandas numpy
```

### No search suggestions appearing

**Problem:** GTFS data not loaded

**Solution:**
1. Verify files exist: `ml\dataset\gtfs\fare_attributes.txt`
2. Check backend console for errors
3. Restart backend service

---

## Verify Everything Works

Run the test suite:

```bash
cd ml
python test_fare_service.py
```

You should see:
```
🎉 All tests passed! Your fare calculator is working perfectly!
```

---

## What's Happening Behind the Scenes?

1. **Backend loads GTFS data** from `ml/dataset/gtfs/`
   - 62 fare types (₹5 to ₹315)
   - 7,000+ bus stops
   - 190,000+ fare rules
   - 2,000+ routes

2. **Frontend connects** to backend API

3. **User searches stops** → Backend returns real GTFS stop names

4. **User calculates fare** → Backend:
   - Finds stop IDs from `stops.txt`
   - Matches route in `fare_rules.txt`
   - Gets price from `fare_attributes.txt`
   - Adds GST and returns accurate fare

---

## Features You Can Test

✅ **Real GTFS stop names** - All 7,000+ stops searchable
✅ **Accurate fare calculation** - Based on real BMTC data
✅ **Auto-complete search** - Type to find stops instantly
✅ **Fare breakdown** - See base fare, GST, total
✅ **Recent searches** - Quick access to previous routes
✅ **Fallback mode** - Works even if backend is offline

---

## API Endpoints (For Testing)

Health check:
```bash
curl http://localhost:5001/api/fare/health
```

Search stops:
```bash
curl "http://localhost:5001/api/fare/stops/search?q=majestic"
```

Calculate fare:
```bash
curl -X POST http://localhost:5001/api/fare/calculate \
  -H "Content-Type: application/json" \
  -d "{\"origin\":\"Kempegowda Bus Station\",\"destination\":\"Electronic City\"}"
```

---

## Need Help?

Check the full documentation: `FARE_CALCULATOR_README.md`

---

**Status:** ✅ Ready to Use

**Last Updated:** 2025-10-26
