# Track Bus Navigation Fix

## Problem
When clicking "Track Bus" button in Search by Route page, it wasn't redirecting correctly to the Track Bus page.

## Root Cause
- **SearchRoute** was passing `route={route_id}` as URL parameter
- **TrackBus** expects a bus `number` (not route ID) to search for
- TrackBus searches for buses by their number field (e.g., "215-NE", "285-MC")
- The route_id from GTFS doesn't match the bus number format

## Solution Implemented

### 1. Changed Navigation Method
**Before:**
```javascript
onClick={() => navigate(`/track?route=${routeDetails.routeId}`)}
```

**After:**
```javascript
onClick={() => {
  navigate('/track-bus', { state: { busNumber: routeDetails.routeNumber } });
}}
```

Now using React Router's `state` to pass the route number (e.g., "285", "500D") directly.

### 2. Updated TrackBus Component

**Added `useLocation` hook:**
```javascript
import { useNavigate, useLocation } from 'react-router-dom';

const TrackBus = () => {
  const location = useLocation();
  // ...
}
```

**Added useEffect to handle pre-filled bus number:**
```javascript
useEffect(() => {
  loadBuses();
  loadGoogleMaps();
  
  // Check if bus number was passed via navigation state
  if (location.state?.busNumber) {
    const prefillBusNumber = location.state.busNumber;
    setBusNumber(prefillBusNumber);
    // Auto-search after buses are loaded
    setTimeout(() => {
      handleSearch(prefillBusNumber);
    }, 500);
  }
}, []);
```

## How It Works Now

1. User clicks "Track Bus" on route **285** in SearchRoute page
2. Navigation state passes `{ busNumber: "285" }`
3. TrackBus page loads
4. useEffect detects `location.state.busNumber = "285"`
5. Auto-fills search box with "285"
6. Triggers search to show matching buses
7. User sees suggestions dropdown with buses matching "285"

## User Experience

**Before:**
- Click "Track Bus" → Navigate to Track Bus → Empty search → Manual entry needed

**After:**
- Click "Track Bus" → Navigate to Track Bus → Search pre-filled with route number → Suggestions shown automatically

## Files Modified

1. **SearchRoute.js**
   - Changed Track Bus button to use state-based navigation
   - Added tooltip explaining the action

2. **TrackBus.js**
   - Added `useLocation` import
   - Added location state handling in useEffect
   - Auto-fills and searches for pre-filled bus number

## Testing

**Test Steps:**
1. Go to Search by Route page: `http://localhost:3001/search-route`
2. Search for a route (e.g., "285")
3. Click on the route to see details
4. Click "Track Bus" button
5. **Expected:** Redirects to Track Bus page with "285" pre-filled
6. **Expected:** Search dropdown shows buses matching "285"

**Test with Different Routes:**
- Try with: "500", "G4", "KIA", "V-500", etc.
- Each should navigate correctly and pre-fill the search

## Note on Demo Data

The TrackBus page currently uses demo bus data. The actual bus numbers in demo data are:
- "215-NE", "285-MC", "507-D", "402-B", "G-9", etc.

When searching for "285", it will match "285-MC" (partial match).
When real live bus tracking API is connected, it should match all buses on route 285.

## Future Enhancements

1. **Direct API Call**: Instead of pre-filling search, directly call `getRunningBusesOnRoute(routeId)` API
2. **Live Bus Data**: Connect to real-time bus location API for accurate tracking
3. **Route-Specific Tracking**: Filter buses specifically on the selected route
4. **Multiple Buses**: Show all buses currently running on the selected route

## Success Criteria

✅ Click "Track Bus" navigates to Track Bus page  
✅ Search box is pre-filled with route number  
✅ Suggestions dropdown shows matching buses  
✅ No console errors  
✅ Smooth navigation experience  
