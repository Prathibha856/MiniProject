"""
BMTC Journey Planner - Diagnostic and Fix Script
Run this to identify and fix backend connection issues
"""

import os
import sys
from pathlib import Path
import requests
import subprocess
import time

def check_port(port):
    """Check if a port is in use"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', port))
    sock.close()
    return result == 0

def test_backend_endpoint(url, name):
    """Test if backend endpoint is accessible"""
    try:
        response = requests.get(url, timeout=5)
        print(f"✅ {name}: {response.status_code} - {response.text[:100]}")
        return True
    except requests.exceptions.ConnectionError:
        print(f"❌ {name}: Connection refused - Backend not running!")
        return False
    except Exception as e:
        print(f"❌ {name}: {str(e)}")
        return False

def check_gtfs_data():
    """Check if GTFS data exists"""
    gtfs_dir = Path(__file__).parent / 'dataset' / 'gtfs'
    required_files = ['stops.txt', 'routes.txt', 'shapes.txt', 'fare_attributes.txt', 'fare_rules.txt']
    
    print("\n🗺️  GTFS Data Check:")
    all_exist = True
    for file in required_files:
        file_path = gtfs_dir / file
        if file_path.exists():
            size = file_path.stat().st_size / (1024 * 1024)  # MB
            print(f"   ✅ {file}: {size:.2f} MB")
        else:
            print(f"   ❌ {file}: NOT FOUND")
            all_exist = False
    
    return all_exist

def main():
    print("="*60)
    print("BMTC Journey Planner - Diagnostic Tool")
    print("="*60)
    
    # 1. Check ports
    print("\n🔌 Port Status:")
    port_5000 = check_port(5000)
    port_5001 = check_port(5001)
    port_3001 = check_port(3001)
    
    print(f"   Port 5000 (Prediction API): {'🟢 OPEN' if port_5000 else '🔴 CLOSED'}")
    print(f"   Port 5001 (Fare API): {'🟢 OPEN' if port_5001 else '🔴 CLOSED'}")
    print(f"   Port 3001 (React): {'🟢 OPEN' if port_3001 else '🔴 CLOSED'}")
    
    # 2. Test endpoints
    print("\n🌐 Backend API Tests:")
    if port_5001:
        test_backend_endpoint("http://localhost:5001/api/health", "Health Check")
        test_backend_endpoint("http://localhost:5001/api/stops", "Stops Endpoint")
    else:
        print("   ⚠️  Port 5001 not open - fare_service.py not running!")
    
    # 3. Check GTFS data
    gtfs_ok = check_gtfs_data()
    
    # 4. Check config
    print("\n⚙️  Configuration Check:")
    try:
        from config import config
        print(f"   ✅ FARE_API_HOST: {config.FARE_API_HOST}")
        print(f"   ✅ FARE_API_PORT: {config.FARE_API_PORT}")
        print(f"   ✅ CORS_ORIGINS: {config.CORS_ORIGINS}")
        print(f"   ✅ GTFS_DIR: {config.GTFS_DIR}")
    except Exception as e:
        print(f"   ❌ Config error: {e}")
    
    # 5. Provide recommendations
    print("\n" + "="*60)
    print("🔧 RECOMMENDATIONS:")
    print("="*60)
    
    if not port_5001:
        print("\n❗ CRITICAL: fare_service.py is NOT running!")
        print("\n   To start it:")
        print("   1. Open a new terminal/PowerShell")
        print("   2. cd F:\\MiniProject\\ml")
        print("   3. python fare_service.py")
        print("\n   Watch for startup messages and errors!")
    
    if not gtfs_ok:
        print("\n❗ GTFS data files missing!")
        print("   Ensure all GTFS files are in: F:\\MiniProject\\ml\\dataset\\gtfs\\")
    
    if port_5001 and port_3001:
        print("\n✅ Both backend and frontend are running!")
        print("\n   Test the Journey Planner at: http://localhost:3001")
        print("\n   Test API directly:")
        print('   curl "http://localhost:5001/api/journey/plan?fromStop=Majestic&toStop=Whitefield"')
    
    # 6. Check for common errors
    print("\n" + "="*60)
    print("🔍 COMMON ISSUES:")
    print("="*60)
    print("""
1. Backend shows 'Running' but curl fails:
   - Check if it's bound to 127.0.0.1 vs 0.0.0.0
   - Look for startup errors in the terminal
   - GTFS data may have failed to load

2. CORS errors in browser console:
   - Ensure port 3001 is in CORS_ORIGINS
   - Restart fare_service.py after config changes

3. API returns 500 errors:
   - Check fare_api.log for errors
   - GTFS data may be corrupted
   - Missing required columns in GTFS files

4. Frontend shows nothing:
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API calls
   - Verify API URLs in .env file
    """)

if __name__ == '__main__':
    main()
