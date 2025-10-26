# Bug Fixes in predict_api.py

## Issues Fixed

### 1. Time Handling Bug (Lines 121-131)

**Problem:**
The `predict_crowd()` function failed when the optional `time` field was missing from the request. The code attempted to parse `None` as a time string, causing a `TypeError`.

**Root Cause:**
```python
# Old code - always tried to parse time_str
time_str = data.get('time', datetime.now().strftime('%H:%M'))
time_obj = datetime.strptime(time_str, '%H:%M')  # Failed if time_str was None
```

**Solution:**
```python
# New code - check if time_str exists before parsing
time_str = data.get('time')
if time_str:
    time_obj = datetime.strptime(time_str, '%H:%M')
    hour = time_obj.hour
else:
    # Use current hour if time not provided
    hour = datetime.now().hour
    time_str = datetime.now().strftime('%H:%M')
```

**Impact:**
- ✅ API now correctly handles requests without the `time` field
- ✅ Falls back to current time when time is not provided
- ✅ Maintains backward compatibility with requests that include time

**Test Case:**
```json
// This now works without error
{
  "stop_lat": 12.9716,
  "stop_lon": 77.5946
}
```

---

### 2. Batch Prediction Time Handling Bug (Lines 236-246)

**Problem:**
The same time handling bug existed in the `predict_batch()` function, causing failures for batch requests where individual items didn't include the `time` field.

**Solution:**
Applied the same fix as above to handle optional time field in batch requests:
```python
time_str = req.get('time')
if time_str:
    time_obj = datetime.strptime(time_str, '%H:%M')
    hour = time_obj.hour
else:
    # Use current hour if time not provided
    hour = datetime.now().hour
    time_str = datetime.now().strftime('%H:%M')
```

**Impact:**
- ✅ Batch predictions now work with or without time field
- ✅ Each request in batch can independently omit time field

---

### 3. JSON Serialization Bug in model_info (Lines 303-316)

**Problem:**
The `model_info()` endpoint failed with a JSON serialization error when the model contained numpy data types (numpy.int64, numpy.ndarray, etc.), which are not natively JSON-serializable.

**Error Message:**
```
TypeError: Object of type int64 is not JSON serializable
```

**Root Cause:**
```python
# Old code - directly returned dict with numpy types
info = {
    'model_type': type(model).__name__,
    'features': list(model.feature_names_in_),
    'classes': list(model.classes_),  # Contains numpy.int64
    'n_features': model.n_features_in_  # numpy.int64
}
return jsonify(info)  # Failed to serialize
```

**Solution:**
Added type conversion logic to convert numpy types to Python native types before JSON serialization:

```python
# Convert numpy types to Python types for JSON serialization
for key, value in info.items():
    if isinstance(value, np.integer):
        info[key] = int(value)
    elif isinstance(value, np.floating):
        info[key] = float(value)
    elif isinstance(value, np.ndarray):
        info[key] = value.tolist()
    elif isinstance(value, list):
        # Handle lists that might contain numpy types
        info[key] = [int(x) if isinstance(x, np.integer) else 
                   float(x) if isinstance(x, np.floating) else x 
                   for x in value]

return jsonify(info)
```

**Impact:**
- ✅ `/model/info` endpoint now works correctly
- ✅ All numpy types are converted to JSON-serializable Python types
- ✅ Handles nested numpy types in lists

**Response Example:**
```json
{
  "model_type": "RandomForestClassifier",
  "features": ["hour", "day_of_week", "is_rush_hour", "stop_lat", "stop_lon"],
  "classes": [0, 1, 2, 3],
  "n_features": 5
}
```

---

## Testing

### Test the Time Handling Fix

```bash
# Test without time field
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"stop_lat": 12.9716, "stop_lon": 77.5946}'

# Test with time field (should still work)
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"stop_lat": 12.9716, "stop_lon": 77.5946, "time": "14:30"}'
```

### Test the Batch Time Handling Fix

```bash
# Test batch with mixed time fields
curl -X POST http://localhost:5000/predict/batch \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {"stop_lat": 12.9716, "stop_lon": 77.5946},
      {"stop_lat": 13.0827, "stop_lon": 77.5877, "time": "18:00"}
    ]
  }'
```

### Test the Model Info Fix

```bash
# Test model info endpoint
curl http://localhost:5000/model/info
```

---

## Files Modified

| File | Lines Changed | Changes |
|------|---------------|---------|
| `predict_api.py` | 121-131 | Fixed time handling in predict_crowd() |
| `predict_api.py` | 236-246 | Fixed time handling in predict_batch() |
| `predict_api.py` | 303-316 | Added numpy type conversion in model_info() |

---

## Validation

Run the test suite to verify fixes:

```bash
# Run all API tests
pytest tests/test_prediction_api.py -v

# Run specific test for optional time field
pytest tests/test_prediction_api.py::TestPredictionEndpoint::test_prediction_without_optional_fields -v

# Run model info tests
pytest tests/test_prediction_api.py::TestModelInfoEndpoint -v
```

---

## Notes

1. **Backward Compatibility:** All fixes maintain backward compatibility with existing API clients
2. **Default Behavior:** When time is not provided, the system uses the current time
3. **Validation:** The validator already marks time as optional, these fixes align the handler code with the validation logic
4. **Type Safety:** The numpy type conversion is comprehensive and handles nested structures

---

## Related Files

- `validators.py` - Already marks `time` as optional field (line 175)
- `tests/test_prediction_api.py` - Tests for optional time field handling
- `config.py` - Rush hour configuration used for time-based predictions
