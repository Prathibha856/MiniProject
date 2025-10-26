# BMTC Bus Crowd Prediction - Testing Guide

## Overview

Comprehensive pytest test suite with 80%+ code coverage for the BMTC Bus Crowd Prediction System.

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `pytest>=7.4.0` - Testing framework
- `pytest-cov>=4.1.0` - Coverage reporting
- `pytest-mock>=3.11.1` - Mocking utilities

### 2. Run All Tests

```bash
# Simple run
pytest

# With coverage report
pytest --cov=. --cov-report=html --cov-report=term-missing

# Verbose mode
pytest -v
```

### 3. View Coverage Report

```bash
# Generate HTML report
pytest --cov=. --cov-report=html

# Open in browser (Windows)
start htmlcov/index.html
```

## Test Structure

```
tests/
├── __init__.py                 # Package initialization
├── conftest.py                 # Shared fixtures (mock models, GTFS data, test clients)
├── README.md                   # Detailed testing documentation
├── test_config.py              # Configuration tests (67 tests)
├── test_validators.py          # Validation tests (45 tests)
├── test_prediction_api.py      # Prediction API tests (12 tests)
└── test_fare_api.py            # Fare API tests (10 tests)

pytest.ini                      # Pytest configuration
.coveragerc                     # Coverage configuration
.github/workflows/tests.yml     # CI/CD configuration
```

**Total: 134+ test cases**

## Test Coverage

### What's Tested

#### 1. Configuration Management (`test_config.py`)
- ✅ Environment detection (development, testing, production)
- ✅ Configuration value validation
- ✅ Environment variable overrides
- ✅ Path configuration
- ✅ Fare tiers and rush hour settings
- ✅ Helper functions (is_development, is_production, etc.)
- ✅ Production SECRET_KEY validation

#### 2. Input Validation (`test_validators.py`)
- ✅ Latitude/longitude validation (Bangalore bounds: 12.7-13.2, 77.3-77.9)
- ✅ Prediction request validation
- ✅ Batch prediction validation (size limits, empty arrays)
- ✅ Fare request validation (origin/destination)
- ✅ Journey planning validation
- ✅ Edge cases (null values, whitespace, extreme values)
- ✅ Boundary value testing

#### 3. Prediction API (`test_prediction_api.py`)
- ✅ GET `/health` - Health check with/without model
- ✅ POST `/predict` - Single predictions with valid/invalid inputs
- ✅ POST `/predict/batch` - Batch predictions (max 100 items)
- ✅ GET `/model/info` - Model metadata
- ✅ Error handling (400, 500 responses)
- ✅ Response structure validation

#### 4. Fare API (`test_fare_api.py`)
- ✅ GET `/api/health` - Health check
- ✅ GET `/api/stops` - Get all stops
- ✅ GET `/api/stops/search` - Search stops by name
- ✅ POST `/api/calculate_fare` - Calculate fare between stops
- ✅ GET `/api/journey/plan` - Plan journey
- ✅ GTFS data loading and validation
- ✅ Error handling (404 for missing stops)

### Test Markers

Organize and run tests by category:

```bash
# Run by marker
pytest -m unit              # Unit tests only
pytest -m integration       # Integration tests only
pytest -m api               # All API tests
pytest -m validation        # All validation tests
pytest -m config            # Configuration tests
pytest -m prediction        # Prediction API tests
pytest -m fare              # Fare API tests
```

## Key Features

### 1. Comprehensive Fixtures

`conftest.py` provides:
- **Mock Models**: Simulated ML models with predict/predict_proba
- **Mock GTFS Data**: Sample stops, routes, fares, shapes
- **Test Clients**: Flask test clients for both APIs
- **Sample Requests**: Valid and invalid request examples
- **Boundary Coordinates**: Bangalore boundary test data
- **Helper Validators**: Response structure validation functions

### 2. Boundary Value Testing

Tests coordinates at:
- Minimum bounds: (12.7, 77.3)
- Maximum bounds: (13.2, 77.9)
- Just outside minimum: (12.69, 77.29) ❌
- Just outside maximum: (13.21, 77.91) ❌
- Center: (12.9716, 77.5946) ✅

### 3. Edge Case Testing

- Null/None values
- Empty strings
- Whitespace handling
- Type coercion (string → float)
- Extreme values (1000, -1000)
- Same origin/destination
- Non-existent stops
- Batch size limits
- Missing required fields

### 4. Error Handling

Tests for proper error responses:
- **400 Bad Request**: Invalid input, validation errors
- **404 Not Found**: Missing stops, model not loaded
- **500 Internal Server Error**: Model prediction failures

## Continuous Integration

### GitHub Actions Workflow

Tests run automatically on every push/PR:

**Matrix Strategy:**
- **OS**: Ubuntu, Windows
- **Python**: 3.8, 3.9, 3.10, 3.11

**Steps:**
1. Install dependencies
2. Run pytest with coverage
3. Upload coverage to Codecov
4. Generate HTML coverage report
5. Lint code (flake8, black, isort)

**Configuration:** `.github/workflows/tests.yml`

### Local CI Simulation

```bash
# Run tests like CI does
APP_ENV=testing pytest -v --cov=. --cov-report=xml --cov-report=term-missing
```

## Coverage Configuration

### Excluded from Coverage

(See `.coveragerc`)
- Test files (`*/tests/*`, `test_*.py`)
- Training scripts (`train_model*.py`)
- Fixtures (`conftest.py`)
- Debug code (`def __repr__`, `if __name__ == "__main__"`)

### Coverage Goals

- **Overall**: 80%+
- **Core modules**: 90%+
  - `config.py`
  - `validators.py`
- **API modules**: 75%+
  - `predict_api.py`
  - `fare_service.py`

## Running Specific Tests

```bash
# Single file
pytest tests/test_validators.py

# Single class
pytest tests/test_validators.py::TestPredictionRequestValidator

# Single test
pytest tests/test_validators.py::TestPredictionRequestValidator::test_valid_prediction_request

# Stop at first failure
pytest -x

# Show local variables on failure
pytest -l

# Re-run failed tests
pytest --lf
```

## Debugging Tests

### Verbose Output

```bash
pytest -vv --tb=short
```

### Print Statements

```bash
pytest -s  # Shows print() output
```

### Debug Specific Test

```python
def test_example():
    import pdb; pdb.set_trace()  # Set breakpoint
    # Your test code
```

### VS Code Debugging

1. Install Python extension
2. Set breakpoint in test file
3. Click "Debug Test" in code lens

## Common Issues & Solutions

### Import Errors

```bash
# Ensure you're in project root
cd F:\MiniProject\ml

# Check Python path
python -c "import sys; print(sys.path)"
```

### Mock Not Working

```python
# Use patch at module level, not object level
from unittest.mock import patch

# Correct
with patch('predict_api.model', mock_model):
    # test code

# Incorrect
with patch('model', mock_model):  # Won't work
```

### Fixture Not Found

Ensure `conftest.py` is in `tests/` directory and contains the fixture.

### Coverage Too Low

```bash
# Show missing lines
pytest --cov=. --cov-report=term-missing

# Focus on specific module
pytest --cov=validators --cov-report=term-missing tests/test_validators.py
```

## Best Practices

### 1. Test Naming

```python
# Good
def test_prediction_with_valid_coordinates()
def test_fare_calculation_with_missing_origin()

# Avoid
def test_1()
def test_stuff()
```

### 2. Arrange-Act-Assert Pattern

```python
def test_example():
    # Arrange - Setup test data
    validator = PredictionRequestValidator()
    data = {'stop_lat': 12.9716, 'stop_lon': 77.5946}
    
    # Act - Execute the code
    is_valid, result = validator.validate(data)
    
    # Assert - Verify results
    assert is_valid is True
    assert result['stop_lat'] == 12.9716
```

### 3. Use Fixtures

```python
# Good - Use fixtures
def test_with_fixture(valid_prediction_request):
    # Use pre-configured data
    assert valid_prediction_request['stop_lat'] == 12.9716

# Avoid - Duplicate setup
def test_without_fixture():
    # Repeated setup in every test
    data = {'stop_lat': 12.9716, 'stop_lon': 77.5946}
```

### 4. Test One Thing

```python
# Good - Tests one behavior
def test_validates_latitude()
def test_validates_longitude()

# Avoid - Tests multiple things
def test_validates_everything()
```

## Adding New Tests

1. **Create test file**: `tests/test_<module>.py`
2. **Import pytest**: `import pytest`
3. **Add markers**: `@pytest.mark.unit`, `@pytest.mark.api`
4. **Use fixtures**: See `conftest.py`
5. **Run tests**: `pytest tests/test_<module>.py`
6. **Check coverage**: `pytest --cov=<module>`
7. **Update docs**: Add to `tests/README.md`

## Test Statistics

| Category | Files | Classes | Tests | Coverage Target |
|----------|-------|---------|-------|----------------|
| Config | 1 | 5 | 67 | 95%+ |
| Validators | 1 | 6 | 45 | 90%+ |
| Prediction API | 1 | 4 | 12 | 80%+ |
| Fare API | 1 | 4 | 10 | 80%+ |
| **Total** | **4** | **19** | **134+** | **80%+** |

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [pytest-cov Documentation](https://pytest-cov.readthedocs.io/)
- [Flask Testing](https://flask.palletsprojects.com/en/latest/testing/)
- [GitHub Actions](https://docs.github.com/en/actions)

## Next Steps

1. **Install dependencies**: `pip install -r requirements.txt`
2. **Run tests**: `pytest`
3. **View coverage**: `pytest --cov=. --cov-report=html`
4. **Push to GitHub**: Tests will run automatically
5. **Monitor coverage**: Check Codecov integration

---

**Questions?** See `tests/README.md` for detailed documentation.
