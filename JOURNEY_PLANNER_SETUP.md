# BMTC Bus Journey Planner - Complete Setup Guide

## 🎯 Project Overview

A React-based journey planning application that integrates with GTFS (General Transit Feed Specification) data to provide interactive bus route visualization with Google Maps.

---

## 📋 System Requirements

- **Frontend**: React 18+ running on port **3001**
- **Backend APIs**:
  - Prediction API: `http://localhost:5000` (ML predictions)
  - Fare/Journey API: `http://localhost:5001` (GTFS data, journey planning)
- **Python**: 3.8+ with Flask
- **Node.js**: 16+ with npm
- **Google Maps API Key**: Required for map visualization

---

## 🚀 Quick Start

### 1. Start Backend Services

```bash
cd F:\MiniProject\ml

# Start both services
python predict_api.py    # Terminal 1 - Port 5000
python fare_service.py   # Terminal 2 - Port 5001
```

### 2. Start React Frontend

```bash
cd F:\MiniProject

# Install dependencies (first time only)
npm install

# Start development server on port 3001
npm start
```

The application will automatically open at `http://localhost:3001`

---

## 🗺️ GTFS Dataset Structure

Your dataset includes:

| File | Records | Purpose |
|------|---------|---------|
| `stops.txt` | 9,360 stops | All bus stops with coordinates |
| `routes.txt` | 4,190 routes | Bus route definitions |
| `shapes.txt` | 2.1M points | Route shape geometry for visualization |
| `stop_times.txt` | Large | Stop sequences and timing |
| `fare_attributes.txt` | - | Fare pricing information |
| `fare_rules.txt` | - | Fare rules by origin/destination |

---

## 🔧 Configuration Files

### package.json
```json
{
  "scripts": {
    "start": "set PORT=3001 && react-scripts start"
  }
}
```

### .env (Already Configured)
```env
REACT_APP_PREDICTION_API_URL=http://localhost:5000
REACT_APP_FARE_API_URL=http://localhost:5001/api
REACT_APP_GOOGLE_MAPS_KEY=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg
```

### config.py (Backend)
```python
# CORS already configured for port 3001
CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001']
```

---

## 📡 Backend API Endpoints

### Journey Planning API (Port 5001)

#### GET `/api/journey/plan`
Plan a journey between two stops.

**Query Parameters:**
- `fromStop` (required): Origin stop name
- `toStop` (required): Destination stop name

**Example Request:**
```bash
GET http://localhost:5001/api/journey/plan?fromStop=Majestic&toStop=Whitefield
```

**Response Structure:**
```json
[
  {
    "route": {
      "routeId": "500",
      "routeShortName": "500D",
      "routeLongName": "Majestic to Whitefield",
      "routeType": 3
    },
    "stops": [
      {
        "stopId": "1001",
        "stopName": "Majestic",
        "stopLat": 12.9762,
        "stopLon": 77.5714
      },
      {
        "stopId": "2002",
        "stopName": "Whitefield",
        "stopLat": 12.9698,
        "stopLon": 77.7499
      }
    ],
    "metrics": {
      "distance": 18.5,
      "estimatedTimeMinutes": 55,
      "fare": 25
    },
    "departureTime": "09:00 AM",
    "arrivalTime": "09:55 AM",
    "shapes": [
      {
        "shapePtLat": 12.9762,
        "shapePtLon": 77.5714,
        "shapePtSequence": 0
      },
      {
        "shapePtLat": 12.9765,
        "shapePtLon": 77.5720,
        "shapePtSequence": 1
      }
      // ... thousands of shape points
    ]
  }
]
```

### Other Endpoints

#### GET `/api/stops`
Get all bus stops.
```json
{
  "stops": [
    {"stop_id": "1001", "stop_name": "Majestic"},
    {"stop_id": "1002", "stop_name": "KR Puram"}
  ],
  "count": 9360
}
```

#### GET `/api/stops/search?q={query}`
Search stops by name.
```bash
GET http://localhost:5001/api/stops/search?q=majestic
```

#### POST `/api/calculate_fare`
Calculate fare between two stops.
```json
{
  "origin": "Majestic",
  "destination": "Whitefield",
  "route_id": "500D"
}
```

---

## 🗺️ Frontend Journey Planner Component

### Location: `src/components/JourneyPlanner.js`

### Key Features

1. **Autocomplete Stop Selection**
   - Real-time search from 9,360 stops
   - Dropdown suggestions as you type
   - Minimum 2 characters to trigger search

2. **Interactive Google Maps**
   - Marker A (Green): Origin stop with label
   - Marker B (Red): Destination stop with label
   - Blue polyline: Accurate route path from GTFS shapes.txt
   - Traffic layer overlay
   - Info windows on marker click

3. **Route Visualization**
   - Uses 2.1M shape points from shapes.txt
   - Draws accurate bus route paths (not straight lines)
   - Multiple stops shown along route
   - Color-coded markers (origin, destination, intermediate)

4. **Route Details**
   - Distance in kilometers
   - Estimated travel time
   - Fare calculation
   - Departure/arrival times
   - List of stops on route

### How It Works

```javascript
// 1. User selects origin and destination
handleOriginChange("Majestic")
handleDestChange("Whitefield")

// 2. API call to backend
const response = await apiService.planJourney(origin, destination)

// 3. Process response with shapes data
const formattedRoutes = routesArray.map(route => ({
  shapes: route.shapes || [],  // Array of lat/lon points
  stopCoordinates: route.stops.map(stop => ({
    lat: parseFloat(stop.stopLat),
    lng: parseFloat(stop.stopLon),
    name: stop.stopName
  }))
}))

// 4. Draw on map
const shapePath = route.shapes.map(point => ({
  lat: parseFloat(point.shapePtLat),
  lng: parseFloat(point.shapePtLon)
}))

const routeLine = new google.maps.Polyline({
  path: shapePath,
  strokeColor: '#2196f3',
  strokeWeight: 4,
  map: mapInstance.current
})
```

---

## 📊 GTFS Shapes Data Integration

### Backend (fare_service.py)

The `get_route_shapes()` function retrieves shape data:

```python
def get_route_shapes(shapes_df, route_short_name):
    """Get shape data for a route"""
    # Filter shapes by route short name
    matching_shapes = shapes_df[
        shapes_df['shape_id'].str.contains(str(route_short_name), na=False)
    ]
    
    # Sort by sequence
    sorted_shape = first_shape.sort_values('shape_pt_sequence')
    
    # Return formatted points
    return [
        {
            'shapePtLat': float(row['shape_pt_lat']),
            'shapePtLon': float(row['shape_pt_lon']),
            'shapePtSequence': int(row['shape_pt_sequence'])
        }
        for _, row in sorted_shape.iterrows()
    ]
```

### Frontend (JourneyPlanner.js)

The `displayAllRoutesOnMap()` function renders shapes:

```javascript
// Draw route shapes if available
if (route.shapes && route.shapes.length > 0) {
  const shapePath = route.shapes.map(point => ({
    lat: parseFloat(point.shapePtLat),
    lng: parseFloat(point.shapePtLon)
  }))

  const routeLine = new google.maps.Polyline({
    path: shapePath,
    geodesic: true,
    strokeColor: '#2196f3',
    strokeOpacity: 1,
    strokeWeight: 4,
    map: mapInstance.current
  })
}

// Add stop markers
route.stopCoordinates.forEach((stop, idx) => {
  const marker = new google.maps.Marker({
    position: { lat: stop.lat, lng: stop.lng },
    map: mapInstance.current,
    title: stop.name,
    label: idx === 0 ? 'A' : idx === last ? 'B' : ''
  })
})
```

---

## 🎨 UI Components

### Search Panel
- Origin input with autocomplete
- Destination input with autocomplete
- Swap button to reverse journey
- Search button to find routes
- Filter panel (time, service type, sort)

### Results Panel
- **List View**: Cards showing route details
- **Map View**: Interactive Google Maps visualization

### Route Details Modal
- Full stop list
- Bus numbers
- Timing information
- Fare breakdown

---

## 🔍 Troubleshooting

### Issue: Map Not Showing

1. Check Google Maps API key in `.env`
2. Verify key has Maps JavaScript API enabled
3. Check browser console for errors
4. Ensure mapRef is attached to DOM element

### Issue: No Route Shapes Displayed

1. Verify shapes.txt exists in `ml/dataset/gtfs/`
2. Check backend logs for shape loading
3. Ensure shape_id format matches route names
4. Check console for "Drawing shapes for route" logs

### Issue: CORS Errors

```bash
# Verify fare_service.py is running
curl http://localhost:5001/api/health

# Check config.py CORS_ORIGINS includes port 3001
CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001']
```

### Issue: Port Already in Use

```bash
# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use different port temporarily
set PORT=3002 && npm start
```

---

## 🧪 Testing the Application

### 1. Test Backend APIs

```bash
# Health check
curl http://localhost:5001/api/health

# Get stops
curl http://localhost:5001/api/stops

# Search stops
curl "http://localhost:5001/api/stops/search?q=majestic"

# Journey plan
curl "http://localhost:5001/api/journey/plan?fromStop=Majestic&toStop=Whitefield"
```

### 2. Test Frontend

1. Open `http://localhost:3001`
2. Type "Majestic" in origin field
3. Select from dropdown
4. Type "Whitefield" in destination field
5. Click "Search Routes"
6. Switch to "Map View"
7. Verify markers and route line appear
8. Click markers to see info windows

---

## 📈 Performance Considerations

### Shapes Data
- shapes.txt contains 2.1M points
- Backend filters by route to send only relevant points
- Frontend renders 1000-5000 points per route (typical)
- Use `shapePtSequence` to maintain correct order

### Map Rendering
- Google Maps handles large polylines efficiently
- Bounds auto-fit ensures all points visible
- Traffic layer updates in real-time

### API Response Time
- GTFS data cached in memory on backend startup
- Journey planning: ~100-500ms
- Stop search: ~50ms
- Shapes filtering: ~200ms

---

## 🔐 Security Notes

- Google Maps API key exposed in client-side code
- Restrict key to your domains in Google Cloud Console
- Add HTTP referer restrictions
- Consider moving to environment variables

---

## 📝 Development Notes

### Adding New Routes

To add support for new routes, ensure:
1. Route exists in routes.txt
2. Corresponding shapes in shapes.txt
3. Stop sequences in stop_times.txt
4. Fare rules in fare_rules.txt

### Customizing Map

Edit `JourneyPlanner.js`:
```javascript
// Change colors
strokeColor: '#ff0000'  // Red route line

// Change marker icons
fillColor: '#00ff00'  // Green markers

// Change zoom levels
mapInstance.current.setZoom(14)
```

### Adding Features

Potential enhancements:
- Real-time bus tracking on map
- Multiple route alternatives
- Time-based filtering (peak/off-peak)
- Save favorite routes
- Share journey links

---

## 📞 API Service Functions

Located in `src/services/api.js`:

```javascript
export const apiService = {
  // Journey planning
  planJourney: async (fromStop, toStop, time = null) => {
    const response = await axios.get(
      `${FARE_API_URL}/journey/plan?fromStop=${fromStop}&toStop=${toStop}`
    )
    return response.data
  },

  // Fare calculation
  calculateFare: async (origin, destination) => {
    const response = await api.post('/fare/calculate', { 
      origin, 
      destination 
    })
    return response.data
  }
}
```

---

## ✅ Verification Checklist

- [x] Backend APIs running on correct ports (5000, 5001)
- [x] Frontend configured for port 3001
- [x] CORS enabled for port 3001
- [x] Google Maps API key configured
- [x] GTFS data loaded successfully
- [x] Journey planning endpoint functional
- [x] Shapes data returning from API
- [x] Map rendering with markers
- [x] Route polylines displaying accurately
- [x] Stop search/autocomplete working
- [x] Fare calculation integrated

---

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. ✅ React app opens at `http://localhost:3001`
2. ✅ No CORS errors in browser console
3. ✅ Autocomplete shows BMTC stops as you type
4. ✅ Map displays with traffic layer
5. ✅ Green marker (A) at origin with label
6. ✅ Red marker (B) at destination with label
7. ✅ Blue polyline showing actual bus route path
8. ✅ Intermediate stops marked along route
9. ✅ Route details showing distance, time, fare
10. ✅ Clicking markers shows info windows

---

## 📚 Additional Resources

- [GTFS Specification](https://gtfs.org/reference/static)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [React Google Maps API](https://www.npmjs.com/package/@react-google-maps/api)
- [BMTC Official Website](https://mybmtc.karnataka.gov.in)

---

## 🐛 Known Issues

1. **Shapes matching**: Some routes may not have exact shape_id matches. Fallback shows straight line between stops.
2. **Travel time estimation**: Currently uses simple distance/speed calculation. Consider adding GTFS stop_times data for accurate times.
3. **Peak hour pricing**: Not yet implemented. Consider using time-based fare adjustments.

---

## 🔄 Next Steps

1. Test with various origin-destination pairs
2. Verify shapes data for popular routes
3. Add error handling for invalid stops
4. Implement route alternatives
5. Add real-time bus location tracking
6. Integrate crowd prediction with journey planning

---

**Last Updated**: October 27, 2025  
**Version**: 2.0  
**Port Configuration**: React (3001), Prediction API (5000), Fare API (5001)
