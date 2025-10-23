# 🚀 Quick Start Guide

## Start the Application

```bash
npm start
```

**Important:** Use `npm start`, NOT `np start`

---

## Search by Route - Features

### ✅ What You Can Do:

1. **Search Routes**
   - Type route number (335E, 500D, etc.)
   - Search by station name
   - Get instant suggestions

2. **Filter by Service Type**
   - Click "Filters" button
   - Select: All/Ordinary/AC/Volvo/Vayu Vajra
   - Click "Apply"

3. **Add to Favorites**
   - Click ⭐ star icon on route details
   - Access favorites from home screen
   - Quick access to your routes

4. **View Running Buses**
   - See all buses on selected route
   - Real-time speed, location, ETA
   - Auto-refresh every 10 seconds

5. **Google Maps View**
   - Toggle "Map View" button
   - See buses on live map
   - Click markers for details
   - Route path visualization

---

## Demo Routes Available:

- **335E** - Majestic to Whitefield (Ordinary)
- **500D** - Shivaji Nagar to Electronic City (AC)
- **201** - KR Puram to Hebbal (Ordinary)
- **356** - Banashankari to Koramangala (Volvo)
- **G4** - Yeshwanthpur to Electronic City (AC)
- **KBS-1** - KBS to Whitefield (Vayu Vajra)

---

## Google Maps API

Your API is configured and ready to use!

**Key:** AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg

To use your own key:
1. Get free key: https://console.cloud.google.com/google/maps-apis
2. Replace in `public/index.html`

---

## Files Modified:

✅ `src/components/SearchRoute.js` - Complete feature
✅ `src/styles/search-route.css` - All styling
✅ `src/services/api.js` - API methods added
✅ `public/index.html` - Google Maps libraries

---

## Need Help?

See **SEARCH_ROUTE_GUIDE.md** for detailed documentation!
