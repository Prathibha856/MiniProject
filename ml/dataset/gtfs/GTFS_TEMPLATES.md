# GTFS File Templates

Your current GTFS files need these structures:

## ✅ Already Have (Correct)
- **agency.txt** ✓
- **stops.txt** ✓
- **routes.txt** ✓

## ❌ Missing or Incorrect

### trips.txt (REQUIRED)
Links routes to specific trips and calendars.

**Required columns:**
```csv
route_id,service_id,trip_id,trip_headsign,direction_id,shape_id
Vivek_Test14,weekday,trip_001,10th Cross Magadi Road,0,
Vivek_Test14,weekday,trip_002,10th Cross Lingadhiranahalli,1,
215-NE ANP11-KMT-VSD,weekday,trip_003,Vidhana Soudha,0,
```

**Explanation:**
- `route_id` - Must match route_id from routes.txt
- `service_id` - Links to calendar.txt (e.g., weekday, weekend, daily)
- `trip_id` - Unique identifier for each trip
- `trip_headsign` - Destination shown on bus
- `direction_id` - 0 or 1 (outbound/inbound)

### stop_times.txt (REQUIRED - Currently has wrong data)
Defines stop sequences and arrival/departure times for each trip.

**Required columns:**
```csv
trip_id,arrival_time,departure_time,stop_id,stop_sequence
trip_001,06:00:00,06:00:00,stop_001,1
trip_001,06:15:00,06:16:00,stop_002,2
trip_001,06:30:00,06:30:00,stop_003,3
trip_002,07:00:00,07:00:00,stop_003,1
trip_002,07:15:00,07:16:00,stop_002,2
```

**Explanation:**
- `trip_id` - Must match trip_id from trips.txt
- `arrival_time` - Time bus arrives at stop (HH:MM:SS format, 24-hour)
- `departure_time` - Time bus leaves stop
- `stop_id` - Must match stop_id from stops.txt
- `stop_sequence` - Order of stops (1, 2, 3...)

### calendar.txt (OPTIONAL but recommended)
Defines which days services run.

**Required columns:**
```csv
service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date
weekday,1,1,1,1,1,0,0,20250101,20251231
weekend,0,0,0,0,0,1,1,20250101,20251231
daily,1,1,1,1,1,1,1,20250101,20251231
```

**Explanation:**
- `service_id` - Unique service identifier (used in trips.txt)
- `monday-sunday` - 1 if service runs that day, 0 if not
- `start_date` - YYYYMMDD format
- `end_date` - YYYYMMDD format

## Quick Fix Options

### Option 1: Add Minimal Data (Fastest)
If you don't have trip schedule data yet:

1. **Create basic trips.txt** - Generate one trip per route
2. **Create basic calendar.txt** - Set all services to run daily
3. **Fix stop_times.txt** - Add placeholder times

### Option 2: Run with Current Data (Limited)
The updated preprocessing script can now work with just stops + routes:
```bash
python preprocess_gtfs.py
```
This will create a basic dataset, but won't have trip timing information.

### Option 3: Get Real GTFS Data
Download complete GTFS data from BMTC or generate from your actual bus schedule data.

## Sample Generator Scripts

Want to auto-generate sample data? Create these files and I can help populate them with realistic test data.
