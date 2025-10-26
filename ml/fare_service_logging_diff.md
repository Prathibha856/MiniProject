# Logging Changes for fare_service.py

## Summary of Changes

This document shows all the changes that will be made to fare_service.py to implement proper logging following the same pattern as predict_api.py.

---

## Change 1: Add Imports and Logger Setup (Lines 1-16)

### BEFORE:
```python
import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import lru_cache

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Create output directory for exports
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')

# GTFS data directory
GTFS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset', 'gtfs')

print("Loading GTFS data...")
```

### AFTER:
```python
import os
import pandas as pd
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from functools import lru_cache
from pathlib import Path
from time import time

# Import logging utilities
from logger import setup_logger, log_request, log_response, log_error, log_startup

# Setup logger for fare API
logger = setup_logger('fare_api', log_file=Path(__file__).parent / 'fare_api.log')

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Create output directory for exports
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')

# GTFS data directory
GTFS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset', 'gtfs')

logger.info("Loading GTFS data...")
```

**Changes:**
- Added `g` to Flask imports for request context
- Imported `Path` and `time` for logging
- Imported all logging utilities from `logger.py`
- Created logger instance for 'fare_api' writing to 'fare_api.log'
- Changed `print()` to `logger.info()`

---

## Change 2: Update load_gtfs_data() Function (Lines 18-87)

### All print() statements replaced with logger calls:

| Line | BEFORE | AFTER | Level |
|------|--------|-------|-------|
| 24 | `print(f"GTFS directory not found: {GTFS_DIR}")` | `logger.error(f"GTFS directory not found: {GTFS_DIR}")` | ERROR |
| 30 | `print(f"Fare attributes file not found: {fare_attr_path}")` | `logger.error(f"Fare attributes file not found: {fare_attr_path}")` | ERROR |
| 37 | `print(f"Fare rules file not found: {fare_rules_path}")` | `logger.error(f"Fare rules file not found: {fare_rules_path}")` | ERROR |
| 50 | `print(f"Stops file not found: {stops_path}")` | `logger.error(f"Stops file not found: {stops_path}")` | ERROR |
| 61 | `print(f"Routes file not found: {routes_path}")` | `logger.error(f"Routes file not found: {routes_path}")` | ERROR |
| 70 | `print(f"Loaded {len(shapes_df)} shape points")` | `logger.info(f"Loaded {len(shapes_df)} shape points")` | INFO |
| 72 | `print("GTFS data loaded successfully")` | `logger.info("GTFS data loaded successfully")` | INFO |
| 73-76 | `print(f"Loaded {len(...)} ...")` × 4 | `logger.info(f"Loaded {len(...)} ...")` × 4 | INFO |
| 86 | `print(f"Error loading GTFS data: {e}")` | `log_error(logger, e, "Error loading GTFS data")` | ERROR |

---

## Change 3: Update get_route_shapes() Function (Line 118)

### BEFORE:
```python
    except Exception as e:
        print(f"Error getting route shapes: {e}")
        return []
```

### AFTER:
```python
    except Exception as e:
        log_error(logger, e, "Error getting route shapes")
        return []
```

---

## Change 4: Add Request/Response Middleware (After line 17)

### NEW CODE TO ADD:
```python
# Request timing middleware
@app.before_request
def before_request():
    """Record request start time"""
    g.start_time = time()
    log_request(logger, request.method, request.path)

@app.after_request
def after_request(response):
    """Log response details"""
    if hasattr(g, 'start_time'):
        duration_ms = (time() - g.start_time) * 1000
        log_response(logger, request.path, response.status_code, duration_ms)
    return response
```

**Purpose:** Automatically logs all requests with timing information

---

## Change 5: Update /api/fare/calculate Endpoint (Lines 343-440)

### ADD logging for fare calculations:

**After line 350 (request received):**
```python
logger.info(f"Fare calculation request: {origin} → {destination}")
```

**After line 363 (stops found):**
```python
logger.debug(f"Found stops: origin={origin_id}, destination={destination_id}")
```

**After line 366 (origin not found):**
```python
logger.warning(f"Origin stop not found: {origin}")
```

**After line 368 (destination not found):**
```python
logger.warning(f"Destination stop not found: {destination}")
```

**After line 385 (fare calculated):**
```python
logger.info(f"Calculated fare: ₹{price:.2f} (distance={distance_km:.2f}km, source={fare_info.get('source', 'gtfs')})")
```

**Error handling (line 437):**
```python
except Exception as e:
    log_error(logger, e, "Fare calculation failed")
    return jsonify({'error': str(e)}), 500
```

---

## Change 6: Update /api/journey/plan Endpoint (Lines 441-563)

### ADD logging:

**After line 446 (request received):**
```python
logger.info(f"Journey planning: {fromStop} → {toStop}")
```

**After line 460 (stops found):**
```python
logger.debug(f"Journey stops found: {origin_stop['stop_name']} → {dest_stop['stop_name']}")
```

**After line 491 (fare calculated):**
```python
logger.debug(f"Journey distance: {distance:.2f}km, estimated time: {time_minutes}min")
```

**Error handling (line 562):**
```python
except Exception as e:
    log_error(logger, e, "Journey planning failed")
    return jsonify({'error': str(e)}), 500
```

---

## Change 7: Update export_fares_to_csv() Function (Lines 565-628)

### Replace ALL print() statements:

| Line | BEFORE | AFTER |
|------|--------|-------|
| 574 | `print("Failed to load GTFS data for export")` | `logger.error("Failed to load GTFS data for export")` |
| 584 | `print(f"Exported {len(fare_attributes_df)} fare attributes")` | `logger.info(f"Exported {len(fare_attributes_df)} fare attributes")` |
| 588 | `print(f"Exported {len(fare_rules_df)} fare rules")` | `logger.info(f"Exported {len(fare_rules_df)} fare rules")` |
| 592 | `print(f"Exported {len(stops_df)} stops")` | `logger.info(f"Exported {len(stops_df)} stops")` |
| 596 | `print(f"Exported {len(routes_df)} routes")` | `logger.info(f"Exported {len(routes_df)} routes")` |
| 606 | `print(f"Exported merged fare analysis with {len(merged_fares)} rows")` | `logger.info(f"Exported merged fare analysis with {len(merged_fares)} rows")` |
| 609-610 | `print("\\nFare Price Distribution:")` + `print(...)` | `logger.info("Fare Price Distribution:")` + `logger.info(str(...))` |
| 614-615 | `print("\\nMost Common Routes:")` + `print(...)` | `logger.info("Most Common Routes:")` + `logger.info(str(...))` |
| 619 | `print("\\nSample Zone-Based Fares:")` | `logger.info("Sample Zone-Based Fares:")` |
| 626 | `print(zone_fares.head(10))` | `logger.info(str(zone_fares.head(10)))` |

---

## Change 8: Update export_fares_endpoint() (Lines 630-650)

### ADD error logging:

**Line 646 (exception handling):**
```python
except Exception as e:
    log_error(logger, e, "Fare export failed")
    return jsonify({
        'status': 'error',
        'message': f'Error exporting GTFS fare data: {str(e)}'
    }), 500
```

---

## Change 9: Update main block (Lines 652-661)

### BEFORE:
```python
if __name__ == '__main__':
    # Load data on startup
    data = load_gtfs_data()
    
    # Export fare data to CSV for analysis
    print("\\nExporting GTFS fare data to CSV...")
    export_fares_to_csv()
    
    print("\\nStarting BMTC Fare Service on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
```

### AFTER:
```python
if __name__ == '__main__':
    # Load data on startup
    data = load_gtfs_data()
    
    # Export fare data to CSV for analysis
    logger.info("Exporting GTFS fare data to CSV...")
    export_fares_to_csv()
    
    # Log startup information
    log_startup(
        logger,
        'BMTC Fare Service',
        '0.0.0.0',
        5001,
        gtfs_loaded=data is not None,
        stops=len(data['stops']) if data else 0,
        routes=len(data['routes']) if data else 0,
        fare_rules=len(data['fare_rules']) if data else 0
    )
    
    try:
        app.run(host='0.0.0.0', port=5001, debug=True)
    except KeyboardInterrupt:
        logger.info("Server shutdown requested by user")
    except Exception as e:
        log_error(logger, e, "Server crashed unexpectedly")
        raise
    finally:
        logger.info("BMTC Fare Service - Stopped")
```

---

## Summary of Changes

### Statistics:
- **Total print() statements replaced:** ~30
- **New logging imports:** 5
- **New middleware functions:** 2
- **Log levels used:**
  - ERROR: 7 occurrences (file not found, load failures)
  - WARNING: 2 occurrences (stop not found)
  - INFO: 20+ occurrences (successful operations, data loaded)
  - DEBUG: 4 occurrences (detailed operation info)

### Log File Output:
All logs will be written to: **fare_api.log**

### Example Log Output:
```
2025-10-26 21:30:10 - fare_api - INFO - Loading GTFS data...
2025-10-26 21:30:12 - fare_api - INFO - Loaded 1905101 shape points
2025-10-26 21:30:12 - fare_api - INFO - GTFS data loaded successfully
2025-10-26 21:30:12 - fare_api - INFO - Loaded 185 fare attributes
2025-10-26 21:30:12 - fare_api - INFO - Loaded 1364815 fare rules
2025-10-26 21:30:12 - fare_api - INFO - Loaded 9360 stops
2025-10-26 21:30:12 - fare_api - INFO - Loaded 4190 routes
2025-10-26 21:30:12 - fare_api - INFO - ============================================================
2025-10-26 21:30:12 - fare_api - INFO - BMTC Fare Service - Starting
2025-10-26 21:30:12 - fare_api - INFO - ============================================================
2025-10-26 21:30:25 - fare_api - INFO - Request: POST /api/fare/calculate
2025-10-26 21:30:25 - fare_api - INFO - Fare calculation request: Majestic → Electronic City
2025-10-26 21:30:25 - fare_api - INFO - Calculated fare: ₹25.00 (distance=18.50km, source=distance_calculation)
2025-10-26 21:30:25 - fare_api - INFO - Response: /api/fare/calculate | Status=200 | Duration=125.45ms
```

---

## Benefits

1. **Consistent Logging Pattern** - Matches predict_api.py exactly
2. **Automatic Request Tracking** - All API calls logged with timing
3. **Separate Log Files** - fare_api.log separate from predict_api.log
4. **Contextual Information** - Logs include origin, destination, fare, distance
5. **Production Ready** - Rotating logs, proper error handling
6. **Easy Debugging** - Full stack traces on errors

---

## Ready to Apply?

All changes shown above will be applied to fare_service.py when you approve.

The changes are:
- Non-breaking (existing functionality unchanged)
- Following the exact pattern from predict_api.py
- Production-ready with proper log levels
- Include detailed context for debugging

Type "yes" or "apply" to proceed with these changes.
