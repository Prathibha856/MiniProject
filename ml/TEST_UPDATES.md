# Test Suite Updates - Real Flask App Testing

## Changes Made

### Problem
Initial tests showed 0% coverage for `predict_api.py` and `fare_service.py` because the fixtures were mocking too much and not actually exercising the real Flask application code.

### Solution
Updated all test files to properly import and test the actual Flask applications while still using mocks for external dependencies (ML model and GTFS data).

## Updated Files

### 1. `tests/conftest.py`
**Changes:**
- Updated `prediction_client` fixture to properly import `predict_api` module after patching
- Updated `fare_client` fixture to properly import `fare_service` module after patching
- Added `cache_clear()` call for fare_service to ensure mocked GTFS data is used
- Maintained mocking of model and GTFS data for controlled testing

**Key improvements:**
```python
# Before (didn't test real app):
from predict_api import app

# After (tests real app with mocked dependencies):
import predict_api
predict_api.app.config['TESTING'] = True
with predict_api.app.test_client() as client:
    yield client
```

### 2. `tests/test_prediction_api.py` (Completely Rewritten)
**New structure:**
- **5 test classes**, **20+ tests**
- Tests real Flask routes and handlers
- Verifies actual response structures
- Tests error handling in real app
- Covers edge cases with real validation

**Test classes:**
1. `TestPredictionAPIHealth` - Health check endpoint (2 tests)
2. `TestPredictionEndpoint` - /predict endpoint (7 tests)
3. `TestBatchPredictionEndpoint` - /predict/batch endpoint (6 tests)
4. `TestModelInfoEndpoint` - /model/info endpoint (2 tests)
5. `TestPredictionAPIEdgeCases` - Edge cases (3 tests)

**Coverage areas:**
- ✅ GET /health with and without model
- ✅ POST /predict with valid/invalid inputs
- ✅ POST /predict/batch with various scenarios
- ✅ GET /model/info with and without model
- ✅ Validation error handling (400 responses)
- ✅ Model missing scenarios (500 responses)
- ✅ Boundary coordinates
- ✅ Rush hour detection
- ✅ Type coercion (string to float)

### 3. `tests/test_fare_api.py` (Completely Rewritten)
**New structure:**
- **5 test classes**, **25+ tests**
- Tests real Flask routes with mocked GTFS data
- Verifies complete response structures
- Tests all endpoints and alternate endpoints
- Comprehensive edge case testing

**Test classes:**
1. `TestFareAPIHealth` - Health check endpoints (2 tests)
2. `TestStopsEndpoint` - Stops listing and search (6 tests)
3. `TestCalculateFareEndpoint` - Fare calculation (7 tests)
4. `TestJourneyPlanEndpoint` - Journey planning (4 tests)
5. `TestFareAPIEdgeCases` - Edge cases (4 tests)
6. `TestFareAPIWithMockedData` - GTFS data handling (2 tests)

**Coverage areas:**
- ✅ GET /api/health and /api/fare/health
- ✅ GET /api/stops - List all stops
- ✅ GET /api/stops/search - Search with various queries
- ✅ POST /api/calculate_fare - All scenarios
- ✅ GET /api/journey/plan - Journey planning
- ✅ Validation errors (400 responses)
- ✅ Missing stops (404 responses)
- ✅ Case-insensitive search
- ✅ Whitespace handling
- ✅ GTFS data loading verification

## How It Works

### Mocking Strategy

**For Prediction API:**
```python
@pytest.fixture
def prediction_client(mock_model, mock_feature_info):
    # Mock ML model BEFORE importing app
    with patch('predict_api.model', mock_model), \
         patch('predict_api.feature_columns', ...):
        
        # NOW import and use real app
        import predict_api
        predict_api.app.config['TESTING'] = True
        
        with predict_api.app.test_client() as client:
            yield client  # Tests use real Flask app!
```

**For Fare API:**
```python
@pytest.fixture
def fare_client(mock_gtfs_data):
    # Mock GTFS data loading function
    with patch('fare_service.load_gtfs_data', return_value=mock_gtfs_data):
        import fare_service
        
        # Clear LRU cache to use our mock
        fare_service.load_gtfs_data.cache_clear()
        
        fare_service.app.config['TESTING'] = True
        
        with fare_service.app.test_client() as client:
            yield client  # Tests use real Flask app!
```

## Benefits

1. **Real Coverage**: Tests now actually exercise the Flask application code
2. **Controlled Testing**: External dependencies (model, GTFS) are mocked for consistency
3. **Integration Testing**: Tests verify real request→validation→handler→response flow
4. **Error Path Coverage**: Tests actual error handling in route handlers
5. **Response Validation**: Verifies real JSON responses from actual endpoints

## Running Tests

```bash
# Run all tests with coverage
pytest --cov=. --cov-report=html --cov-report=term-missing

# Run only API tests
pytest -m api

# Run only prediction API tests
pytest -m prediction tests/test_prediction_api.py

# Run only fare API tests  
pytest -m fare tests/test_fare_api.py

# View coverage report
start htmlcov/index.html
```

## Expected Coverage

With these updates, you should see:

- **predict_api.py**: 70-80% coverage (routes, handlers, validation)
- **fare_service.py**: 70-80% coverage (routes, handlers, GTFS loading)
- **validators.py**: 85-90% coverage (all validation functions)
- **config.py**: 80-85% coverage (configuration management)

**Overall target**: 75-80% code coverage

## Test Statistics

| Module | Test Classes | Tests | Coverage Target |
|--------|-------------|-------|-----------------|
| test_prediction_api.py | 5 | 20+ | 75%+ |
| test_fare_api.py | 5 | 25+ | 75%+ |
| test_validators.py | 6 | 45+ | 90%+ |
| test_config.py | 5 | 67+ | 85%+ |
| **Total** | **21** | **157+** | **80%+** |

## Next Steps

1. Run the full test suite: `pytest -v`
2. Check coverage: `pytest --cov=. --cov-report=html`
3. Review coverage report: Open `htmlcov/index.html`
4. Add more tests for uncovered edge cases if needed

## Notes

- Tests use **real Flask test clients** for authentic integration testing
- **Mocks are minimal**: Only ML model and GTFS data are mocked
- All **validators, route handlers, and business logic** are tested with real code
- Tests verify **actual HTTP responses** and **JSON structures**
- **Error scenarios** are tested with real error handlers
