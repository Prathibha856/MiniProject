"""
Input Validation Module for BMTC Bus Crowd Prediction System

This module provides comprehensive validation for API requests including:
- Coordinate validation (latitude/longitude bounds)
- Time format validation
- Data type validation
- Range validation
- Required field validation

Usage:
    from validators import PredictionRequestValidator, FareRequestValidator
    
    validator = PredictionRequestValidator()
    is_valid, errors = validator.validate(request_data)
    if not is_valid:
        return jsonify({'error': errors}), 400
"""

from datetime import datetime
from typing import Dict, List, Tuple, Any, Optional
from config import config


class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass


class BaseValidator:
    """Base validator class with common validation methods"""
    
    @staticmethod
    def validate_latitude(lat: Any, field_name: str = "latitude") -> Tuple[bool, Optional[str]]:
        """
        Validate latitude value.
        
        Args:
            lat: Latitude value to validate
            field_name: Name of the field for error messages
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if lat is None:
            return False, f"{field_name} is required"
        
        try:
            lat_float = float(lat)
        except (ValueError, TypeError):
            return False, f"{field_name} must be a valid number"
        
        if not (config.BANGALORE_LAT_MIN <= lat_float <= config.BANGALORE_LAT_MAX):
            return False, (
                f"{field_name} must be between {config.BANGALORE_LAT_MIN} and "
                f"{config.BANGALORE_LAT_MAX} (Bangalore bounds)"
            )
        
        return True, None
    
    @staticmethod
    def validate_longitude(lon: Any, field_name: str = "longitude") -> Tuple[bool, Optional[str]]:
        """
        Validate longitude value.
        
        Args:
            lon: Longitude value to validate
            field_name: Name of the field for error messages
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if lon is None:
            return False, f"{field_name} is required"
        
        try:
            lon_float = float(lon)
        except (ValueError, TypeError):
            return False, f"{field_name} must be a valid number"
        
        if not (config.BANGALORE_LON_MIN <= lon_float <= config.BANGALORE_LON_MAX):
            return False, (
                f"{field_name} must be between {config.BANGALORE_LON_MIN} and "
                f"{config.BANGALORE_LON_MAX} (Bangalore bounds)"
            )
        
        return True, None
    
    @staticmethod
    def validate_time_string(time_str: Any) -> Tuple[bool, Optional[str]]:
        """
        Validate time string in HH:MM format.
        
        Args:
            time_str: Time string to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if time_str is None:
            return True, None  # Time is optional, will use current time
        
        if not isinstance(time_str, str):
            return False, "time must be a string in HH:MM format"
        
        try:
            datetime.strptime(time_str, '%H:%M')
            return True, None
        except ValueError:
            return False, "time must be in HH:MM format (e.g., '14:30')"
    
    @staticmethod
    def validate_day_of_week(day: Any) -> Tuple[bool, Optional[str]]:
        """
        Validate day of week value (0-6, Monday=0).
        
        Args:
            day: Day of week value to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if day is None:
            return True, None  # Optional, will use current day
        
        try:
            day_int = int(day)
        except (ValueError, TypeError):
            return False, "day_of_week must be an integer (0-6, Monday=0)"
        
        if not (0 <= day_int <= 6):
            return False, "day_of_week must be between 0 and 6 (Monday=0, Sunday=6)"
        
        return True, None
    
    @staticmethod
    def validate_stop_name(name: Any) -> Tuple[bool, Optional[str]]:
        """
        Validate stop name.
        
        Args:
            name: Stop name to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if name is None or (isinstance(name, str) and not name.strip()):
            return False, "stop name is required"
        
        if not isinstance(name, str):
            return False, "stop name must be a string"
        
        if len(name.strip()) < 2:
            return False, "stop name must be at least 2 characters"
        
        if len(name) > 200:
            return False, "stop name must be less than 200 characters"
        
        return True, None


class PredictionRequestValidator(BaseValidator):
    """
    Validator for bus crowd prediction API requests.
    
    Validates:
    - stop_lat: latitude coordinate (required)
    - stop_lon: longitude coordinate (required)
    - time: time string in HH:MM format (optional)
    - day_of_week: integer 0-6 (optional)
    """
    
    def __init__(self):
        self.required_fields = ['stop_lat', 'stop_lon']
        self.optional_fields = ['time', 'day_of_week', 'date']
    
    def validate(self, data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate prediction request data.
        
        Args:
            data: Request data dictionary
            
        Returns:
            Tuple of (is_valid, result_dict)
            result_dict contains either 'errors' or validated data
        """
        if not isinstance(data, dict):
            return False, {'errors': ['Request data must be a JSON object']}
        
        errors = []
        
        # Validate latitude
        is_valid, error = self.validate_latitude(
            data.get('stop_lat'),
            field_name='stop_lat'
        )
        if not is_valid:
            errors.append(error)
        
        # Validate longitude
        is_valid, error = self.validate_longitude(
            data.get('stop_lon'),
            field_name='stop_lon'
        )
        if not is_valid:
            errors.append(error)
        
        # Validate time (optional)
        if 'time' in data:
            is_valid, error = self.validate_time_string(data.get('time'))
            if not is_valid:
                errors.append(error)
        
        # Validate day_of_week (optional)
        if 'day_of_week' in data:
            is_valid, error = self.validate_day_of_week(data.get('day_of_week'))
            if not is_valid:
                errors.append(error)
        
        if errors:
            return False, {'errors': errors}
        
        # Return validated data
        validated_data = {
            'stop_lat': float(data['stop_lat']),
            'stop_lon': float(data['stop_lon']),
            'time': data.get('time'),
            'day_of_week': int(data['day_of_week']) if data.get('day_of_week') is not None else None
        }
        
        return True, validated_data


class BatchPredictionRequestValidator(BaseValidator):
    """
    Validator for batch prediction API requests.
    
    Validates an array of prediction requests.
    """
    
    def __init__(self, max_batch_size: int = None):
        self.max_batch_size = max_batch_size or config.BATCH_PREDICTION_MAX_SIZE
        self.item_validator = PredictionRequestValidator()
    
    def validate(self, data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate batch prediction request data.
        
        Args:
            data: Request data dictionary with 'requests' array
            
        Returns:
            Tuple of (is_valid, result_dict)
        """
        if not isinstance(data, dict):
            return False, {'errors': ['Request data must be a JSON object']}
        
        if 'requests' not in data:
            return False, {'errors': ['Missing required field: requests']}
        
        requests_list = data.get('requests')
        
        if not isinstance(requests_list, list):
            return False, {'errors': ['requests must be an array']}
        
        if len(requests_list) == 0:
            return False, {'errors': ['requests array cannot be empty']}
        
        if len(requests_list) > self.max_batch_size:
            return False, {
                'errors': [f'Batch size exceeds maximum of {self.max_batch_size} requests']
            }
        
        # Validate each request in the batch
        errors = []
        validated_requests = []
        
        for idx, req in enumerate(requests_list):
            is_valid, result = self.item_validator.validate(req)
            if not is_valid:
                req_errors = result.get('errors', [])
                for error in req_errors:
                    errors.append(f"Request {idx + 1}: {error}")
            else:
                validated_requests.append(result)
        
        if errors:
            return False, {'errors': errors}
        
        return True, {'requests': validated_requests}


class FareRequestValidator(BaseValidator):
    """
    Validator for fare calculation API requests.
    
    Validates:
    - origin: origin stop name (required)
    - destination: destination stop name (required)
    - route_id: route identifier (optional)
    """
    
    def __init__(self):
        self.required_fields = ['origin', 'destination']
        self.optional_fields = ['route_id']
    
    def validate(self, data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate fare calculation request data.
        
        Args:
            data: Request data dictionary
            
        Returns:
            Tuple of (is_valid, result_dict)
        """
        if not isinstance(data, dict):
            return False, {'errors': ['Request data must be a JSON object']}
        
        errors = []
        
        # Validate origin
        is_valid, error = self.validate_stop_name(data.get('origin'))
        if not is_valid:
            errors.append(f"origin: {error}")
        
        # Validate destination
        is_valid, error = self.validate_stop_name(data.get('destination'))
        if not is_valid:
            errors.append(f"destination: {error}")
        
        # Check if origin and destination are the same
        origin = data.get('origin', '').strip().lower()
        destination = data.get('destination', '').strip().lower()
        if origin and destination and origin == destination:
            errors.append("origin and destination cannot be the same")
        
        # Validate route_id (optional)
        if 'route_id' in data:
            route_id = data.get('route_id')
            if route_id is not None and not isinstance(route_id, (str, int)):
                errors.append("route_id must be a string or integer")
        
        if errors:
            return False, {'errors': errors}
        
        # Return validated data
        validated_data = {
            'origin': data['origin'].strip(),
            'destination': data['destination'].strip(),
            'route_id': data.get('route_id')
        }
        
        return True, validated_data


class JourneyPlanRequestValidator(BaseValidator):
    """
    Validator for journey planning API requests.
    
    Validates:
    - fromStop: origin stop name (required)
    - toStop: destination stop name (required)
    """
    
    def validate(self, params: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate journey planning request parameters.
        
        Args:
            params: Request query parameters
            
        Returns:
            Tuple of (is_valid, result_dict)
        """
        if not isinstance(params, dict):
            return False, {'errors': ['Request parameters must be provided']}
        
        errors = []
        
        # Validate fromStop
        from_stop = params.get('fromStop')
        is_valid, error = self.validate_stop_name(from_stop)
        if not is_valid:
            errors.append(f"fromStop: {error}")
        
        # Validate toStop
        to_stop = params.get('toStop')
        is_valid, error = self.validate_stop_name(to_stop)
        if not is_valid:
            errors.append(f"toStop: {error}")
        
        # Check if stops are the same
        if from_stop and to_stop:
            if from_stop.strip().lower() == to_stop.strip().lower():
                errors.append("fromStop and toStop cannot be the same")
        
        if errors:
            return False, {'errors': errors}
        
        validated_data = {
            'fromStop': from_stop.strip(),
            'toStop': to_stop.strip()
        }
        
        return True, validated_data


class CoordinateValidator(BaseValidator):
    """
    Standalone validator for coordinate pairs.
    
    Useful for validating coordinates in various contexts.
    """
    
    @staticmethod
    def validate_coordinates(
        lat: Any,
        lon: Any,
        lat_field: str = "latitude",
        lon_field: str = "longitude"
    ) -> Tuple[bool, List[str]]:
        """
        Validate a coordinate pair.
        
        Args:
            lat: Latitude value
            lon: Longitude value
            lat_field: Name of latitude field for error messages
            lon_field: Name of longitude field for error messages
            
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        is_valid, error = BaseValidator.validate_latitude(lat, lat_field)
        if not is_valid:
            errors.append(error)
        
        is_valid, error = BaseValidator.validate_longitude(lon, lon_field)
        if not is_valid:
            errors.append(error)
        
        return len(errors) == 0, errors
    
    @staticmethod
    def is_within_bangalore(lat: float, lon: float) -> bool:
        """
        Check if coordinates are within Bangalore bounds.
        
        Args:
            lat: Latitude value
            lon: Longitude value
            
        Returns:
            True if within bounds, False otherwise
        """
        return (
            config.BANGALORE_LAT_MIN <= lat <= config.BANGALORE_LAT_MAX and
            config.BANGALORE_LON_MIN <= lon <= config.BANGALORE_LON_MAX
        )


# Convenience function for quick validation
def validate_prediction_request(data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
    """
    Quick validation helper for prediction requests.
    
    Args:
        data: Request data dictionary
        
    Returns:
        Tuple of (is_valid, result_dict)
    """
    validator = PredictionRequestValidator()
    return validator.validate(data)


def validate_fare_request(data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
    """
    Quick validation helper for fare requests.
    
    Args:
        data: Request data dictionary
        
    Returns:
        Tuple of (is_valid, result_dict)
    """
    validator = FareRequestValidator()
    return validator.validate(data)


# Example usage
if __name__ == '__main__':
    # Test prediction request validation
    print("Testing PredictionRequestValidator:")
    pred_validator = PredictionRequestValidator()
    
    # Valid request
    valid_data = {
        'stop_lat': 12.9716,
        'stop_lon': 77.5946,
        'time': '14:30',
        'day_of_week': 1
    }
    is_valid, result = pred_validator.validate(valid_data)
    print(f"Valid request: {is_valid}, Result: {result}")
    
    # Invalid request (out of bounds)
    invalid_data = {
        'stop_lat': 15.0,  # Out of Bangalore bounds
        'stop_lon': 77.5946,
        'time': '25:00'  # Invalid time
    }
    is_valid, result = pred_validator.validate(invalid_data)
    print(f"Invalid request: {is_valid}, Errors: {result}")
    
    # Test fare request validation
    print("\nTesting FareRequestValidator:")
    fare_validator = FareRequestValidator()
    
    # Valid request
    valid_fare = {
        'origin': 'Majestic',
        'destination': 'Koramangala',
        'route_id': 'G-4'
    }
    is_valid, result = fare_validator.validate(valid_fare)
    print(f"Valid fare request: {is_valid}, Result: {result}")
    
    # Invalid request (same origin and destination)
    invalid_fare = {
        'origin': 'Majestic',
        'destination': 'Majestic'
    }
    is_valid, result = fare_validator.validate(invalid_fare)
    print(f"Invalid fare request: {is_valid}, Errors: {result}")
