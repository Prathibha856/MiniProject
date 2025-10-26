# Logging Implementation Summary

## Completed: predict_api.py ✅

### Changes Made:
1. **Replaced all print() statements with proper logging**
2. **Added logger setup** at module level
3. **Implemented request/response logging middleware**
4. **Added context-aware logging** for all operations

### Logger Features:
- **File Handler**: Writes to `predict_api.log` with rotation (10MB, 5 backups)
- **Console Handler**: INFO level and above to stdout
- **Detailed Format**: Includes timestamp, level, filename, line number
- **Request Tracking**: Automatic timing and status logging

### Key Improvements:
```python
# Before
print("✓ Model loaded from {MODEL_PATH}")
print(f"Error: {e}")

# After
logger.info(f"Model loaded successfully from {MODEL_PATH}")
log_error(logger, e, "Failed to load model")
```

### Log Levels Used:
- **DEBUG**: Request data, processed features, batch items
- **INFO**: Model loaded, predictions, batch completions, startup
- **WARNING**: Feature info not found, model info requested when not loaded
- **ERROR**: Model not found, prediction failures, model load errors

---

## To Do: fare_service.py ⚠️

The fare_service.py file needs similar logging updates. Here's what needs to be changed:

### 1. Add Logger Setup (Lines 1-16)
```python
# Add after imports
from logger import setup_logger, log_request, log_response, log_error, log_startup
from flask import g
from time import time

# Setup logger
logger = setup_logger('fare_api', log_file=Path(__file__).parent / 'fare_api.log')

# Replace line 16
# Before: print("Loading GTFS data...")
# After: logger.info("Loading GTFS data...")
```

### 2. Update load_gtfs_data() Function (Lines 18-87)
Replace all print() statements:
```python
# Line 24: print(f"GTFS directory not found: {GTFS_DIR}")
logger.error(f"GTFS directory not found: {GTFS_DIR}")

# Line 30: print(f"Fare attributes file not found: {fare_attr_path}")
logger.error(f"Fare attributes file not found: {fare_attr_path}")

# Line 37: print(f"Fare rules file not found: {fare_rules_path}")
logger.error(f"Fare rules file not found: {fare_rules_path}")

# Line 50: print(f"Stops file not found: {stops_path}")
logger.error(f"Stops file not found: {stops_path}")

# Line 61: print(f"Routes file not found: {routes_path}")
logger.error(f"Routes file not found: {routes_path}")

# Line 70: print(f"Loaded {len(shapes_df)} shape points")
logger.info(f"Loaded {len(shapes_df)} shape points")

# Lines 72-76: Summary logging
logger.info("GTFS data loaded successfully")
logger.info(f"Loaded {len(fare_attr_df)} fare attributes")
logger.info(f"Loaded {len(fare_rules_df)} fare rules")
logger.info(f"Loaded {len(stops_df)} stops")
logger.info(f"Loaded {len(routes_df)} routes")

# Line 86: print(f"Error loading GTFS data: {e}")
log_error(logger, e, "Error loading GTFS data")
```

### 3. Update get_route_shapes() (Line 118)
```python
# Before: print(f"Error getting route shapes: {e}")
# After: log_error(logger, e, "Error getting route shapes")
```

### 4. Add Request/Response Middleware
Add after app initialization:
```python
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

### 5. Update API Endpoints
All print() statements in endpoints should be replaced:

**@app.route('/api/fare/calculate')** - Add logging for:
- Request received with origin/destination
- Stop lookup results
- Fare calculation results
- Errors

Example:
```python
logger.info(f"Fare calculation: {origin} → {destination}")
logger.debug(f"Found stops: origin_id={origin_id}, dest_id={destination_id}")
logger.info(f"Calculated fare: ₹{fare} ({source})")
log_error(logger, e, "Fare calculation failed")
```

**@app.route('/api/journey/plan')** - Add logging for:
- Journey planning requests
- Route found
- Distance/time calculations

**export_fares_to_csv()** - Replace all print():
```python
# Before: print(f"Exported {len(fare_attributes_df)} fare attributes")
# After: logger.info(f"Exported {len(fare_attributes_df)} fare attributes")
```

### 6. Update Main Block (Lines 652-661)
```python
if __name__ == '__main__':
    # Load data on startup
    data = load_gtfs_data()
    
    # Export fare data to CSV for analysis
    logger.info("Exporting GTFS fare data to CSV...")
    export_fares_to_csv()
    
    # Log startup
    log_startup(
        logger,
        'BMTC Fare Service',
        '0.0.0.0',
        5001,
        gtfs_loaded=data is not None,
        stops=len(data['stops']) if data else 0,
        routes=len(data['routes']) if data else 0
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

## Log File Outputs

After implementation, you'll have two separate log files:

### predict_api.log
```
2025-10-26 15:30:15 - INFO - Model loaded successfully from F:\MiniProject\ml\models\crowd_prediction_model.pkl
2025-10-26 15:30:15 - INFO - Feature info loaded successfully
2025-10-26 15:30:15 - INFO - ============================================================
2025-10-26 15:30:15 - INFO - Bus Crowd Prediction API - Starting
2025-10-26 15:30:15 - INFO - ============================================================
2025-10-26 15:30:15 - INFO - Host: 0.0.0.0
2025-10-26 15:30:15 - INFO - Port: 5000
2025-10-26 15:30:15 - INFO - Model Loaded: True
2025-10-26 15:30:20 - INFO - Request: POST /predict
2025-10-26 15:30:20 - INFO - Prediction: Very High (code=3, confidence=0.60)
2025-10-26 15:30:20 - INFO - Response: /predict | Status=200 | Duration=45.23ms
```

### fare_api.log
```
2025-10-26 15:30:10 - INFO - Loading GTFS data...
2025-10-26 15:30:12 - INFO - Loaded 1905101 shape points
2025-10-26 15:30:12 - INFO - GTFS data loaded successfully
2025-10-26 15:30:12 - INFO - Loaded 185 fare attributes
2025-10-26 15:30:12 - INFO - Loaded 1364815 fare rules
2025-10-26 15:30:12 - INFO - Loaded 9360 stops
2025-10-26 15:30:12 - INFO - Loaded 4190 routes
2025-10-26 15:30:12 - INFO - ============================================================
2025-10-26 15:30:12 - INFO - BMTC Fare Service - Starting
2025-10-26 15:30:12 - INFO - ============================================================
2025-10-26 15:30:25 - INFO - Request: POST /api/fare/calculate
2025-10-26 15:30:25 - INFO - Fare calculation: Majestic → Electronic City
2025-10-26 15:30:25 - INFO - Calculated fare: ₹25.0 (distance_calculation)
2025-10-26 15:30:25 - INFO - Response: /api/fare/calculate | Status=200 | Duration=125.45ms
```

---

## Benefits of This Implementation

### 1. **Separate Log Files**
- `predict_api.log` - Only prediction service logs
- `fare_api.log` - Only fare service logs
- Easy to troubleshoot specific service issues

### 2. **Log Rotation**
- Automatic rotation when files reach 10MB
- Keeps last 5 backup files
- Prevents disk space issues

### 3. **Structured Logging**
- Consistent format across all logs
- Includes timestamps, levels, file/line numbers
- Easy to parse with log analysis tools

### 4. **Performance Tracking**
- Automatic request/response timing
- Identifies slow endpoints
- Helps optimize bottlenecks

### 5. **Error Debugging**
- Full stack traces for exceptions
- Context about where errors occurred
- exc_info=True includes full traceback

### 6. **Production Ready**
- Can adjust log levels via environment variables
- File logging for persistence
- Console logging for development

---

## How to Use

### View Logs in Real-time
```bash
# Windows PowerShell
Get-Content F:\MiniProject\ml\predict_api.log -Wait -Tail 50

# Or use tail
tail -f F:\MiniProject\ml\predict_api.log
```

### Search Logs
```bash
# Find all errors
Select-String -Path "predict_api.log" -Pattern "ERROR"

# Find specific requests
Select-String -Path "fare_api.log" -Pattern "Majestic"
```

### Change Log Level
```python
# In code
logger.setLevel(logging.DEBUG)  # More verbose
logger.setLevel(logging.WARNING)  # Less verbose

# Or via environment variable
export LOG_LEVEL=DEBUG  # Linux/Mac
$env:LOG_LEVEL="DEBUG"  # PowerShell
```

---

## Testing the Logging

### 1. Start the APIs
```bash
python predict_api.py
python fare_service.py
```

### 2. Make Test Requests
```bash
# Test prediction API
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"stop_lat": 12.9716, "stop_lon": 77.5946, "time": "08:30", "day_of_week": 1}'

# Test fare API
curl -X POST http://localhost:5001/api/fare/calculate \
  -H "Content-Type: application/json" \
  -d '{"origin": "Majestic", "destination": "Electronic City"}'
```

### 3. Check Log Files
```bash
# View prediction logs
cat predict_api.log

# View fare logs
cat fare_api.log
```

---

## Next Steps

1. ✅ **predict_api.py** - Logging implemented
2. ⚠️ **fare_service.py** - Needs logging updates (follow guide above)
3. 📝 **train_model_v3.py** - Consider adding training logs
4. 🔄 **Update .gitignore** - Add `*.log` to ignore log files

---

## Summary

The logging infrastructure is now in place with:
- ✅ Centralized logger utility (`logger.py`)
- ✅ Configuration support (`config.py`)
- ✅ Rotating file handlers
- ✅ Request/response middleware
- ✅ Error tracking with context
- ✅ Performance monitoring
- ✅ predict_api.py fully implemented

Apply the same pattern to fare_service.py to complete the logging implementation!
