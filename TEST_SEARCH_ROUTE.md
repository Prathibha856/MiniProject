# Quick Testing Guide - Search by Route Feature

## 🚀 Start Services

### Terminal 1 - Start Backend
```powershell
cd F:\MiniProject\ml
python fare_service.py
```

Expected output:
```
Loading GTFS data from ...
Loaded XXX routes from routes.txt
Loaded XXX trips from trips.txt
Loaded XXXXXX stop times from stop_times.txt
GTFS data loaded successfully
 * Running on http://0.0.0.0:5001
```

### Terminal 2 - Start Frontend
```powershell
cd F:\MiniProject
npm start
```

Frontend will open at `http://localhost:3001`

## 🧪 Testing Steps

### 1. Test Backend API Directly

**Test Health:**
```powershell
curl http://localhost:5001/api/health
```

**Test Get All Routes:**
```powershell
curl http://localhost:5001/api/routes
```

**Test Search Routes:**
```powershell
curl "http://localhost:5001/api/routes/search?q=285"
curl "http://localhost:5001/api/routes/search?q=KBS"
curl "http://localhost:5001/api/routes/search?q=Whitefield"
```

**Test Route Details (replace with actual route_id from routes response):**
```powershell
curl http://localhost:5001/api/routes/ROUTE_ID_HERE/details
```

### 2. Test Frontend UI

1. **Navigate to page:**
   - Go to `http://localhost:3001/search-route`

2. **Test Search:**
   - Type "285" in the search box
   - Should see dropdown with matching routes
   - Click on a route

3. **Verify Details Panel Shows:**
   - ✅ Route number (large, red text)
   - ✅ Route name (full name)
   - ✅ Origin and Destination
   - ✅ Total Stops (number from GTFS)
   - ✅ Total Trips (number from GTFS)
   - ✅ Operating Hours (HH:MM - HH:MM)
   - ✅ Service Type badge
   - ✅ Two action buttons (Track Bus, Fare Calculator)

4. **Test Action Buttons:**
   - Click "Track Bus" → Should navigate to `/track?route=XXX`
   - Go back
   - Click "Fare Calculator" → Should navigate to `/fare-calculator?route=XXX`

5. **Check Console Logs:**
   - Open DevTools (F12)
   - Look for:
     - "Routes API response:" with actual data
     - "Route details:" with statistics
     - "Total Stops Loaded: 285"

### 3. Test Different Searches

Try these searches to verify functionality:
- **By Number:** "285", "500", "G4", "KBS"
- **By Name:** "Whitefield", "Electronic City", "Majestic", "Airport"
- **By Location:** "KR Puram", "Hebbal", "Banashankari"

### 4. Test Edge Cases

- Search with no results: "XXXYYY123" → Should show empty state
- Clear search → Should reset to initial state
- Favorite a route → Should appear in favorites section
- Apply filters → Should filter by service type

## 🔍 Debugging Checklist

### Backend Issues:

**Routes not loading?**
- [ ] Check GTFS files exist: `F:\MiniProject\ml\dataset\gtfs\`
- [ ] Check routes.txt has data
- [ ] Check trips.txt exists
- [ ] Check stop_times.txt exists
- [ ] Backend logs show "Loaded X routes"
- [ ] API health check returns 200: `http://localhost:5001/api/health`

**Search not working?**
- [ ] Check API call in Network tab
- [ ] Response status is 200
- [ ] Response has "routes" array
- [ ] Query parameter is correct

**Details not showing?**
- [ ] Route has trips in trips.txt
- [ ] Route has stop_times in stop_times.txt
- [ ] API returns `total_stops` and `total_trips` > 0
- [ ] Check backend logs for errors

### Frontend Issues:

**No routes displaying?**
- [ ] Check browser console for errors
- [ ] Check Network tab for API calls
- [ ] Check if CORS errors appear
- [ ] Verify API_BASE_URL is `http://localhost:5001/api`

**Action buttons not working?**
- [ ] Check if `routeId` is set in routeDetails
- [ ] Check browser console for navigation errors
- [ ] Verify route parameter in URL after click

**Styling issues?**
- [ ] Check if `search-route.css` is imported
- [ ] Check browser console for CSS errors
- [ ] Try hard refresh (Ctrl+Shift+R)

## 📊 Expected Results

### Route List:
- Should load 285+ routes from GTFS data
- Each route should have:
  - route_id
  - route_short_name (displayed as route number)
  - route_long_name (displayed as route name)

### Route Details:
- Total Stops: Varies by route (typically 10-50)
- Total Trips: Varies by route (typically 20-200)
- Operating Hours: Format "HH:MM - HH:MM" (e.g., "05:30 - 23:00")
- Service Type: "Ordinary" (most routes) or "Other"

### Performance:
- Search should be instant (< 500ms)
- Route details should load in < 1 second
- No console errors
- Smooth transitions and animations

## ✅ Success Criteria

The feature is working correctly if:

1. ✅ Typing in search shows matching routes
2. ✅ Clicking a route shows details panel
3. ✅ Details panel shows real GTFS data (not demo data)
4. ✅ "Total Stops" and "Total Trips" are numbers > 0
5. ✅ "Track Bus" button navigates correctly
6. ✅ "Fare Calculator" button navigates correctly
7. ✅ Console logs show API responses
8. ✅ No errors in browser console
9. ✅ UI is clean and responsive

## 🎉 If Everything Works:

You should see:
- Real-time route search working
- Route details with accurate GTFS statistics
- Navigation buttons functioning
- Clean, professional UI
- Console logs confirming API integration

**The feature is now production-ready!**
