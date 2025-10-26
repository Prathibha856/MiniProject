# Tests for BMTC Bus Crowd Prediction System

Comprehensive pytest test suite for the ML prediction and fare calculation APIs.

## Test Structure

```
tests/
├── __init__.py                 # Package initialization
├── conftest.py                 # Shared fixtures and test configuration
├── pytest.ini                  # Pytest configuration (in parent directory)
├── test_config.py              # Configuration and environment tests
├── test_validators.py          # Input validation tests
├── test_prediction_api.py      # Prediction API endpoint tests
└── test_fare_api.py            # Fare calculation API endpoint tests
```

## Running Tests

### Run all tests
```bash
pytest
```

### Run tests with coverage
```bash
pytest --cov=. --cov-report=html --cov-report=term-missing
```

### Run specific test file
```bash
pytest tests/test_validators.py
```

### Run specific test class
```bash
pytest tests/test_prediction_api.py::TestPredictionEndpoint
```

### Run specific test function
```bash
pytest tests/test_validators.py::TestPredictionRequestValidator::test_valid_prediction_request
```

### Run tests by marker
```bash
# Run only unit tests
pytest -m unit

# Run only API tests
pytest -m api

# Run only validation tests
pytest -m validation

# Run only prediction API tests
pytest -m prediction

# Run only fare API tests
pytest -m fare
```

### Run tests with verbose output
```bash
pytest -v
```

### Run tests and stop at first failure
```bash
pytest -x
```

## Test Coverage

Current test coverage aim: **80%+**

View coverage report:
```bash
# Generate HTML coverage report
pytest --cov=. --cov-report=html

# Open coverage report
# Windows
start htmlcov/index.html

# Linux/Mac
open htmlcov/index.html
```

## Test Categories

### 1. Configuration Tests (`test_config.py`)
- Environment detection (development, testing, production)
- Configuration value validation
- Environment variable overrides
- Path configuration
- Fare tier and rush hour configuration

### 2. Validation Tests (`test_validators.py`)
- Coordinate validation (Bangalore bounds)
- Prediction request validation
- Batch prediction validation
- Fare request validation
- Journey planning validation
- Edge cases and boundary values

### 3. Prediction API Tests (`test_prediction_api.py`)
- `/health` endpoint
- `/predict` endpoint (single predictions)
- `/predict/batch` endpoint (batch predictions)
- `/model/info` endpoint
- Valid and invalid requests
- Error handling
- Model loading scenarios

### 4. Fare API Tests (`test_fare_api.py`)
- `/api/health` endpoint
- `/api/stops` endpoint
- `/api/stops/search` endpoint
- `/api/calculate_fare` endpoint
- `/api/journey/plan` endpoint
- GTFS data loading
- Error handling

## Fixtures

Key fixtures available in `conftest.py`:

- `test_config` - Test configuration object
- `mock_model` - Mock ML model for predictions
- `mock_gtfs_data` - Sample GTFS dataset
- `prediction_client` - Flask test client for prediction API
- `fare_client` - Flask test client for fare API
- `valid_prediction_request` - Sample valid prediction request
- `valid_fare_request` - Sample valid fare request
- `bangalore_boundary_coordinates` - Boundary test coordinates

## Writing New Tests

### Example Test Structure

```python
import pytest

@pytest.mark.unit
@pytest.mark.validation
class TestNewValidator:
    """Test description"""
    
    def test_valid_case(self, fixture_name):
        """Test with valid input"""
        # Arrange
        validator = NewValidator()
        data = {'field': 'value'}
        
        # Act
        is_valid, result = validator.validate(data)
        
        # Assert
        assert is_valid is True
        assert result['field'] == 'value'
    
    def test_invalid_case(self):
        """Test with invalid input"""
        validator = NewValidator()
        data = {'field': None}
        
        is_valid, result = validator.validate(data)
        
        assert is_valid is False
        assert 'errors' in result
```

### Test Markers

Available pytest markers:
- `@pytest.mark.unit` - Unit tests
- `@pytest.mark.integration` - Integration tests
- `@pytest.mark.api` - API endpoint tests
- `@pytest.mark.validation` - Validation tests
- `@pytest.mark.config` - Configuration tests
- `@pytest.mark.prediction` - Prediction API tests
- `@pytest.mark.fare` - Fare API tests
- `@pytest.mark.slow` - Slow-running tests

## Continuous Integration

Tests run automatically on every push via GitHub Actions:
- Tested on Ubuntu and Windows
- Tested on Python 3.8, 3.9, 3.10, 3.11
- Coverage reports uploaded to Codecov
- Code linting with flake8, black, isort

See `.github/workflows/tests.yml` for CI configuration.

## Test Data

Mock data is provided through fixtures in `conftest.py`:
- Sample GTFS stops, routes, fares
- Sample prediction requests
- Sample fare calculation requests
- Bangalore boundary coordinates

## Troubleshooting

### Tests fail with import errors
```bash
# Ensure you're in the project root directory
cd F:\MiniProject\ml

# Install test dependencies
pip install -r requirements.txt
```

### Coverage not working
```bash
# Install pytest-cov
pip install pytest-cov

# Run with coverage
pytest --cov=.
```

### Fixtures not found
Ensure `conftest.py` is in the `tests/` directory.

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure tests pass: `pytest`
3. Check coverage: `pytest --cov=.`
4. Update this README if adding new test categories
