# ✅ Working Stop Names for Journey Planner Testing

## 🎯 Use These Exact Stop Names

### Popular Routes to Test:

#### Route 1: Majestic to Whitefield
- **Origin:** `Kempegowda Bus Station(Majestic/KBS)`
- **Destination:** `White Field Bus Station (Vydehi Hospital)`

#### Route 2: Koramangala to Silk Board
- **Origin:** `BDA Complex Koramangala`
- **Destination:** `Central Silk Board`

#### Route 3: Indiranagar to KR Puram
- **Origin:** `Depot-06 Indiranagara`
- **Destination:** `Depot-29 KR Puram`

---

## 📋 All Available Stops (9,360 total)

### Majestic Area:
- `Kempegowda Bus Station(Majestic/KBS)`

### Whitefield Area:
- `White Field Bus Station (Vydehi Hospital)` ✅ USE THIS
- `Depot-18 White Field`
- `White Field Post Office`
- `Whitefiled ACP Police Station`

### KR Puram Area:
- `Depot-29 KR Puram`
- `CS-KR Puram Railway Station`
- `CS-KR Puram Govt Hospital`
- `Chikka Devasandra KR Puram`

### Silk Board Area:
- `Central Silk Board`
- `Depot-25 Gate (Central Silk Board)`

### Koramangala Area:
- `BDA Complex Koramangala`
- `CS-Koramangala TTMC`
- `Depot-15 Koramangala`
- `CS-Chinmaya Vidyalaya Koramangala`

### Indiranagar Area:
- `Depot-06 Indiranagara`
- `CS-Indiranagara 12th Main`
- `Double Road Indiranagara`
- `ESI Hospital Indiranagara`

---

## 🔍 How to Find Other Stops

Run this script to search:
```powershell
cd F:\MiniProject\ml
python find_stops.py
```

Or search via API:
```powershell
curl "http://localhost:5001/api/stops/search?q=your_search_term"
```

---

## 🚀 Testing Steps

### 1. Start Backend (Keep Running!)
```powershell
cd F:\MiniProject\ml
python fare_service.py
# Wait for "Running on http://0.0.0.0:5001"
# KEEP THIS TERMINAL OPEN
```

### 2. Test with HTML Page
Open: `F:\MiniProject\test_journey_planner.html`
- Click "Test Journey" button (uses correct names now)
- Should show route with fare, distance, time

### 3. Start React App (New Terminal)
```powershell
cd F:\MiniProject
npm start
```

### 4. Test in React Journey Planner
Navigate to Journey Planner in React app:
- **Origin:** Type "Kempegowda" and select from dropdown
- **Destination:** Type "White Field" and select from dropdown
- Click "Search Routes"
- Should display route on map with markers!

---

## ⚠️ Common Mistakes

❌ **DON'T USE:** "Majestic" (won't work)
✅ **USE:** "Kempegowda Bus Station(Majestic/KBS)"

❌ **DON'T USE:** "Whitefield" (won't work)
✅ **USE:** "White Field Bus Station (Vydehi Hospital)"

The autocomplete in the React app will help you find the correct names!

---

## 🗺️ What Should Work Now

When you search with correct stop names:

1. ✅ Backend returns journey data
2. ✅ Frontend displays route information
3. ✅ Map shows:
   - Green marker (A) at origin
   - Red marker (B) at destination
   - Blue polyline with route path from shapes.txt
4. ✅ Route details show fare, distance, time

---

## 📞 Next Steps

1. **Keep backend running** in one terminal
2. **Start React** in another terminal
3. **Use autocomplete** to find stop names
4. **Test the journey planner** with real stops
5. **Check the map** for route visualization

The autocomplete will search all 9,360 stops as you type!
