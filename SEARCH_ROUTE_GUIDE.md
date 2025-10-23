# Search by Route - Complete Guide

## 🚀 How to Start the Application

### Step 1: Install Dependencies (if not already done)
```bash
npm install
```

### Step 2: Start the Application
```bash
npm start
```
**Note:** Use `npm start`, NOT `np start`

The app will open in your browser at `http://localhost:3000`

---

## ✨ Features Implemented

### 1. **Search by Route Number/Name**
- Enter any route number (e.g., 335E, 500D, 201) or route name
- Get instant suggestions as you type
- Search by origin or destination station
- Click on any suggestion to view full details

### 2. **Filter by Service Type**
- Click the **"Filters"** button in the search panel
- Select service type from dropdown:
  - **All Types** (default)
  - **Ordinary**
  - **AC**
  - **Volvo**
  - **Vayu Vajra**
- Click **"Apply"** to filter routes
- Click **"Clear Filters"** to reset

### 3. **Favorites System**
- Click the **star icon** (⭐) next to route details to add to favorites
- Click again to remove from favorites
- Favorites are saved in local storage (persist across sessions)
- View all favorites in the **"My Favorites"** section when no route is selected
- Click any favorite to quickly load that route

### 4. **Route Details View**
Shows comprehensive information:
- Route number and name
- Origin and destination
- Total distance
- Bus frequency
- Operating hours
- **Service type** (displayed as badge)
- Complete list of stops along the route

### 5. **Running Buses Display**
- View all buses currently running on the selected route
- Real-time information for each bus:
  - Bus ID/Registration number
  - Current speed
  - Next stop
  - Estimated time of arrival (ETA)
  - Direction of travel
- **Auto-refresh every 10 seconds** (toggle on/off)

### 6. **Google Maps Integration**

#### Map View Features:
- Switch between **List View** and **Map View**
- Real-time bus markers on Google Maps
- Click any marker to see bus details
- Route path visualization (blue line)
- Auto-zoom to fit all running buses
- Interactive map controls (zoom, satellite/map view, fullscreen)
- Map legend showing marker meanings

#### Marker Information:
- **Red circles with numbers** = Running buses (numbered 1, 2, 3...)
- **Blue line** = Route path
- Click markers for detailed popup with:
  - Bus ID
  - Route number
  - Speed
  - Next stop
  - ETA
  - Direction

---

## 🎯 Usage Flow

### Basic Workflow:
1. **Home Screen** → Click **"Search by Route"**
2. **Search** → Enter route number (e.g., "335E")
3. **Select** → Click on route from suggestions
4. **View Details** → See complete route information
5. **Add to Favorites** → Click star icon
6. **View Buses** → See all running buses in sidebar
7. **Toggle View** → Switch to Map View to see buses on Google Maps
8. **Filter** → Click Filters button to filter by service type

### With Filters:
1. Click **"Filters"** button
2. Select **Service Type** (e.g., AC buses only)
3. Click **"Apply"**
4. View filtered routes matching your criteria
5. Clear filters anytime with **"Clear Filters"**

### With Favorites:
1. Select any route
2. Click the **star icon** (turns orange when favorited)
3. Go back (clear search) to see favorites list
4. Click any favorite for quick access

---

## 🗺️ Google Maps Setup

Your Google Maps API is already configured in:
- **File:** `public/index.html`
- **API Key:** Already included
- **Libraries:** `places, geometry` enabled

### Current API Key:
```javascript
AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg
```

### To Use Your Own API Key:
1. Get a free API key from: https://console.cloud.google.com/google/maps-apis
2. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geometry API
3. Replace the key in `public/index.html`:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry"></script>
```

---

## 📊 Demo Data Available

### Routes:
1. **335E** - Majestic to Whitefield (Ordinary)
2. **500D** - Shivaji Nagar to Electronic City (AC)
3. **201** - KR Puram to Hebbal (Ordinary)
4. **356** - Banashankari to Koramangala (Volvo)
5. **G4** - Yeshwanthpur to Electronic City (AC Express)
6. **KBS-1** - KBS to Whitefield (Vayu Vajra)

### Each route includes:
- 5-6 stops along the route
- Running buses with real GPS coordinates
- Service type classification
- Operating hours and frequency

---

## 🔧 Backend Integration

### API Endpoints Used:
```javascript
// Get all routes
GET /api/routes

// Get specific route details
GET /api/routes/{routeNumber}

// Get running buses on route
GET /api/routes/{routeNumber}/buses
```

### Expected Response Format:

#### Route Object:
```json
{
  "routeNumber": "335E",
  "routeName": "Majestic - Whitefield",
  "origin": "Majestic",
  "destination": "Whitefield",
  "distance": "28 km",
  "frequency": "15-20 mins",
  "operatingHours": "6:00 AM - 11:00 PM",
  "serviceType": "Ordinary",
  "stops": ["Majestic", "Shivaji Nagar", "MG Road", "Indiranagar", "Marathahalli", "Whitefield"]
}
```

#### Bus Object:
```json
{
  "busId": "KA-01-AB-1234",
  "lat": 12.9716,
  "lng": 77.5946,
  "speed": 35,
  "nextStop": "Indiranagar",
  "eta": "5 mins",
  "direction": "Whitefield"
}
```

---

## 💾 Local Storage

The app saves these to local storage:
- **Favorite Routes:** `bmtc_favorite_routes`

Data persists across browser sessions.

---

## 🎨 UI Features

- Modern, responsive design
- BMTC red/orange color theme
- Smooth animations and transitions
- Mobile-friendly layout
- Real-time updates with visual feedback
- Loading states and error handling
- Empty states with helpful messages

---

## 📱 Responsive Design

Works perfectly on:
- Desktop (1200px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

---

## 🔍 Search Capabilities

Search works with:
- Route numbers (exact or partial)
- Route names
- Origin stations
- Destination stations
- Case-insensitive matching

Example searches that work:
- "335" → finds 335E
- "whitefield" → finds routes to Whitefield
- "majestic" → finds routes from/to Majestic
- "ac" → finds AC routes (when combined with filters)

---

## 🚦 Real-Time Updates

- Auto-refresh every 10 seconds (when enabled)
- Updates bus positions on map
- Updates bus details in sidebar
- Toggle on/off with checkbox
- Manual refresh button in header

---

## 🎯 Best Practices

1. **Enable auto-refresh** for real-time tracking
2. **Use filters** to narrow down route selection
3. **Save favorites** for quick access to frequent routes
4. **Use map view** for visual understanding of bus locations
5. **Click markers** for detailed bus information

---

## 🐛 Troubleshooting

### Map not showing?
- Check internet connection
- Verify Google Maps API key is valid
- Check browser console for errors

### No routes found?
- Try a different search term
- Clear any active filters
- Check if backend is running

### Favorites not saving?
- Check browser local storage is enabled
- Try a different browser
- Clear browser cache and retry

---

## 📞 Support

For issues or questions about the implementation, check:
- Browser console for error messages
- Network tab for API call failures
- React DevTools for component state

---

## ✅ Checklist

- [x] Route search functionality
- [x] Service type filters
- [x] Favorites system with local storage
- [x] Route details display
- [x] Running buses list
- [x] Google Maps integration
- [x] Real-time updates (10s interval)
- [x] List and Map view toggle
- [x] Interactive markers with info windows
- [x] Route path visualization
- [x] Responsive design
- [x] Multi-language support
- [x] Demo data fallback

---

## 🎉 You're All Set!

Run `npm start` and enjoy exploring the Search by Route feature!
