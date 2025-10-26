"""
Tests for Fare API

Tests all fare API endpoints using the real Flask application.
"""

import pytest
import sys
import json
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.mark.api
@pytest.mark.fare
@pytest.mark.integration
class TestFareAPIHealth:
    """Test health check endpoints"""
    
    def test_health_check(self, fare_client):
        """Test health check endpoint"""
        response = fare_client.get('/api/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert data['service'] == 'BMTC Fare Calculation Service'
    
    def test_health_check_alternate_endpoint(self, fare_client):
        """Test alternate health check endpoint"""
        response = fare_client.get('/api/fare/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'healthy'


@pytest.mark.api
@pytest.mark.fare
@pytest.mark.integration
class TestStopsEndpoint:
    """Test stops-related endpoints"""
    
    def test_get_all_stops(self, fare_client):
        """Test getting all stops"""
        response = fare_client.get('/api/stops')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'stops' in data
        assert 'count' in data
        assert data['count'] > 0
        assert len(data['stops']) == data['count']
        
        # Verify stop structure
        if len(data['stops']) > 0:
            stop = data['stops'][0]
            assert 'stop_id' in stop
            assert 'stop_name' in stop
    
    def test_get_stops_alternate_endpoint(self, fare_client):
        """Test alternate stops endpoint"""
        response = fare_client.get('/api/fare/stops')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'stops' in data
    
    def test_search_stops_with_query(self, fare_client):
        """Test searching stops by name"""
        response = fare_client.get('/api/stops/search?q=Majestic')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'stops' in data
        assert 'count' in data
        assert 'query' in data
        assert data['query'] == 'majestic'
        
        # Should find at least one stop
        assert len(data['stops']) > 0
        
        # Verify search results contain query
        for stop in data['stops']:
            assert 'majestic' in stop['stop_name'].lower()
    
    def test_search_stops_empty_query(self, fare_client):
        """Test searching stops with empty query"""
        response = fare_client.get('/api/stops/search?q=')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['stops'] == []
    
    def test_search_stops_no_results(self, fare_client):
        """Test searching stops with query that returns no results"""
        response = fare_client.get('/api/stops/search?q=NonExistentStop123XYZ')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['count'] == 0
        assert len(data['stops']) == 0
    
    def test_search_stops_alternate_endpoint(self, fare_client):
        """Test alternate search endpoint"""
        response = fare_client.get('/api/fare/stops/search?q=Majestic')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'stops' in data


@pytest.mark.api
@pytest.mark.fare
@pytest.mark.integration
class TestCalculateFareEndpoint:
    """Test fare calculation endpoint"""
    
    def test_calculate_fare_valid_request(self, fare_client, valid_fare_request):
        """Test fare calculation with valid request"""
        response = fare_client.post(
            '/api/calculate_fare',
            data=json.dumps(valid_fare_request),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Verify response structure
        assert 'origin' in data
        assert 'destination' in data
        assert 'fare' in data
        assert 'currency' in data
        assert 'total' in data
        
        # Verify data types
        assert isinstance(data['fare'], (int, float))
        assert isinstance(data['total'], (int, float))
        assert data['currency'] == 'INR'
        
        # Total should include GST
        assert data['total'] >= data['fare']
    
    def test_calculate_fare_alternate_endpoint(self, fare_client, valid_fare_request):
        """Test alternate fare calculation endpoint"""
        response = fare_client.post(
            '/api/fare/calculate',
            data=json.dumps(valid_fare_request),
            content_type='application/json'
        )
        
        assert response.status_code == 200
    
    def test_calculate_fare_missing_origin(self, fare_client):
        """Test fare calculation with missing origin"""
        request_data = {'destination': 'Koramangala'}
        
        response = fare_client.post(
            '/api/calculate_fare',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_calculate_fare_missing_destination(self, fare_client):
        """Test fare calculation with missing destination"""
        request_data = {'origin': 'Majestic'}
        
        response = fare_client.post(
            '/api/calculate_fare',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
    
    def test_calculate_fare_same_stops(self, fare_client):
        """Test fare calculation with same origin and destination"""
        request_data = {
            'origin': 'Majestic',
            'destination': 'Majestic'
        }
        
        response = fare_client.post(
            '/api/calculate_fare',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'cannot be the same' in str(data)
    
    def test_calculate_fare_stop_not_found(self, fare_client):
        """Test fare calculation with non-existent stop"""
        request_data = {
            'origin': 'NonExistentStop123',
            'destination': 'AnotherFakeStop456'
        }
        
        response = fare_client.post(
            '/api/calculate_fare',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'not found' in data['error'].lower()
    
    def test_calculate_fare_without_route_id(self, fare_client):
        """Test fare calculation without route_id (should work)"""
        request_data = {
            'origin': 'Majestic',
            'destination': 'Koramangala'
        }
        
        response = fare_client.post(
            '/api/calculate_fare',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'fare' in data


@pytest.mark.api
@pytest.mark.fare
@pytest.mark.integration
class TestJourneyPlanEndpoint:
    """Test journey planning endpoint"""
    
    def test_plan_journey_valid(self, fare_client):
        """Test journey planning with valid stops"""
        response = fare_client.get('/api/journey/plan?fromStop=Majestic&toStop=Koramangala')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify journey structure
        journey = data[0]
        assert 'route' in journey
        assert 'stops' in journey
        assert 'metrics' in journey
        
        # Verify route structure
        assert 'routeId' in journey['route']
        assert 'routeShortName' in journey['route']
        
        # Verify stops structure
        assert len(journey['stops']) >= 2
        assert 'stopName' in journey['stops'][0]
        
        # Verify metrics
        assert 'distance' in journey['metrics']
        assert 'fare' in journey['metrics']
    
    def test_plan_journey_missing_from_stop(self, fare_client):
        """Test journey planning with missing fromStop"""
        response = fare_client.get('/api/journey/plan?toStop=Koramangala')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'fromStop' in str(data)
    
    def test_plan_journey_missing_to_stop(self, fare_client):
        """Test journey planning with missing toStop"""
        response = fare_client.get('/api/journey/plan?fromStop=Majestic')
        
        assert response.status_code == 400
    
    def test_plan_journey_same_stops(self, fare_client):
        """Test journey planning with same fromStop and toStop"""
        response = fare_client.get('/api/journey/plan?fromStop=Majestic&toStop=Majestic')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'cannot be the same' in str(data)
    
    def test_plan_journey_stop_not_found(self, fare_client):
        """Test journey planning with non-existent stop"""
        response = fare_client.get('/api/journey/plan?fromStop=FakeStop&toStop=AnotherFake')
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'not found' in data['error'].lower()


@pytest.mark.api
@pytest.mark.fare
@pytest.mark.integration
class TestFareAPIEdgeCases:
    """Test edge cases and special scenarios"""
    
    def test_stops_search_partial_match(self, fare_client):
        """Test stops search with partial match"""
        response = fare_client.get('/api/stops/search?q=Maj')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        # Should find stops starting with or containing 'Maj'
        if data['count'] > 0:
            assert any('maj' in stop['stop_name'].lower() for stop in data['stops'])
    
    def test_stops_search_case_insensitive(self, fare_client):
        """Test that stops search is case-insensitive"""
        response1 = fare_client.get('/api/stops/search?q=majestic')
        response2 = fare_client.get('/api/stops/search?q=MAJESTIC')
        response3 = fare_client.get('/api/stops/search?q=Majestic')
        
        data1 = json.loads(response1.data)
        data2 = json.loads(response2.data)
        data3 = json.loads(response3.data)
        
        # All should return the same results
        assert data1['count'] == data2['count'] == data3['count']
    
    def test_fare_calculation_with_whitespace(self, fare_client):
        """Test fare calculation handles whitespace in stop names"""
        request_data = {
            'origin': '  Majestic  ',
            'destination': '  Koramangala  '
        }
        
        response = fare_client.post(
            '/api/calculate_fare',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        # Should handle whitespace and find stops
        assert response.status_code == 200
    
    def test_journey_with_shapes_data(self, fare_client):
        """Test journey planning includes shapes data"""
        response = fare_client.get('/api/journey/plan?fromStop=Majestic&toStop=Koramangala')
        
        if response.status_code == 200:
            data = json.loads(response.data)
            if len(data) > 0:
                journey = data[0]
                assert 'shapes' in journey
                # Shapes should be a list of coordinate points
                if journey['shapes']:
                    assert isinstance(journey['shapes'], list)
                    if len(journey['shapes']) > 0:
                        shape_point = journey['shapes'][0]
                        assert 'shapePtLat' in shape_point
                        assert 'shapePtLon' in shape_point


@pytest.mark.api
@pytest.mark.fare
@pytest.mark.integration
class TestFareAPIWithMockedData:
    """Test API behavior with mocked GTFS data"""
    
    def test_gtfs_data_loading(self, fare_client):
        """Test that GTFS data is properly loaded"""
        # Health check should confirm service is working
        response = fare_client.get('/api/health')
        assert response.status_code == 200
        
        # Stops endpoint should return data
        response = fare_client.get('/api/stops')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['count'] > 0
    
    def test_fare_calculation_uses_gtfs_data(self, fare_client):
        """Test that fare calculation uses GTFS data"""
        request_data = {
            'origin': 'Majestic',
            'destination': 'Koramangala'
        }
        
        response = fare_client.post(
            '/api/calculate_fare',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        
        # Should have calculated fare from GTFS data
        assert data['fare'] > 0
        assert 'source' in data
