"""
Tests for Input Validation

Tests all validation methods with edge cases and boundary values.
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from validators import (
    PredictionRequestValidator,
    BatchPredictionRequestValidator,
    FareRequestValidator,
    JourneyPlanRequestValidator,
    CoordinateValidator,
    validate_prediction_request,
    validate_fare_request
)


@pytest.mark.validation
@pytest.mark.unit
class TestPredictionRequestValidator:
    """Test prediction request validation"""
    
    def test_valid_prediction_request(self, valid_prediction_request):
        """Test validation of valid prediction request"""
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate(valid_prediction_request)
        
        assert is_valid is True
        assert 'errors' not in result
        assert result['stop_lat'] == 12.9716
        assert result['stop_lon'] == 77.5946
    
    def test_missing_latitude(self, invalid_prediction_requests):
        """Test validation with missing latitude"""
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate(invalid_prediction_requests['missing_lat'])
        
        assert is_valid is False
        assert 'errors' in result
        assert any('stop_lat' in error for error in result['errors'])
    
    def test_missing_longitude(self, invalid_prediction_requests):
        """Test validation with missing longitude"""
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate(invalid_prediction_requests['missing_lon'])
        
        assert is_valid is False
        assert 'errors' in result
    
    def test_out_of_bounds_latitude(self, invalid_prediction_requests):
        """Test validation with out-of-bounds latitude"""
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate(invalid_prediction_requests['out_of_bounds_lat'])
        
        assert is_valid is False
        assert any('Bangalore bounds' in error for error in result['errors'])
    
    def test_out_of_bounds_longitude(self, invalid_prediction_requests):
        """Test validation with out-of-bounds longitude"""
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate(invalid_prediction_requests['out_of_bounds_lon'])
        
        assert is_valid is False
    
    def test_invalid_time_format(self, invalid_prediction_requests):
        """Test validation with invalid time format"""
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate(invalid_prediction_requests['invalid_time_format'])
        
        assert is_valid is False
        assert any('HH:MM' in error for error in result['errors'])
    
    def test_invalid_day_of_week(self, invalid_prediction_requests):
        """Test validation with invalid day of week"""
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate(invalid_prediction_requests['invalid_day_of_week'])
        
        assert is_valid is False
        assert any('0 and 6' in error for error in result['errors'])
    
    def test_non_numeric_coordinates(self, invalid_prediction_requests):
        """Test validation with non-numeric latitude"""
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate(invalid_prediction_requests['non_numeric_lat'])
        
        assert is_valid is False
    
    def test_boundary_coordinates(self, bangalore_boundary_coordinates):
        """Test coordinates at boundaries"""
        validator = PredictionRequestValidator()
        
        # Test minimum boundaries (should be valid)
        is_valid, _ = validator.validate(bangalore_boundary_coordinates['min_lat_min_lon'])
        assert is_valid is True
        
        # Test maximum boundaries (should be valid)
        is_valid, _ = validator.validate(bangalore_boundary_coordinates['max_lat_max_lon'])
        assert is_valid is True
        
        # Test just outside minimum (should be invalid)
        is_valid, _ = validator.validate(bangalore_boundary_coordinates['just_outside_min'])
        assert is_valid is False
        
        # Test just outside maximum (should be invalid)
        is_valid, _ = validator.validate(bangalore_boundary_coordinates['just_outside_max'])
        assert is_valid is False
    
    def test_optional_fields(self):
        """Test that optional fields work correctly"""
        validator = PredictionRequestValidator()
        
        # Minimal valid request (no time or day)
        minimal_request = {'stop_lat': 12.9716, 'stop_lon': 77.5946}
        is_valid, result = validator.validate(minimal_request)
        
        assert is_valid is True
        assert result['time'] is None
        assert result['day_of_week'] is None


@pytest.mark.validation
@pytest.mark.unit
class TestBatchPredictionRequestValidator:
    """Test batch prediction request validation"""
    
    def test_valid_batch_request(self, valid_batch_request):
        """Test validation of valid batch request"""
        validator = BatchPredictionRequestValidator()
        is_valid, result = validator.validate(valid_batch_request)
        
        assert is_valid is True
        assert 'requests' in result
        assert len(result['requests']) == 3
    
    def test_missing_requests_field(self):
        """Test validation with missing requests field"""
        validator = BatchPredictionRequestValidator()
        is_valid, result = validator.validate({})
        
        assert is_valid is False
        assert 'Missing required field: requests' in result['errors']
    
    def test_empty_requests_array(self):
        """Test validation with empty requests array"""
        validator = BatchPredictionRequestValidator()
        is_valid, result = validator.validate({'requests': []})
        
        assert is_valid is False
        assert 'requests array cannot be empty' in result['errors']
    
    def test_exceeds_batch_size_limit(self, valid_prediction_request):
        """Test validation when batch size exceeds limit"""
        validator = BatchPredictionRequestValidator(max_batch_size=2)
        large_batch = {'requests': [valid_prediction_request] * 5}
        
        is_valid, result = validator.validate(large_batch)
        
        assert is_valid is False
        assert 'exceeds maximum' in result['errors'][0]
    
    def test_batch_with_some_invalid_requests(self, valid_prediction_request):
        """Test batch with mix of valid and invalid requests"""
        validator = BatchPredictionRequestValidator()
        mixed_batch = {
            'requests': [
                valid_prediction_request,
                {'stop_lat': 15.0, 'stop_lon': 77.5946},  # Invalid
                valid_prediction_request
            ]
        }
        
        is_valid, result = validator.validate(mixed_batch)
        
        assert is_valid is False
        assert 'errors' in result
        assert 'Request 2:' in result['errors'][0]


@pytest.mark.validation
@pytest.mark.unit
class TestFareRequestValidator:
    """Test fare request validation"""
    
    def test_valid_fare_request(self, valid_fare_request):
        """Test validation of valid fare request"""
        validator = FareRequestValidator()
        is_valid, result = validator.validate(valid_fare_request)
        
        assert is_valid is True
        assert result['origin'] == 'Majestic'
        assert result['destination'] == 'Koramangala'
    
    def test_missing_origin(self, invalid_fare_requests):
        """Test validation with missing origin"""
        validator = FareRequestValidator()
        is_valid, result = validator.validate(invalid_fare_requests['missing_origin'])
        
        assert is_valid is False
        assert any('origin' in error for error in result['errors'])
    
    def test_missing_destination(self, invalid_fare_requests):
        """Test validation with missing destination"""
        validator = FareRequestValidator()
        is_valid, result = validator.validate(invalid_fare_requests['missing_destination'])
        
        assert is_valid is False
    
    def test_same_origin_and_destination(self, invalid_fare_requests):
        """Test validation when origin equals destination"""
        validator = FareRequestValidator()
        is_valid, result = validator.validate(invalid_fare_requests['same_origin_destination'])
        
        assert is_valid is False
        assert any('cannot be the same' in error for error in result['errors'])
    
    def test_empty_stop_name(self, invalid_fare_requests):
        """Test validation with empty stop name"""
        validator = FareRequestValidator()
        is_valid, result = validator.validate(invalid_fare_requests['empty_origin'])
        
        assert is_valid is False
    
    def test_stop_name_too_short(self, invalid_fare_requests):
        """Test validation with stop name too short"""
        validator = FareRequestValidator()
        is_valid, result = validator.validate(invalid_fare_requests['short_stop_name'])
        
        assert is_valid is False
        assert any('at least 2 characters' in error for error in result['errors'])
    
    def test_stop_name_too_long(self, invalid_fare_requests):
        """Test validation with stop name too long"""
        validator = FareRequestValidator()
        is_valid, result = validator.validate(invalid_fare_requests['too_long_stop_name'])
        
        assert is_valid is False
        assert any('less than 200 characters' in error for error in result['errors'])
    
    def test_optional_route_id(self, valid_fare_request):
        """Test that route_id is optional"""
        validator = FareRequestValidator()
        
        # Without route_id
        request_without_route = {
            'origin': 'Majestic',
            'destination': 'Koramangala'
        }
        is_valid, result = validator.validate(request_without_route)
        
        assert is_valid is True
        assert result['route_id'] is None


@pytest.mark.validation
@pytest.mark.unit
class TestJourneyPlanRequestValidator:
    """Test journey planning request validation"""
    
    def test_valid_journey_request(self, valid_journey_request):
        """Test validation of valid journey request"""
        validator = JourneyPlanRequestValidator()
        is_valid, result = validator.validate(valid_journey_request)
        
        assert is_valid is True
        assert result['fromStop'] == 'Majestic'
        assert result['toStop'] == 'Koramangala'
    
    def test_missing_from_stop(self):
        """Test validation with missing fromStop"""
        validator = JourneyPlanRequestValidator()
        is_valid, result = validator.validate({'toStop': 'Koramangala'})
        
        assert is_valid is False
        assert any('fromStop' in error for error in result['errors'])
    
    def test_missing_to_stop(self):
        """Test validation with missing toStop"""
        validator = JourneyPlanRequestValidator()
        is_valid, result = validator.validate({'fromStop': 'Majestic'})
        
        assert is_valid is False
        assert any('toStop' in error for error in result['errors'])
    
    def test_same_from_and_to_stop(self):
        """Test validation when fromStop equals toStop"""
        validator = JourneyPlanRequestValidator()
        is_valid, result = validator.validate({
            'fromStop': 'Majestic',
            'toStop': 'Majestic'
        })
        
        assert is_valid is False
        assert any('cannot be the same' in error for error in result['errors'])


@pytest.mark.validation
@pytest.mark.unit
class TestCoordinateValidator:
    """Test coordinate validation utility"""
    
    def test_valid_coordinates(self):
        """Test validation of valid coordinates"""
        is_valid, errors = CoordinateValidator.validate_coordinates(
            12.9716, 77.5946
        )
        
        assert is_valid is True
        assert len(errors) == 0
    
    def test_invalid_latitude(self):
        """Test validation with invalid latitude"""
        is_valid, errors = CoordinateValidator.validate_coordinates(
            15.0, 77.5946  # Outside Bangalore
        )
        
        assert is_valid is False
        assert len(errors) > 0
    
    def test_invalid_longitude(self):
        """Test validation with invalid longitude"""
        is_valid, errors = CoordinateValidator.validate_coordinates(
            12.9716, 80.0  # Outside Bangalore
        )
        
        assert is_valid is False
        assert len(errors) > 0
    
    def test_is_within_bangalore(self):
        """Test is_within_bangalore helper"""
        # Valid coordinates
        assert CoordinateValidator.is_within_bangalore(12.9716, 77.5946) is True
        
        # Invalid coordinates
        assert CoordinateValidator.is_within_bangalore(15.0, 77.5946) is False
        assert CoordinateValidator.is_within_bangalore(12.9716, 80.0) is False


@pytest.mark.validation
@pytest.mark.unit
class TestConvenienceFunctions:
    """Test convenience validation functions"""
    
    def test_validate_prediction_request_function(self, valid_prediction_request):
        """Test convenience function for prediction validation"""
        is_valid, result = validate_prediction_request(valid_prediction_request)
        
        assert is_valid is True
    
    def test_validate_fare_request_function(self, valid_fare_request):
        """Test convenience function for fare validation"""
        is_valid, result = validate_fare_request(valid_fare_request)
        
        assert is_valid is True


@pytest.mark.validation
@pytest.mark.unit
class TestEdgeCases:
    """Test edge cases and special scenarios"""
    
    def test_null_values(self):
        """Test handling of null values"""
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate({
            'stop_lat': None,
            'stop_lon': None
        })
        
        assert is_valid is False
        assert 'errors' in result
    
    def test_string_numbers(self):
        """Test that string numbers are properly converted"""
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate({
            'stop_lat': '12.9716',
            'stop_lon': '77.5946'
        })
        
        assert is_valid is True
        assert isinstance(result['stop_lat'], float)
        assert isinstance(result['stop_lon'], float)
    
    def test_whitespace_in_stop_names(self):
        """Test handling of whitespace in stop names"""
        validator = FareRequestValidator()
        is_valid, result = validator.validate({
            'origin': '  Majestic  ',
            'destination': '  Koramangala  '
        })
        
        assert is_valid is True
        assert result['origin'] == 'Majestic'
        assert result['destination'] == 'Koramangala'
    
    def test_non_dict_input(self):
        """Test handling of non-dictionary input"""
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate("not a dict")
        
        assert is_valid is False
        assert 'must be a JSON object' in result['errors'][0]
    
    def test_extreme_coordinate_values(self):
        """Test extremely large/small coordinate values"""
        validator = PredictionRequestValidator()
        
        # Extremely large values
        is_valid, _ = validator.validate({'stop_lat': 1000, 'stop_lon': 1000})
        assert is_valid is False
        
        # Extremely small values
        is_valid, _ = validator.validate({'stop_lat': -1000, 'stop_lon': -1000})
        assert is_valid is False
