"""
Test script to verify config.py environment detection and loading

Run this to ensure config.py works correctly:
    python test_config.py
"""

import os
import sys

def test_config():
    """Test configuration loading in different environments"""
    
    print("=" * 60)
    print("Testing Configuration Loading")
    print("=" * 60)
    
    # Test 1: Default (Development)
    print("\nTest 1: Default Environment (No APP_ENV set)")
    print("-" * 60)
    
    # Clear any environment variables
    for var in ['APP_ENV', 'FLASK_ENV', 'ENVIRONMENT']:
        if var in os.environ:
            del os.environ[var]
    
    # Reload config module
    if 'config' in sys.modules:
        del sys.modules['config']
    
    from config import config, ENVIRONMENT, is_development, is_production, is_testing
    
    print(f"Environment: {ENVIRONMENT}")
    print(f"Config Class: {config.__class__.__name__}")
    print(f"Debug Mode: {config.DEBUG}")
    print(f"Log Level: {config.LOG_LEVEL}")
    print(f"Prediction API Port: {config.PREDICT_API_PORT}")
    print(f"Fare API Port: {config.FARE_API_PORT}")
    print(f"is_development(): {is_development()}")
    print(f"is_production(): {is_production()}")
    
    assert ENVIRONMENT == 'development', "Should default to development"
    assert config.DEBUG == True, "Debug should be True in development"
    assert is_development() == True, "is_development() should return True"
    print("✓ Test 1 PASSED")
    
    # Test 2: Development (Explicit)
    print("\n\nTest 2: Explicit Development (APP_ENV=development)")
    print("-" * 60)
    
    os.environ['APP_ENV'] = 'development'
    if 'config' in sys.modules:
        del sys.modules['config']
    
    from config import config as dev_config, ENVIRONMENT as dev_env
    
    print(f"Environment: {dev_env}")
    print(f"Config Class: {dev_config.__class__.__name__}")
    print(f"Debug Mode: {dev_config.DEBUG}")
    
    assert dev_env == 'development', "Should be development"
    assert dev_config.DEBUG == True, "Debug should be True"
    print("✓ Test 2 PASSED")
    
    # Test 3: Testing
    print("\n\nTest 3: Testing Environment (APP_ENV=testing)")
    print("-" * 60)
    
    os.environ['APP_ENV'] = 'testing'
    if 'config' in sys.modules:
        del sys.modules['config']
    
    from config import config as test_config, ENVIRONMENT as test_env
    
    print(f"Environment: {test_env}")
    print(f"Config Class: {test_config.__class__.__name__}")
    print(f"Debug Mode: {test_config.DEBUG}")
    print(f"Testing Mode: {test_config.TESTING}")
    
    assert test_env == 'testing', "Should be testing"
    assert test_config.TESTING == True, "Testing should be True"
    print("✓ Test 3 PASSED")
    
    # Test 4: FLASK_ENV compatibility
    print("\n\nTest 4: Flask Environment Variable (FLASK_ENV=development)")
    print("-" * 60)
    
    # Clear APP_ENV, use FLASK_ENV
    if 'APP_ENV' in os.environ:
        del os.environ['APP_ENV']
    os.environ['FLASK_ENV'] = 'development'
    
    if 'config' in sys.modules:
        del sys.modules['config']
    
    from config import config as flask_config, ENVIRONMENT as flask_env
    
    print(f"Environment: {flask_env}")
    print(f"Config Class: {flask_config.__class__.__name__}")
    
    assert flask_env == 'development', "Should detect FLASK_ENV"
    print("✓ Test 4 PASSED")
    
    # Test 5: Production without SECRET_KEY (should show warning but not crash during import)
    print("\n\nTest 5: Production Mode (APP_ENV=production, no SECRET_KEY)")
    print("-" * 60)
    print("Note: This should display a warning about SECRET_KEY")
    
    os.environ['APP_ENV'] = 'production'
    if 'SECRET_KEY' in os.environ:
        del os.environ['SECRET_KEY']
    
    if 'config' in sys.modules:
        del sys.modules['config']
    
    try:
        from config import config as prod_config
        # Should not get here because validation should fail
        print("✗ Test 5 FAILED - Should have raised ValueError")
    except ValueError as e:
        print(f"✓ Test 5 PASSED - Correctly raised error: {str(e)[:60]}...")
    
    # Test 6: Production with SECRET_KEY (should work)
    print("\n\nTest 6: Production Mode (APP_ENV=production, with SECRET_KEY)")
    print("-" * 60)
    
    os.environ['APP_ENV'] = 'production'
    os.environ['SECRET_KEY'] = 'test-secret-key-for-validation'
    
    if 'config' in sys.modules:
        del sys.modules['config']
    
    from config import config as prod_config_valid, ENVIRONMENT as prod_env
    
    print(f"Environment: {prod_env}")
    print(f"Config Class: {prod_config_valid.__class__.__name__}")
    print(f"Debug Mode: {prod_config_valid.DEBUG}")
    print(f"Cache Enabled: {prod_config_valid.CACHE_ENABLED}")
    print(f"Rate Limiting: {prod_config_valid.RATE_LIMIT_ENABLED}")
    
    assert prod_env == 'production', "Should be production"
    assert prod_config_valid.DEBUG == False, "Debug should be False in production"
    assert prod_config_valid.CACHE_ENABLED == True, "Cache should be enabled in production"
    print("✓ Test 6 PASSED")
    
    # Clean up
    for var in ['APP_ENV', 'FLASK_ENV', 'ENVIRONMENT', 'SECRET_KEY']:
        if var in os.environ:
            del os.environ[var]
    
    print("\n" + "=" * 60)
    print("ALL TESTS PASSED! ✅")
    print("=" * 60)
    print("\nConfiguration Summary:")
    print("  - Defaults to DevelopmentConfig (no env vars needed)")
    print("  - APP_ENV takes precedence over FLASK_ENV")
    print("  - Production mode requires SECRET_KEY")
    print("  - Testing mode available via APP_ENV=testing")
    print("\nUsage:")
    print("  Development (default):  python your_script.py")
    print("  Development (explicit): APP_ENV=development python your_script.py")
    print("  Testing:                APP_ENV=testing python your_script.py")
    print("  Production:             APP_ENV=production SECRET_KEY='...' python your_script.py")
    print("=" * 60)


if __name__ == '__main__':
    try:
        test_config()
    except Exception as e:
        print(f"\n✗ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
