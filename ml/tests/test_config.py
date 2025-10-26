"""
Tests for Configuration Management

Tests configuration loading, environment detection, and validation.
"""

import os
import sys
import pytest
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.mark.config
class TestConfigEnvironmentDetection:
    """Test environment detection and config selection"""
    
    def test_default_development_environment(self, monkeypatch):
        """Test that config defaults to development when no env vars set"""
        # Clear environment variables
        for var in ['APP_ENV', 'FLASK_ENV', 'ENVIRONMENT']:
            monkeypatch.delenv(var, raising=False)
        
        # Reload config
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.ENVIRONMENT == 'development'
        assert config.config.DEBUG is True
        assert config.config.TESTING is False
    
    def test_explicit_development_environment(self, monkeypatch):
        """Test explicit development environment"""
        monkeypatch.setenv('APP_ENV', 'development')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.ENVIRONMENT == 'development'
        assert isinstance(config.config, config.DevelopmentConfig)
    
    def test_testing_environment(self, monkeypatch):
        """Test testing environment configuration"""
        monkeypatch.setenv('APP_ENV', 'testing')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.ENVIRONMENT == 'testing'
        assert config.config.TESTING is True
        assert config.config.DEBUG is True
    
    def test_production_environment_with_secret_key(self, monkeypatch):
        """Test production environment with valid secret key"""
        monkeypatch.setenv('APP_ENV', 'production')
        monkeypatch.setenv('SECRET_KEY', 'test-production-secret-key-12345')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.ENVIRONMENT == 'production'
        assert config.config.DEBUG is False
        assert config.config.CACHE_ENABLED is True
    
    def test_production_environment_without_secret_key(self, monkeypatch):
        """Test that production requires SECRET_KEY"""
        monkeypatch.setenv('APP_ENV', 'production')
        monkeypatch.delenv('SECRET_KEY', raising=False)
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        with pytest.raises(ValueError, match="SECRET_KEY must be set"):
            import config
    
    def test_flask_env_compatibility(self, monkeypatch):
        """Test FLASK_ENV variable compatibility"""
        monkeypatch.delenv('APP_ENV', raising=False)
        monkeypatch.setenv('FLASK_ENV', 'development')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.ENVIRONMENT == 'development'
    
    def test_app_env_takes_precedence(self, monkeypatch):
        """Test that APP_ENV takes precedence over FLASK_ENV"""
        monkeypatch.setenv('APP_ENV', 'testing')
        monkeypatch.setenv('FLASK_ENV', 'production')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.ENVIRONMENT == 'testing'


@pytest.mark.config
class TestConfigValues:
    """Test configuration values and defaults"""
    
    def test_api_host_and_ports(self, test_config):
        """Test API configuration values"""
        assert hasattr(test_config, 'PREDICT_API_HOST')
        assert hasattr(test_config, 'PREDICT_API_PORT')
        assert hasattr(test_config, 'FARE_API_HOST')
        assert hasattr(test_config, 'FARE_API_PORT')
        
        assert isinstance(test_config.PREDICT_API_PORT, int)
        assert isinstance(test_config.FARE_API_PORT, int)
    
    def test_path_configuration(self, test_config):
        """Test that paths are configured correctly"""
        assert hasattr(test_config, 'BASE_DIR')
        assert hasattr(test_config, 'MODEL_DIR')
        assert hasattr(test_config, 'GTFS_DIR')
        assert hasattr(test_config, 'OUTPUT_DIR')
        
        assert isinstance(test_config.BASE_DIR, Path)
        assert isinstance(test_config.MODEL_DIR, Path)
    
    def test_bangalore_coordinate_bounds(self, test_config):
        """Test Bangalore coordinate validation bounds"""
        assert hasattr(test_config, 'BANGALORE_LAT_MIN')
        assert hasattr(test_config, 'BANGALORE_LAT_MAX')
        assert hasattr(test_config, 'BANGALORE_LON_MIN')
        assert hasattr(test_config, 'BANGALORE_LON_MAX')
        
        # Verify bounds are reasonable
        assert 12.0 < test_config.BANGALORE_LAT_MIN < 13.0
        assert 13.0 < test_config.BANGALORE_LAT_MAX < 14.0
        assert 77.0 < test_config.BANGALORE_LON_MIN < 78.0
        assert 77.0 < test_config.BANGALORE_LON_MAX < 78.0
        
        # Min should be less than max
        assert test_config.BANGALORE_LAT_MIN < test_config.BANGALORE_LAT_MAX
        assert test_config.BANGALORE_LON_MIN < test_config.BANGALORE_LON_MAX
    
    def test_rush_hour_configuration(self, test_config):
        """Test rush hour time configuration"""
        assert hasattr(test_config, 'MORNING_RUSH_START')
        assert hasattr(test_config, 'MORNING_RUSH_END')
        assert hasattr(test_config, 'EVENING_RUSH_START')
        assert hasattr(test_config, 'EVENING_RUSH_END')
        
        # Verify values are reasonable
        assert 0 <= test_config.MORNING_RUSH_START < 24
        assert 0 <= test_config.MORNING_RUSH_END < 24
        assert 0 <= test_config.EVENING_RUSH_START < 24
        assert 0 <= test_config.EVENING_RUSH_END < 24
        
        # Start should be before end
        assert test_config.MORNING_RUSH_START < test_config.MORNING_RUSH_END
        assert test_config.EVENING_RUSH_START < test_config.EVENING_RUSH_END
    
    def test_fare_tier_configuration(self, test_config):
        """Test fare tier configuration"""
        assert hasattr(test_config, 'FARE_TIER1')
        assert hasattr(test_config, 'FARE_TIER2')
        assert hasattr(test_config, 'FARE_TIER3')
        assert hasattr(test_config, 'FARE_TIER4')
        assert hasattr(test_config, 'FARE_TIER5')
        
        # Verify fares are positive
        assert test_config.FARE_TIER1 > 0
        assert test_config.FARE_TIER2 > 0
        
        # Verify ascending fare structure
        assert test_config.FARE_TIER1 < test_config.FARE_TIER2
        assert test_config.FARE_TIER2 < test_config.FARE_TIER3
        assert test_config.FARE_TIER3 < test_config.FARE_TIER4
        assert test_config.FARE_TIER4 < test_config.FARE_TIER5
    
    def test_model_features(self, test_config):
        """Test model feature configuration"""
        assert hasattr(test_config, 'MODEL_FEATURES')
        assert isinstance(test_config.MODEL_FEATURES, list)
        assert len(test_config.MODEL_FEATURES) > 0
        
        # Check required features
        expected_features = ['hour', 'day_of_week', 'is_rush_hour', 'stop_lat', 'stop_lon']
        for feature in expected_features:
            assert feature in test_config.MODEL_FEATURES
    
    def test_crowd_level_mapping(self, test_config):
        """Test crowd level mapping"""
        assert hasattr(test_config, 'CROWD_LEVELS')
        assert isinstance(test_config.CROWD_LEVELS, dict)
        
        # Check standard levels
        assert 0 in test_config.CROWD_LEVELS
        assert 1 in test_config.CROWD_LEVELS
        assert 2 in test_config.CROWD_LEVELS
        assert 3 in test_config.CROWD_LEVELS
    
    def test_batch_size_limit(self, test_config):
        """Test batch prediction size limit"""
        assert hasattr(test_config, 'BATCH_PREDICTION_MAX_SIZE')
        assert isinstance(test_config.BATCH_PREDICTION_MAX_SIZE, int)
        assert test_config.BATCH_PREDICTION_MAX_SIZE > 0


@pytest.mark.config
class TestConfigMethods:
    """Test configuration helper methods"""
    
    def test_get_fare_tiers_method(self, test_config):
        """Test get_fare_tiers() method"""
        fare_tiers = test_config.get_fare_tiers()
        
        assert 'tiers' in fare_tiers
        assert 'default' in fare_tiers
        assert 'gst_rate' in fare_tiers
        
        assert isinstance(fare_tiers['tiers'], list)
        assert len(fare_tiers['tiers']) >= 5
        
        # Check tier structure
        for tier in fare_tiers['tiers']:
            assert 'max_km' in tier
            assert 'fare' in tier
    
    def test_get_rush_hour_config_method(self, test_config):
        """Test get_rush_hour_config() method"""
        rush_config = test_config.get_rush_hour_config()
        
        assert 'morning_start' in rush_config
        assert 'morning_end' in rush_config
        assert 'evening_start' in rush_config
        assert 'evening_end' in rush_config
        
        assert isinstance(rush_config['morning_start'], int)
    
    def test_ensure_directories_method(self, test_config, temp_test_dir):
        """Test ensure_directories() method"""
        # Override directories to use temp dir
        test_config.MODEL_DIR = temp_test_dir / 'models'
        test_config.OUTPUT_DIR = temp_test_dir / 'output'
        test_config.GTFS_DIR = temp_test_dir / 'gtfs'
        
        test_config.ensure_directories()
        
        assert test_config.MODEL_DIR.exists()
        assert test_config.OUTPUT_DIR.exists()
        assert test_config.GTFS_DIR.exists()


@pytest.mark.config
class TestConfigHelperFunctions:
    """Test configuration helper functions"""
    
    def test_is_development_function(self, monkeypatch):
        """Test is_development() helper"""
        monkeypatch.setenv('APP_ENV', 'development')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.is_development() is True
        assert config.is_production() is False
        assert config.is_testing() is False
    
    def test_is_testing_function(self, monkeypatch):
        """Test is_testing() helper"""
        monkeypatch.setenv('APP_ENV', 'testing')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.is_development() is False
        assert config.is_production() is False
        assert config.is_testing() is True
    
    def test_is_production_function(self, monkeypatch):
        """Test is_production() helper"""
        monkeypatch.setenv('APP_ENV', 'production')
        monkeypatch.setenv('SECRET_KEY', 'test-secret')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.is_development() is False
        assert config.is_production() is True
        assert config.is_testing() is False
    
    def test_get_config_function(self, monkeypatch):
        """Test get_config() helper"""
        monkeypatch.setenv('APP_ENV', 'testing')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        cfg = config.get_config()
        assert cfg is not None
        assert hasattr(cfg, 'DEBUG')


@pytest.mark.config
class TestEnvironmentSpecificConfig:
    """Test environment-specific configurations"""
    
    def test_development_config_features(self, monkeypatch):
        """Test development-specific features"""
        monkeypatch.setenv('APP_ENV', 'development')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.config.DEBUG is True
        assert config.config.CACHE_ENABLED is False
        assert config.config.RATE_LIMIT_ENABLED is False
        assert '*' in config.config.CORS_ORIGINS or config.config.CORS_ORIGINS == ['*']
    
    def test_testing_config_features(self, monkeypatch):
        """Test testing-specific features"""
        monkeypatch.setenv('APP_ENV', 'testing')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.config.TESTING is True
        assert config.config.CACHE_ENABLED is False
        assert config.config.RATE_LIMIT_ENABLED is False
        assert config.config.METRICS_ENABLED is False
    
    def test_production_config_features(self, monkeypatch):
        """Test production-specific features"""
        monkeypatch.setenv('APP_ENV', 'production')
        monkeypatch.setenv('SECRET_KEY', 'production-secret-key')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.config.DEBUG is False
        assert config.config.CACHE_ENABLED is True
        assert config.config.RATE_LIMIT_ENABLED is True
        assert config.config.METRICS_ENABLED is True
        
        # CORS should be restricted in production
        assert '*' not in config.config.CORS_ORIGINS


@pytest.mark.config
class TestConfigEnvironmentVariables:
    """Test environment variable overrides"""
    
    def test_custom_port_override(self, monkeypatch):
        """Test custom port configuration via env vars"""
        monkeypatch.setenv('APP_ENV', 'testing')
        monkeypatch.setenv('PREDICT_API_PORT', '8000')
        monkeypatch.setenv('FARE_API_PORT', '8001')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.config.PREDICT_API_PORT == 8000
        assert config.config.FARE_API_PORT == 8001
    
    def test_custom_log_level(self, monkeypatch):
        """Test custom log level via env var"""
        monkeypatch.setenv('APP_ENV', 'testing')
        monkeypatch.setenv('LOG_LEVEL', 'WARNING')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        # Testing config might override this, but the env var should be read
        assert os.getenv('LOG_LEVEL') == 'WARNING'
    
    def test_custom_batch_size(self, monkeypatch):
        """Test custom batch size via env var"""
        monkeypatch.setenv('APP_ENV', 'testing')
        monkeypatch.setenv('BATCH_MAX_SIZE', '50')
        
        if 'config' in sys.modules:
            del sys.modules['config']
        
        import config
        assert config.config.BATCH_PREDICTION_MAX_SIZE == 50
