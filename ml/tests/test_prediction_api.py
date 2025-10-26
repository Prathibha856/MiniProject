"""
Tests for Prediction API

Tests all prediction API endpoints using the real Flask application.
"""

import pytest
import sys
import json
from pathlib import Path
from unittest.mock import patch, Mock
import numpy as np

sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.mark.api
@pytest.mark.prediction
@pytest.mark.integration
class TestPredictionAPIHealth:
    """Test health check endpoint"""
    
    def test_health_check_with_model_loaded(self, prediction_client):
        """Test health check when model is loaded"""
        response = prediction_client.get('/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert data['model_loaded'] is True
        assert 'features' in data
    
    def test_health_check_model_none(self):
        """Test health check when model is None"""
        with patch('predict_api.model', None):
            import predict_api
            predict_api.app.config['TESTING'] = True
            
            with predict_api.app.test_client() as client:
                response = client.get('/health')
                assert response.status_code == 200
                
                data = json.loads(response.data)
                assert data['status'] == 'healthy'
                assert data['model_loaded'] is False


@pytest.mark.api
@pytest.mark.prediction
@pytest.mark.integration
class TestPredictionEndpoint:
    """Test /predict endpoint"""
    
    def test_valid_prediction_request(self, prediction_client, valid_prediction_request):
        """Test prediction with valid request"""
        response = prediction_client.post(
            '/predict',
            data=json.dumps(valid_prediction_request),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Verify response structure
        assert data['success'] is True
        assert 'prediction' in data
        assert 'crowd_level' in data['prediction']
        assert 'crowd_level_code' in data['prediction']
        assert 'confidence' in data['prediction']
        assert 'probabilities' in data['prediction']
        assert 'input' in data
        
        # Verify prediction values
        assert data['prediction']['crowd_level'] in ['Low', 'Medium', 'High', 'Very High']
        assert 0 <= data['prediction']['crowd_level_code'] <= 3
        assert 0.0 <= data['prediction']['confidence'] <= 1.0
    
    def test_prediction_missing_latitude(self, prediction_client):
        """Test prediction with missing latitude"""
        request_data = {
            'stop_lon': 77.5946,
            'time': '14:30'
        }
        
        response = prediction_client.post(
            '/predict',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'error' in data
    
    def test_prediction_missing_longitude(self, prediction_client):
        """Test prediction with missing longitude"""
        request_data = {
            'stop_lat': 12.9716,
            'time': '14:30'
        }
        
        response = prediction_client.post(
            '/predict',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_prediction_out_of_bounds_coordinates(self, prediction_client):
        """Test prediction with coordinates outside Bangalore"""
        request_data = {
            'stop_lat': 15.0,  # Outside Bangalore
            'stop_lon': 77.5946
        }
        
        response = prediction_client.post(
            '/predict',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'Bangalore bounds' in str(data)
    
    def test_prediction_invalid_time_format(self, prediction_client):
        """Test prediction with invalid time format"""
        request_data = {
            'stop_lat': 12.9716,
            'stop_lon': 77.5946,
            'time': '25:00'  # Invalid time
        }
        
        response = prediction_client.post(
            '/predict',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'HH:MM' in str(data)
    
    def test_prediction_without_optional_fields(self, prediction_client):
        """Test prediction with only required fields"""
        request_data = {
            'stop_lat': 12.9716,
            'stop_lon': 77.5946
        }
        
        response = prediction_client.post(
            '/predict',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
    
    def test_prediction_with_model_none(self):
        """Test prediction when model is not loaded"""
        with patch('predict_api.model', None):
            import predict_api
            predict_api.app.config['TESTING'] = True
            
            with predict_api.app.test_client() as client:
                response = client.post(
                    '/predict',
                    data=json.dumps({'stop_lat': 12.9716, 'stop_lon': 77.5946}),
                    content_type='application/json'
                )
                
                assert response.status_code == 500
                data = json.loads(response.data)
                assert 'Model not loaded' in data['error']


@pytest.mark.api
@pytest.mark.prediction
@pytest.mark.integration
class TestBatchPredictionEndpoint:
    """Test /predict/batch endpoint"""
    
    def test_valid_batch_request(self, prediction_client, valid_batch_request):
        """Test batch prediction with valid requests"""
        response = prediction_client.post(
            '/predict/batch',
            data=json.dumps(valid_batch_request),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert data['success'] is True
        assert 'predictions' in data
        assert len(data['predictions']) == 3
        
        # Verify each prediction has required fields
        for pred in data['predictions']:
            assert 'crowd_level' in pred
            assert 'stop_lat' in pred
            assert 'stop_lon' in pred
    
    def test_batch_missing_requests_field(self, prediction_client):
        """Test batch prediction without requests field"""
        response = prediction_client.post(
            '/predict/batch',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'Missing required field: requests' in str(data)
    
    def test_batch_empty_requests(self, prediction_client):
        """Test batch prediction with empty requests array"""
        response = prediction_client.post(
            '/predict/batch',
            data=json.dumps({'requests': []}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'cannot be empty' in str(data)
    
    def test_batch_exceeds_size_limit(self, prediction_client, valid_prediction_request):
        """Test batch exceeding maximum size"""
        large_batch = {'requests': [valid_prediction_request] * 150}
        
        response = prediction_client.post(
            '/predict/batch',
            data=json.dumps(large_batch),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'exceeds maximum' in str(data)
    
    def test_batch_with_invalid_request(self, prediction_client, valid_prediction_request):
        """Test batch with one invalid request"""
        mixed_batch = {
            'requests': [
                valid_prediction_request,
                {'stop_lat': 15.0, 'stop_lon': 77.5946}  # Invalid - out of bounds
            ]
        }
        
        response = prediction_client.post(
            '/predict/batch',
            data=json.dumps(mixed_batch),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'Request 2' in str(data)
    
    def test_batch_with_model_none(self):
        """Test batch prediction when model is not loaded"""
        with patch('predict_api.model', None):
            import predict_api
            predict_api.app.config['TESTING'] = True
            
            with predict_api.app.test_client() as client:
                response = client.post(
                    '/predict/batch',
                    data=json.dumps({'requests': [{'stop_lat': 12.9716, 'stop_lon': 77.5946}]}),
                    content_type='application/json'
                )
                
                assert response.status_code == 500


@pytest.mark.api
@pytest.mark.prediction
@pytest.mark.integration
class TestModelInfoEndpoint:
    """Test /model/info endpoint"""
    
    def test_model_info_with_model(self, prediction_client):
        """Test model info when model is loaded"""
        response = prediction_client.get('/model/info')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        assert 'model_type' in data
        assert 'features' in data
        assert 'classes' in data or 'n_features' in data
    
    def test_model_info_without_model(self):
        """Test model info when model is not loaded"""
        with patch('predict_api.model', None):
            import predict_api
            predict_api.app.config['TESTING'] = True
            
            with predict_api.app.test_client() as client:
                response = client.get('/model/info')
                
                assert response.status_code == 404
                data = json.loads(response.data)
                assert 'Model not loaded' in data['error']


@pytest.mark.api
@pytest.mark.prediction
@pytest.mark.integration
class TestPredictionAPIEdgeCases:
    """Test edge cases and special scenarios"""
    
    def test_prediction_with_boundary_coordinates(self, prediction_client):
        """Test prediction at Bangalore boundary coordinates"""
        # Test minimum boundary
        request_data = {'stop_lat': 12.7, 'stop_lon': 77.3}
        response = prediction_client.post(
            '/predict',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        assert response.status_code == 200
        
        # Test maximum boundary
        request_data = {'stop_lat': 13.2, 'stop_lon': 77.9}
        response = prediction_client.post(
            '/predict',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        assert response.status_code == 200
    
    def test_prediction_with_string_coordinates(self, prediction_client):
        """Test that string coordinates are properly converted"""
        request_data = {
            'stop_lat': '12.9716',
            'stop_lon': '77.5946'
        }
        
        response = prediction_client.post(
            '/predict',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
    
    def test_prediction_rush_hour_detection(self, prediction_client):
        """Test rush hour detection in predictions"""
        # Morning rush hour
        request_data = {
            'stop_lat': 12.9716,
            'stop_lon': 77.5946,
            'time': '08:00'
        }
        
        response = prediction_client.post(
            '/predict',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['input']['is_rush_hour'] == 1
        
        # Non-rush hour
        request_data['time'] = '14:00'
        response = prediction_client.post(
            '/predict',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        data = json.loads(response.data)
        assert data['input']['is_rush_hour'] == 0
