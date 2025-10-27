#!/usr/bin/env python3
"""
BMTC Services Launcher
Starts both Prediction API and Fare Service API concurrently

This script manages the lifecycle of both Flask applications,
ensuring they run together and handle graceful shutdown.
"""

import os
import sys
import signal
import time
from multiprocessing import Process
from pathlib import Path

# Import configuration
from config import config, is_production
from logger import setup_logger

# Setup logger for the launcher
logger = setup_logger('service_launcher', log_file=config.BASE_DIR / 'services.log')

# Global process references
prediction_api_process = None
fare_api_process = None


def run_prediction_api():
    """Run the Prediction API service"""
    try:
        logger.info("Starting Prediction API...")
        
        # Import and run the Flask app
        from predict_api import app
        
        app.run(
            host=config.PREDICT_API_HOST,
            port=config.PREDICT_API_PORT,
            debug=config.DEBUG,
            use_reloader=False  # Disable reloader in multiprocess mode
        )
    except Exception as e:
        logger.error(f"Prediction API crashed: {e}", exc_info=True)
        sys.exit(1)


def run_fare_api():
    """Run the Fare Service API"""
    try:
        logger.info("Starting Fare Service API...")
        
        # Import and run the Flask app
        from fare_service import app
        
        app.run(
            host=config.FARE_API_HOST,
            port=config.FARE_API_PORT,
            debug=config.DEBUG,
            use_reloader=False  # Disable reloader in multiprocess mode
        )
    except Exception as e:
        logger.error(f"Fare Service API crashed: {e}", exc_info=True)
        sys.exit(1)


def signal_handler(signum, frame):
    """Handle shutdown signals gracefully"""
    logger.info(f"Received signal {signum}, initiating graceful shutdown...")
    
    # Terminate both processes
    if prediction_api_process and prediction_api_process.is_alive():
        logger.info("Terminating Prediction API...")
        prediction_api_process.terminate()
        prediction_api_process.join(timeout=5)
        if prediction_api_process.is_alive():
            logger.warning("Prediction API did not terminate gracefully, killing...")
            prediction_api_process.kill()
    
    if fare_api_process and fare_api_process.is_alive():
        logger.info("Terminating Fare Service API...")
        fare_api_process.terminate()
        fare_api_process.join(timeout=5)
        if fare_api_process.is_alive():
            logger.warning("Fare Service API did not terminate gracefully, killing...")
            fare_api_process.kill()
    
    logger.info("All services stopped. Exiting.")
    sys.exit(0)


def check_prerequisites():
    """Check if all prerequisites are met before starting services"""
    logger.info("Checking prerequisites...")
    
    # Check if model files exist
    if not config.MODEL_PATH.exists():
        logger.error(f"Model file not found: {config.MODEL_PATH}")
        logger.error("Please train the model first using train_model_v3.py")
        return False
    
    # Check if GTFS data exists
    if not config.GTFS_DIR.exists():
        logger.warning(f"GTFS directory not found: {config.GTFS_DIR}")
        logger.warning("Fare service may not work correctly without GTFS data")
    
    # Check if required GTFS files exist
    required_gtfs_files = [
        config.GTFS_STOPS,
        config.GTFS_ROUTES,
        config.GTFS_FARE_ATTRIBUTES,
        config.GTFS_FARE_RULES
    ]
    
    missing_files = [f for f in required_gtfs_files if not f.exists()]
    if missing_files:
        logger.warning("Missing GTFS files:")
        for f in missing_files:
            logger.warning(f"  - {f}")
        logger.warning("Fare service may not work correctly")
    
    logger.info("Prerequisites check completed")
    return True


def monitor_processes():
    """Monitor both processes and restart if they crash"""
    global prediction_api_process, fare_api_process
    
    while True:
        time.sleep(5)  # Check every 5 seconds
        
        # Check Prediction API
        if prediction_api_process and not prediction_api_process.is_alive():
            exit_code = prediction_api_process.exitcode
            logger.error(f"Prediction API process died with exit code {exit_code}")
            if not is_production():
                # In development, don't restart automatically
                logger.error("Stopping all services due to Prediction API crash")
                signal_handler(signal.SIGTERM, None)
            else:
                # In production, attempt restart
                logger.info("Attempting to restart Prediction API...")
                prediction_api_process = Process(target=run_prediction_api, name="PredictionAPI")
                prediction_api_process.start()
        
        # Check Fare API
        if fare_api_process and not fare_api_process.is_alive():
            exit_code = fare_api_process.exitcode
            logger.error(f"Fare Service API process died with exit code {exit_code}")
            if not is_production():
                # In development, don't restart automatically
                logger.error("Stopping all services due to Fare API crash")
                signal_handler(signal.SIGTERM, None)
            else:
                # In production, attempt restart
                logger.info("Attempting to restart Fare Service API...")
                fare_api_process = Process(target=run_fare_api, name="FareAPI")
                fare_api_process.start()


def main():
    """Main entry point for the service launcher"""
    global prediction_api_process, fare_api_process
    
    # Print banner
    print("=" * 70)
    print("BMTC Bus Crowd Prediction System - Service Launcher")
    print("=" * 70)
    print(f"Environment: {config.APP_ENV if hasattr(config, 'APP_ENV') else 'development'}")
    print(f"Prediction API: http://{config.PREDICT_API_HOST}:{config.PREDICT_API_PORT}")
    print(f"Fare Service API: http://{config.FARE_API_HOST}:{config.FARE_API_PORT}")
    print("=" * 70)
    print()
    
    # Check prerequisites
    if not check_prerequisites():
        logger.error("Prerequisites check failed. Exiting.")
        sys.exit(1)
    
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)   # Ctrl+C
    signal.signal(signal.SIGTERM, signal_handler)  # Docker stop
    
    try:
        # Start Prediction API in separate process
        logger.info("Launching Prediction API process...")
        prediction_api_process = Process(target=run_prediction_api, name="PredictionAPI")
        prediction_api_process.start()
        
        # Wait a moment before starting the second service
        time.sleep(2)
        
        # Start Fare Service API in separate process
        logger.info("Launching Fare Service API process...")
        fare_api_process = Process(target=run_fare_api, name="FareAPI")
        fare_api_process.start()
        
        logger.info("=" * 70)
        logger.info("✅ Both services started successfully!")
        logger.info("=" * 70)
        logger.info(f"📊 Prediction API: http://{config.PREDICT_API_HOST}:{config.PREDICT_API_PORT}")
        logger.info(f"    - Documentation: http://{config.PREDICT_API_HOST}:{config.PREDICT_API_PORT}/docs")
        logger.info(f"    - Health Check: http://{config.PREDICT_API_HOST}:{config.PREDICT_API_PORT}/health")
        logger.info("")
        logger.info(f"💰 Fare Service API: http://{config.FARE_API_HOST}:{config.FARE_API_PORT}")
        logger.info(f"    - Health Check: http://{config.FARE_API_HOST}:{config.FARE_API_PORT}/api/health")
        logger.info(f"    - Stops Search: http://{config.FARE_API_HOST}:{config.FARE_API_PORT}/api/stops")
        logger.info("=" * 70)
        logger.info("Press Ctrl+C to stop all services")
        logger.info("")
        
        # Monitor processes
        monitor_processes()
        
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
        signal_handler(signal.SIGINT, None)
    except Exception as e:
        logger.error(f"Unexpected error in service launcher: {e}", exc_info=True)
        signal_handler(signal.SIGTERM, None)
        sys.exit(1)


if __name__ == '__main__':
    main()
