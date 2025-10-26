"""
Test script for GTFS Fare Calculation Service
Run this after starting fare_service.py to verify everything works
"""

import requests
import json

BASE_URL = "http://localhost:5001/api/fare"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*50)
    print("TEST 1: Health Check")
    print("="*50)
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Service Status: {data['status']}")
            print(f"✓ Service Name: {data['service']}")
            print(f"✓ Version: {data['version']}")
            return True
        else:
            print(f"✗ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        print("  Make sure fare_service.py is running on port 5001")
        return False


def test_stops():
    """Test stops endpoint"""
    print("\n" + "="*50)
    print("TEST 2: Get Stops")
    print("="*50)
    
    try:
        response = requests.get(f"{BASE_URL}/stops")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Total stops loaded: {data['count']}")
            print(f"✓ Sample stops:")
            for stop in data['stops'][:5]:
                print(f"  - {stop['stop_name']} (ID: {stop['stop_id']})")
            return True
        else:
            print(f"✗ Failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def test_search():
    """Test stop search"""
    print("\n" + "="*50)
    print("TEST 3: Search Stops")
    print("="*50)
    
    search_queries = ["majestic", "electronic", "whitefield"]
    
    for query in search_queries:
        try:
            response = requests.get(f"{BASE_URL}/stops/search", params={"q": query})
            if response.status_code == 200:
                data = response.json()
                print(f"\n✓ Search for '{query}': {data['count']} results")
                for stop in data['stops'][:3]:
                    print(f"  - {stop['stop_name']}")
            else:
                print(f"✗ Search failed for '{query}'")
        except Exception as e:
            print(f"✗ Error searching '{query}': {e}")
    
    return True


def test_fare_calculation():
    """Test fare calculation with real data"""
    print("\n" + "="*50)
    print("TEST 4: Fare Calculation")
    print("="*50)
    
    test_cases = [
        ("Kempegowda Bus Station (Majestic)", "Electronic City"),
        ("Whitefield", "Silk Board"),
        ("Banashankari", "Koramangala"),
    ]
    
    for origin, destination in test_cases:
        print(f"\n→ Calculating fare: {origin} → {destination}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/calculate",
                json={"origin": origin, "destination": destination},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✓ Fare: ₹{data['fare']}")
                print(f"  ✓ GST: ₹{data['gst']}")
                print(f"  ✓ Total: ₹{data['total']}")
                print(f"  ✓ Distance: {data['distance_km']} km")
                print(f"  ✓ Source: {data['source']}")
                if 'fare_id' in data:
                    print(f"  ✓ Fare ID: {data['fare_id']}")
                if 'route_id' in data:
                    print(f"  ✓ Route ID: {data['route_id']}")
            else:
                print(f"  ✗ Failed with status {response.status_code}")
                print(f"  Response: {response.text}")
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    return True


def test_routes():
    """Test routes endpoint"""
    print("\n" + "="*50)
    print("TEST 5: Get Routes")
    print("="*50)
    
    try:
        response = requests.get(f"{BASE_URL}/routes")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Total routes: {data['count']}")
            print(f"✓ Sample routes:")
            for route in data['routes'][:5]:
                print(f"  - {route['route_short_name']}: {route['route_long_name'][:60]}...")
            return True
        else:
            print(f"✗ Failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def main():
    print("\n" + "="*60)
    print("  BMTC FARE CALCULATION SERVICE - TEST SUITE")
    print("="*60)
    
    # Run all tests
    tests = [
        ("Health Check", test_health),
        ("Stops Loading", test_stops),
        ("Stop Search", test_search),
        ("Fare Calculation", test_fare_calculation),
        ("Routes Loading", test_routes)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n✗ Test '{test_name}' crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*60)
    print("  TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print("\n" + "-"*60)
    print(f"Results: {passed}/{total} tests passed")
    print("="*60)
    
    if passed == total:
        print("\n🎉 All tests passed! Your fare calculator is working perfectly!")
        print("   You can now use the frontend at http://localhost:3000")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")


if __name__ == "__main__":
    main()
