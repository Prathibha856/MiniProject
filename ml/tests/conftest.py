"""
Pytest fixtures for BMTC Bus Crowd Prediction System tests

This module provides shared fixtures for:
- Flask test clients
- Mock models and GTFS data
- Sample prediction/fare request data
- Configuration overrides for testing
"""

import os
import sys
import pytest
import pandas as pd
import numpy as np
from pathlib import Path
from unittest.mock import Mock, MagicMock, patch
import tempfile
import shutil

# Add parent directory to path to import project modules
sys.path.insert(0, str(Path(__file__).parent.parent))


# ==================== Configuration Fixtures ====================

@pytest.fixture(scope="session", autouse=True)
def set_test_environment():
    """Set testing environment variable for all tests"""
    original_env = os.environ.get('APP_ENV')
    os.environ['APP_ENV'] = 'testing'
    yield
    # Restore original environment
    if original_env is not None:
        os.environ['APP_ENV'] = original_env
    else:
        os.environ.pop('APP_ENV', None)


@pytest.fixture
def test_config():
    """Provide test configuration"""
    # Reload config module with testing environment
    import importlib
    if 'config' in sys.modules:
        del sys.modules['config']
    
    os.environ['APP_ENV'] = 'testing'
    import config as config_module
    importlib.reload(config_module)
    
    yield config_module.config
    
    # Cleanup
    if 'config' in sys.modules:
        del sys.modules['config']


# ==================== Mock Model Fixtures ====================

@pytest.fixture
def mock_model():
    """Create a mock ML model for testing"""
    model = Mock()
    model.predict = Mock(return_value=np.array([1]))  # Medium crowd
    model.predict_proba = Mock(return_value=np.array([[0.1, 0.6, 0.2, 0.1]]))
    model.feature_names_in_ = ['hour', 'day_of_week', 'is_rush_hour', 'stop_lat', 'stop_lon']
    model.classes_ = np.array([0, 1, 2, 3])
    model.n_features_in_ = 5
    return model


@pytest.fixture
def mock_feature_info():
    """Create mock feature info"""
    return {
        'feature_columns': ['hour', 'day_of_week', 'is_rush_hour', 'stop_lat', 'stop_lon'],
        'feature_count': 5,
        'model_version': 'v3_test'
    }


# ==================== GTFS Data Fixtures ====================

@pytest.fixture
def sample_stops_df():
    """Create sample GTFS stops dataframe"""
    return pd.DataFrame({
        'stop_id': ['1', '2', '3', '4', '5'],
        'stop_name': ['Majestic', 'Koramangala', 'Whitefield', 'Electronic City', 'Jayanagar'],
        'stop_lat': [12.9767, 12.9352, 12.9698, 12.8456, 12.9250],
        'stop_lon': [77.5710, 77.6245, 77.7499, 77.6603, 77.5838]
    })


@pytest.fixture
def sample_routes_df():
    """Create sample GTFS routes dataframe"""
    return pd.DataFrame({
        'route_id': ['G-4', 'V-500', 'KBS-1'],
        'route_short_name': ['G4', '500', 'KBS1'],
        'route_long_name': ['Majestic to Koramangala', 'Majestic to Whitefield', 'Koramangala to Electronic City'],
        'route_type': [3, 3, 3]  # Bus
    })


@pytest.fixture
def sample_fare_attributes_df():
    """Create sample GTFS fare attributes dataframe"""
    return pd.DataFrame({
        'fare_id': ['fare_1', 'fare_2', 'fare_3', 'fare_4', 'fare_5'],
        'price': [5.0, 10.0, 15.0, 20.0, 25.0],
        'currency_type': ['INR', 'INR', 'INR', 'INR', 'INR'],
        'payment_method': [0, 0, 0, 0, 0]
    })


@pytest.fixture
def sample_fare_rules_df():
    """Create sample GTFS fare rules dataframe"""
    return pd.DataFrame({
        'fare_id': ['fare_1', 'fare_2', 'fare_3'],
        'route_id': ['G-4', 'V-500', 'KBS-1'],
        'origin_id': ['1', '1', '2'],
        'destination_id': ['2', '3', '4']
    })


@pytest.fixture
def sample_shapes_df():
    """Create sample GTFS shapes dataframe"""
    return pd.DataFrame({
        'shape_id': ['G4-shape', 'G4-shape', 'G4-shape'],
        'shape_pt_lat': [12.9767, 12.9560, 12.9352],
        'shape_pt_lon': [77.5710, 77.5978, 77.6245],
        'shape_pt_sequence': [0, 1, 2]
    })


@pytest.fixture
def mock_gtfs_data(sample_stops_df, sample_routes_df, sample_fare_attributes_df, 
                   sample_fare_rules_df, sample_shapes_df):
    """Create complete mock GTFS dataset"""
    return {
        'stops': sample_stops_df,
        'routes': sample_routes_df,
        'fare_attributes': sample_fare_attributes_df,
        'fare_rules': sample_fare_rules_df,
        'shapes': sample_shapes_df
    }


# ==================== Prediction API Fixtures ====================

@pytest.fixture
def prediction_client(mock_model, mock_feature_info):
    """Create Flask test client for prediction API with mocked model"""
    # Mock the model at module level before importing
    with patch('predict_api.model', mock_model), \
         patch('predict_api.feature_columns', mock_feature_info['feature_columns']), \
         patch('predict_api.feature_info', mock_feature_info):
        
        # Import after patching to ensure mocks are in place
        import predict_api
        predict_api.app.config['TESTING'] = True
        
        with predict_api.app.test_client() as client:
            yield client


@pytest.fixture
def valid_prediction_request():
    """Sample valid prediction request"""
    return {
        'stop_lat': 12.9716,
        'stop_lon': 77.5946,
        'time': '14:30',
        'day_of_week': 1
    }


@pytest.fixture
def invalid_prediction_requests():
    """Collection of invalid prediction requests for testing"""
    return {
        'missing_lat': {
            'stop_lon': 77.5946,
            'time': '14:30'
        },
        'missing_lon': {
            'stop_lat': 12.9716,
            'time': '14:30'
        },
        'out_of_bounds_lat': {
            'stop_lat': 15.0,  # Outside Bangalore
            'stop_lon': 77.5946
        },
        'out_of_bounds_lon': {
            'stop_lat': 12.9716,
            'stop_lon': 80.0  # Outside Bangalore
        },
        'invalid_time_format': {
            'stop_lat': 12.9716,
            'stop_lon': 77.5946,
            'time': '25:00'  # Invalid hour
        },
        'invalid_day_of_week': {
            'stop_lat': 12.9716,
            'stop_lon': 77.5946,
            'day_of_week': 10  # Must be 0-6
        },
        'non_numeric_lat': {
            'stop_lat': 'invalid',
            'stop_lon': 77.5946
        }
    }


@pytest.fixture
def valid_batch_request(valid_prediction_request):
    """Sample valid batch prediction request"""
    return {
        'requests': [
            valid_prediction_request,
            {
                'stop_lat': 13.0827,
                'stop_lon': 77.5877,
                'time': '18:00',
                'day_of_week': 1
            },
            {
                'stop_lat': 12.8456,
                'stop_lon': 77.6603,
                'time': '09:00',
                'day_of_week': 0
            }
        ]
    }


# ==================== Fare API Fixtures ====================

@pytest.fixture
def fare_client(mock_gtfs_data):
    """Create Flask test client for fare API with mocked GTFS data"""
    # Mock the GTFS data loading function
    with patch('fare_service.load_gtfs_data', return_value=mock_gtfs_data):
        # Import after patching
        import fare_service
        
        # Clear the LRU cache to ensure our mock is used
        fare_service.load_gtfs_data.cache_clear()
        
        fare_service.app.config['TESTING'] = True
        
        with fare_service.app.test_client() as client:
            yield client


@pytest.fixture
def valid_fare_request():
    """Sample valid fare request"""
    return {
        'origin': 'Majestic',
        'destination': 'Koramangala',
        'route_id': 'G-4'
    }


@pytest.fixture
def invalid_fare_requests():
    """Collection of invalid fare requests for testing"""
    return {
        'missing_origin': {
            'destination': 'Koramangala'
        },
        'missing_destination': {
            'origin': 'Majestic'
        },
        'same_origin_destination': {
            'origin': 'Majestic',
            'destination': 'Majestic'
        },
        'empty_origin': {
            'origin': '',
            'destination': 'Koramangala'
        },
        'short_stop_name': {
            'origin': 'M',  # Too short
            'destination': 'Koramangala'
        },
        'too_long_stop_name': {
            'origin': 'M' * 201,  # Too long
            'destination': 'Koramangala'
        }
    }


@pytest.fixture
def valid_journey_request():
    """Sample valid journey planning request"""
    return {
        'fromStop': 'Majestic',
        'toStop': 'Koramangala'
    }


# ==================== Boundary Value Fixtures ====================

@pytest.fixture
def bangalore_boundary_coordinates():
    """Coordinates at Bangalore boundaries for testing"""
    return {
        'min_lat_min_lon': {'stop_lat': 12.7, 'stop_lon': 77.3},
        'max_lat_max_lon': {'stop_lat': 13.2, 'stop_lon': 77.9},
        'center': {'stop_lat': 12.9716, 'stop_lon': 77.5946},
        'just_outside_min': {'stop_lat': 12.69, 'stop_lon': 77.29},
        'just_outside_max': {'stop_lat': 13.21, 'stop_lon': 77.91}
    }


# ==================== Test Data Directory Fixtures ====================

@pytest.fixture
def temp_test_dir():
    """Create temporary directory for test files"""
    temp_dir = tempfile.mkdtemp()
    yield Path(temp_dir)
    # Cleanup
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def mock_gtfs_files(temp_test_dir, sample_stops_df, sample_routes_df, 
                    sample_fare_attributes_df, sample_fare_rules_df):
    """Create temporary GTFS files for testing"""
    gtfs_dir = temp_test_dir / 'gtfs'
    gtfs_dir.mkdir(parents=True, exist_ok=True)
    
    # Write CSV files
    sample_stops_df.to_csv(gtfs_dir / 'stops.txt', index=False)
    sample_routes_df.to_csv(gtfs_dir / 'routes.txt', index=False)
    sample_fare_attributes_df.to_csv(gtfs_dir / 'fare_attributes.txt', index=False)
    sample_fare_rules_df.to_csv(gtfs_dir / 'fare_rules.txt', index=False)
    
    yield gtfs_dir


# ==================== Helper Functions ====================

@pytest.fixture
def assert_valid_prediction_response():
    """Helper to validate prediction response structure"""
    def _assert_valid(response_data):
        assert 'success' in response_data
        assert 'prediction' in response_data
        assert 'crowd_level' in response_data['prediction']
        assert 'crowd_level_code' in response_data['prediction']
        assert 'confidence' in response_data['prediction']
        assert 'probabilities' in response_data['prediction']
        assert 'input' in response_data
        return True
    return _assert_valid


@pytest.fixture
def assert_valid_fare_response():
    """Helper to validate fare response structure"""
    def _assert_valid(response_data):
        assert 'origin' in response_data
        assert 'destination' in response_data
        assert 'fare' in response_data
        assert 'currency' in response_data
        assert 'total' in response_data
        return True
    return _assert_valid
