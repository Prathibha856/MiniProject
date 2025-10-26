"""
Configuration Management for BMTC Bus Crowd Prediction System

This module provides centralized configuration for all application settings,
supporting both development and production environments through environment variables.

Usage:
    from config import config
    
    app.run(host=config.PREDICT_API_HOST, port=config.PREDICT_API_PORT)
"""

import os
from pathlib import Path
from typing import List, Dict, Any


class Config:
    """Base configuration with default values"""
    
    # ==================== Base Paths ====================
    BASE_DIR = Path(__file__).parent.absolute()
    DATASET_DIR = BASE_DIR / 'dataset'
    GTFS_DIR = DATASET_DIR / 'gtfs'
    MODEL_DIR = BASE_DIR / 'models'
    OUTPUT_DIR = BASE_DIR / 'output'
    
    # ==================== API Configuration ====================
    # Prediction API
    PREDICT_API_HOST = os.getenv('PREDICT_API_HOST', '0.0.0.0')
    PREDICT_API_PORT = int(os.getenv('PREDICT_API_PORT', 5000))
    
    # Fare Service API
    FARE_API_HOST = os.getenv('FARE_API_HOST', '0.0.0.0')
    FARE_API_PORT = int(os.getenv('FARE_API_PORT', 5001))
    
    # ==================== CORS Configuration ====================
    # Parse comma-separated origins from environment variable
    _cors_origins_str = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001')
    CORS_ORIGINS: List[str] = [origin.strip() for origin in _cors_origins_str.split(',')]
    
    # CORS settings
    CORS_ALLOW_CREDENTIALS = os.getenv('CORS_ALLOW_CREDENTIALS', 'false').lower() == 'true'
    CORS_MAX_AGE = int(os.getenv('CORS_MAX_AGE', 3600))
    
    # ==================== Model Files ====================
    # Prediction model files
    MODEL_PATH = MODEL_DIR / os.getenv('MODEL_FILENAME', 'crowd_prediction_model.pkl')
    FEATURE_INFO_PATH = MODEL_DIR / os.getenv('FEATURE_INFO_FILENAME', 'feature_info.pkl')
    MODEL_METADATA_PATH = MODEL_DIR / os.getenv('MODEL_METADATA_FILENAME', 'model_metadata.json')
    
    # Scaler file (if used)
    SCALER_PATH = MODEL_DIR / os.getenv('SCALER_FILENAME', 'scaler.pkl')
    
    # ==================== GTFS Data Files ====================
    GTFS_STOPS = GTFS_DIR / 'stops.txt'
    GTFS_ROUTES = GTFS_DIR / 'routes.txt'
    GTFS_TRIPS = GTFS_DIR / 'trips.txt'
    GTFS_STOP_TIMES = GTFS_DIR / 'stop_times.txt'
    GTFS_FARE_ATTRIBUTES = GTFS_DIR / 'fare_attributes.txt'
    GTFS_FARE_RULES = GTFS_DIR / 'fare_rules.txt'
    GTFS_SHAPES = GTFS_DIR / 'shapes.txt'
    GTFS_CALENDAR = GTFS_DIR / 'calendar.txt'
    GTFS_AGENCY = GTFS_DIR / 'agency.txt'
    GTFS_TRANSLATIONS = GTFS_DIR / 'translations.txt'
    
    # Training data
    TRAINING_DATA_PATH = DATASET_DIR / os.getenv('TRAINING_DATA_FILENAME', 'training_data_v2.csv')
    
    # ==================== Distance and Fare Calculation ====================
    # Distance thresholds (in kilometers)
    DISTANCE_THRESHOLD_TIER1 = float(os.getenv('DISTANCE_TIER1', 2.0))   # Up to 2 km
    DISTANCE_THRESHOLD_TIER2 = float(os.getenv('DISTANCE_TIER2', 5.0))   # 2-5 km
    DISTANCE_THRESHOLD_TIER3 = float(os.getenv('DISTANCE_TIER3', 10.0))  # 5-10 km
    DISTANCE_THRESHOLD_TIER4 = float(os.getenv('DISTANCE_TIER4', 15.0))  # 10-15 km
    
    # Fare structure (in INR)
    FARE_TIER1 = float(os.getenv('FARE_TIER1', 5.0))    # Up to 2 km: ₹5
    FARE_TIER2 = float(os.getenv('FARE_TIER2', 10.0))   # 2-5 km: ₹10
    FARE_TIER3 = float(os.getenv('FARE_TIER3', 15.0))   # 5-10 km: ₹15
    FARE_TIER4 = float(os.getenv('FARE_TIER4', 20.0))   # 10-15 km: ₹20
    FARE_TIER5 = float(os.getenv('FARE_TIER5', 25.0))   # 15+ km: ₹25
    
    # Default fallback fare
    DEFAULT_FARE = float(os.getenv('DEFAULT_FARE', 10.0))
    
    # GST percentage
    GST_RATE = float(os.getenv('GST_RATE', 0.05))  # 5%
    
    # Distance calculation parameters
    EARTH_RADIUS_KM = 6371  # Earth's radius for Haversine formula
    AVERAGE_BUS_SPEED_KMH = float(os.getenv('AVERAGE_BUS_SPEED', 20.0))  # Average bus speed
    
    # ==================== Coordinate Validation ====================
    # Bangalore coordinate bounds
    BANGALORE_LAT_MIN = float(os.getenv('BANGALORE_LAT_MIN', 12.7))
    BANGALORE_LAT_MAX = float(os.getenv('BANGALORE_LAT_MAX', 13.2))
    BANGALORE_LON_MIN = float(os.getenv('BANGALORE_LON_MIN', 77.3))
    BANGALORE_LON_MAX = float(os.getenv('BANGALORE_LON_MAX', 77.9))
    
    # ==================== Rush Hour Configuration ====================
    # Morning rush hour
    MORNING_RUSH_START = int(os.getenv('MORNING_RUSH_START', 7))  # 7 AM
    MORNING_RUSH_END = int(os.getenv('MORNING_RUSH_END', 9))      # 9 AM
    
    # Evening rush hour
    EVENING_RUSH_START = int(os.getenv('EVENING_RUSH_START', 17))  # 5 PM
    EVENING_RUSH_END = int(os.getenv('EVENING_RUSH_END', 19))      # 7 PM
    
    # ==================== Logging Configuration ====================
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = os.getenv('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    LOG_FILE = BASE_DIR / os.getenv('LOG_FILENAME', 'app.log')
    LOG_MAX_BYTES = int(os.getenv('LOG_MAX_BYTES', 10_000_000))  # 10MB
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 5))
    
    # ==================== Application Settings ====================
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    TESTING = os.getenv('TESTING', 'False').lower() == 'true'
    
    # Secret key for Flask sessions (if needed)
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # ==================== ML Model Settings ====================
    # Model parameters
    MODEL_VERSION = os.getenv('MODEL_VERSION', 'v3_final')
    
    # Prediction settings
    PREDICTION_TIMEOUT_SECONDS = int(os.getenv('PREDICTION_TIMEOUT', 5))
    BATCH_PREDICTION_MAX_SIZE = int(os.getenv('BATCH_MAX_SIZE', 100))
    
    # Model features (expected order)
    MODEL_FEATURES = ['hour', 'day_of_week', 'is_rush_hour', 'stop_lat', 'stop_lon']
    
    # Crowd level mapping
    CROWD_LEVELS = {
        0: 'Low',
        1: 'Medium',
        2: 'High',
        3: 'Very High'
    }
    
    # ==================== Caching Configuration ====================
    CACHE_ENABLED = os.getenv('CACHE_ENABLED', 'True').lower() == 'true'
    CACHE_TYPE = os.getenv('CACHE_TYPE', 'simple')  # 'simple', 'redis', 'memcached'
    CACHE_DEFAULT_TIMEOUT = int(os.getenv('CACHE_TIMEOUT', 300))  # 5 minutes
    
    # Redis configuration (if using Redis cache)
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
    REDIS_DB = int(os.getenv('REDIS_DB', 0))
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)
    
    # ==================== Rate Limiting ====================
    RATE_LIMIT_ENABLED = os.getenv('RATE_LIMIT_ENABLED', 'False').lower() == 'true'
    RATE_LIMIT_DEFAULT = os.getenv('RATE_LIMIT_DEFAULT', '100 per hour')
    RATE_LIMIT_STORAGE_URL = os.getenv('RATE_LIMIT_STORAGE_URL', 'memory://')
    
    # ==================== Database Configuration (Future) ====================
    # If migrating from CSV to database
    DATABASE_URL = os.getenv('DATABASE_URL', None)
    DATABASE_POOL_SIZE = int(os.getenv('DATABASE_POOL_SIZE', 5))
    DATABASE_MAX_OVERFLOW = int(os.getenv('DATABASE_MAX_OVERFLOW', 10))
    
    # ==================== Export Settings ====================
    EXPORT_DIR = OUTPUT_DIR
    EXPORT_ENABLED = os.getenv('EXPORT_ENABLED', 'True').lower() == 'true'
    
    # ==================== Monitoring and Metrics ====================
    METRICS_ENABLED = os.getenv('METRICS_ENABLED', 'False').lower() == 'true'
    METRICS_PORT = int(os.getenv('METRICS_PORT', 9090))
    
    # Performance tracking
    TRACK_PERFORMANCE = os.getenv('TRACK_PERFORMANCE', 'True').lower() == 'true'
    
    @classmethod
    def get_fare_tiers(cls) -> Dict[str, Any]:
        """Get fare tier configuration as a dictionary"""
        return {
            'tiers': [
                {'max_km': cls.DISTANCE_THRESHOLD_TIER1, 'fare': cls.FARE_TIER1},
                {'max_km': cls.DISTANCE_THRESHOLD_TIER2, 'fare': cls.FARE_TIER2},
                {'max_km': cls.DISTANCE_THRESHOLD_TIER3, 'fare': cls.FARE_TIER3},
                {'max_km': cls.DISTANCE_THRESHOLD_TIER4, 'fare': cls.FARE_TIER4},
                {'max_km': float('inf'), 'fare': cls.FARE_TIER5}
            ],
            'default': cls.DEFAULT_FARE,
            'gst_rate': cls.GST_RATE
        }
    
    @classmethod
    def get_rush_hour_config(cls) -> Dict[str, int]:
        """Get rush hour configuration"""
        return {
            'morning_start': cls.MORNING_RUSH_START,
            'morning_end': cls.MORNING_RUSH_END,
            'evening_start': cls.EVENING_RUSH_START,
            'evening_end': cls.EVENING_RUSH_END
        }
    
    @classmethod
    def validate_paths(cls) -> bool:
        """Validate that critical paths exist"""
        critical_paths = [
            cls.GTFS_DIR,
            cls.MODEL_DIR,
            cls.DATASET_DIR
        ]
        
        for path in critical_paths:
            if not path.exists():
                print(f"Warning: Critical path does not exist: {path}")
                return False
        return True
    
    def ensure_directories(self) -> None:
        """Create necessary directories if they don't exist"""
        directories = [
            self.MODEL_DIR,
            self.OUTPUT_DIR,
            self.GTFS_DIR
        ]
        
        for directory in directories:
            if not directory.exists():
                directory.mkdir(parents=True, exist_ok=True)


class DevelopmentConfig(Config):
    """Development environment configuration"""
    DEBUG = True
    TESTING = False
    LOG_LEVEL = 'DEBUG'
    
    # More verbose logging in development
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    
    # Disable caching in development for fresh data
    CACHE_ENABLED = False
    
    # Allow all CORS in development
    CORS_ORIGINS = ['*']
    
    # Disable rate limiting in development
    RATE_LIMIT_ENABLED = False
    
    # Enable performance tracking
    TRACK_PERFORMANCE = True


class ProductionConfig(Config):
    """Production environment configuration"""
    DEBUG = False
    TESTING = False
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'WARNING')
    
    # Stricter CORS in production
    CORS_ORIGINS = [
        origin.strip() 
        for origin in os.getenv('CORS_ORIGINS', 'https://bmtc-app.example.com').split(',')
    ]
    
    # Enable caching in production
    CACHE_ENABLED = True
    CACHE_TYPE = os.getenv('CACHE_TYPE', 'redis')
    
    # Enable rate limiting in production
    RATE_LIMIT_ENABLED = True
    RATE_LIMIT_DEFAULT = '50 per hour'
    
    # Require secret key in production (validated after config selection)
    SECRET_KEY = os.getenv('SECRET_KEY', 'prod-secret-not-set')
    
    # Enable metrics in production
    METRICS_ENABLED = True
    
    @classmethod
    def validate_production_config(cls):
        """Validate production configuration requirements"""
        if not cls.SECRET_KEY or cls.SECRET_KEY == 'dev-secret-key-change-in-production' or cls.SECRET_KEY == 'prod-secret-not-set':
            raise ValueError(
                "SECRET_KEY must be set in production environment. "
                "Set the SECRET_KEY environment variable before running in production."
            )


class TestingConfig(Config):
    """Testing environment configuration"""
    DEBUG = True
    TESTING = True
    LOG_LEVEL = 'DEBUG'
    
    # Use test database/files
    GTFS_DIR = Config.BASE_DIR / 'tests' / 'test_data' / 'gtfs'
    MODEL_PATH = Config.BASE_DIR / 'tests' / 'test_data' / 'test_model.pkl'
    
    # Disable external services
    CACHE_ENABLED = False
    RATE_LIMIT_ENABLED = False
    METRICS_ENABLED = False
    
    # Shorter timeouts for tests
    PREDICTION_TIMEOUT_SECONDS = 1
    CACHE_DEFAULT_TIMEOUT = 10


# ==================== Configuration Selection ====================
# Select configuration based on environment variables
# Check multiple environment variable names for compatibility
ENVIRONMENT = (
    os.getenv('APP_ENV') or 
    os.getenv('FLASK_ENV') or 
    os.getenv('ENVIRONMENT') or 
    'development'
).lower()

# Map common environment names
if ENVIRONMENT in ['prod', 'production']:
    config = ProductionConfig()
    ENVIRONMENT = 'production'
    # Validate production requirements
    try:
        ProductionConfig.validate_production_config()
    except ValueError as e:
        print(f"\n{'='*60}")
        print("⚠️  PRODUCTION CONFIGURATION ERROR")
        print("="*60)
        print(str(e))
        print("\nTo run in production mode, set:")
        print("  export SECRET_KEY='your-secure-secret-key'  # Linux/Mac")
        print("  $env:SECRET_KEY='your-secure-secret-key'  # PowerShell")
        print("\nOr run in development mode (default):")
        print("  python your_script.py  # No APP_ENV needed")
        print("="*60)
        raise
elif ENVIRONMENT in ['test', 'testing']:
    config = TestingConfig()
    ENVIRONMENT = 'testing'
else:
    # Default to development for any other value
    config = DevelopmentConfig()
    ENVIRONMENT = 'development'


# ==================== Configuration Summary ====================
def print_config_summary():
    """Print configuration summary for debugging"""
    print("=" * 60)
    print("BMTC Application Configuration")
    print("=" * 60)
    print(f"Environment: {ENVIRONMENT.upper()}")
    print(f"Debug Mode: {config.DEBUG}")
    print(f"Log Level: {config.LOG_LEVEL}")
    print()
    print("API Endpoints:")
    print(f"  Prediction API: http://{config.PREDICT_API_HOST}:{config.PREDICT_API_PORT}")
    print(f"  Fare API: http://{config.FARE_API_HOST}:{config.FARE_API_PORT}")
    print()
    print("CORS Origins:")
    for origin in config.CORS_ORIGINS:
        print(f"  - {origin}")
    print()
    print("Model Files:")
    print(f"  Model: {config.MODEL_PATH}")
    print(f"  Feature Info: {config.FEATURE_INFO_PATH}")
    print(f"  Scaler: {config.SCALER_PATH}")
    print()
    print("GTFS Data:")
    print(f"  Directory: {config.GTFS_DIR}")
    print(f"  Stops: {config.GTFS_STOPS.exists()}")
    print(f"  Routes: {config.GTFS_ROUTES.exists()}")
    print(f"  Fare Rules: {config.GTFS_FARE_RULES.exists()}")
    print()
    print("Fare Configuration:")
    tiers = config.get_fare_tiers()
    for i, tier in enumerate(tiers['tiers'], 1):
        if tier['max_km'] == float('inf'):
            print(f"  Tier {i}: {tiers['tiers'][i-2]['max_km']}+ km = ₹{tier['fare']}")
        else:
            print(f"  Tier {i}: Up to {tier['max_km']} km = ₹{tier['fare']}")
    print(f"  GST Rate: {tiers['gst_rate'] * 100}%")
    print()
    print("Rush Hours:")
    rush = config.get_rush_hour_config()
    print(f"  Morning: {rush['morning_start']}:00 - {rush['morning_end']}:00")
    print(f"  Evening: {rush['evening_start']}:00 - {rush['evening_end']}:00")
    print("=" * 60)


# ==================== Helper Functions ====================
def get_config() -> Config:
    """Get the active configuration instance"""
    return config


def is_production() -> bool:
    """Check if running in production environment"""
    return ENVIRONMENT == 'production'


def is_development() -> bool:
    """Check if running in development environment"""
    return ENVIRONMENT == 'development'


def is_testing() -> bool:
    """Check if running in testing environment"""
    return ENVIRONMENT == 'testing'


# Run validation on import
if __name__ != '__main__':
    # Ensure critical directories exist
    config.ensure_directories()
    
    # Validate paths in non-testing environments
    if not is_testing():
        config.validate_paths()
