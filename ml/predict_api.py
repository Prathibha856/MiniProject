"""
Prediction API Backend
Flask/FastAPI endpoint for serving bus crowd predictions
"""

from flask import Flask, request, jsonify, g
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
from time import time

# Import logging utilities
from logger import setup_logger, log_request, log_response, log_error, log_startup
from config import config
from validators import PredictionRequestValidator, BatchPredictionRequestValidator

# Setup logger
logger = setup_logger('predict_api', log_file=config.BASE_DIR / 'predict_api.log')

app = Flask(__name__)
CORS(app, origins=config.CORS_ORIGINS)  # Enable CORS for React frontend

# Define paths from config
MODEL_PATH = config.MODEL_PATH
SCALER_PATH = config.SCALER_PATH
FEATURE_INFO_PATH = config.FEATURE_INFO_PATH

# Load trained model and feature info
try:
    model = joblib.load(MODEL_PATH)
    logger.info(f"Model loaded successfully from {MODEL_PATH}")
except FileNotFoundError as e:
    model = None
    logger.error(f"Model not found at {MODEL_PATH}. Please train the model first.", exc_info=True)
except Exception as e:
    model = None
    log_error(logger, e, "Failed to load model")

try:
    feature_info = joblib.load(FEATURE_INFO_PATH)
    feature_columns = feature_info['feature_columns']
    logger.info("Feature info loaded successfully")
except FileNotFoundError:
    feature_columns = config.MODEL_FEATURES
    logger.warning("Feature info not found, using default feature columns")

# Crowd level mapping from config
CROWD_LEVELS = config.CROWD_LEVELS

# Request timing middleware
@app.before_request
def before_request():
    """Record request start time"""
    g.start_time = time()
    log_request(logger, request.method, request.path)

@app.after_request
def after_request(response):
    """Log response details"""
    if hasattr(g, 'start_time'):
        duration_ms = (time() - g.start_time) * 1000
        log_response(logger, request.path, response.status_code, duration_ms)
    return response

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    logger.debug("Health check endpoint called")
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'features': feature_columns if model else None
    })

@app.route('/predict', methods=['POST'])
def predict_crowd():
    """
    Predict bus crowd level
    
    Expected JSON payload:
    {
        "stop_lat": 12.9716,
        "stop_lon": 77.5946,
        "time": "14:30",
        "day_of_week": 1,
        "date": "2025-10-23"
    }
    """
    if model is None:
        logger.error("Prediction request received but model is not loaded")
        return jsonify({
            'error': 'Model not loaded. Please train the model first.'
        }), 500
    
    try:
        # Get request data
        data = request.get_json()
        logger.debug(f"Prediction request data: {data}")
        
        # Validate request data
        validator = PredictionRequestValidator()
        is_valid, result = validator.validate(data)
        if not is_valid:
            errors = result.get('errors', [])
            logger.warning(f"Invalid prediction request: {errors}")
            return jsonify({
                'error': 'Invalid request data',
                'details': errors,
                'success': False
            }), 400
        
        # Use validated data
        data = result
        
        # Extract features
        stop_lat = data.get('stop_lat', 12.9716)
        stop_lon = data.get('stop_lon', 77.5946)
        time_str = data.get('time')
        day_of_week = data.get('day_of_week', datetime.now().weekday())
        
        # Parse time - handle optional time field
        if time_str:
            time_obj = datetime.strptime(time_str, '%H:%M')
            hour = time_obj.hour
        else:
            # Use current hour if time not provided
            hour = datetime.now().hour
            time_str = datetime.now().strftime('%H:%M')
        
        # Determine if rush hour using config
        is_rush_hour = 1 if (config.MORNING_RUSH_START <= hour <= config.MORNING_RUSH_END) or (config.EVENING_RUSH_START <= hour <= config.EVENING_RUSH_END) else 0
        
        logger.debug(f"Processed features: lat={stop_lat}, lon={stop_lon}, hour={hour}, is_rush={is_rush_hour}")
        
        # Create feature vector matching training features
        features = pd.DataFrame({
            'hour': [hour],
            'day_of_week': [day_of_week],
            'is_rush_hour': [is_rush_hour],
            'stop_lat': [stop_lat],
            'stop_lon': [stop_lon]
        })
        
        # Make prediction
        prediction = model.predict(features)[0]
        prediction_proba = model.predict_proba(features)[0]
        
        # Get crowd level
        crowd_level = CROWD_LEVELS.get(prediction, 'Unknown')
        
        logger.info(f"Prediction: {crowd_level} (code={prediction}, confidence={max(prediction_proba):.2f})")
        
        # Prepare response
        response = {
            'success': True,
            'prediction': {
                'crowd_level': crowd_level,
                'crowd_level_code': int(prediction),
                'confidence': float(max(prediction_proba)),
                'probabilities': {
                    CROWD_LEVELS[i]: float(prob) 
                    for i, prob in enumerate(prediction_proba)
                }
            },
            'input': {
                'stop_lat': stop_lat,
                'stop_lon': stop_lon,
                'time': time_str,
                'day_of_week': day_of_week,
                'hour': hour,
                'is_rush_hour': is_rush_hour
            }
        }
        
        return jsonify(response)
    
    except ValueError as e:
        log_error(logger, e, "Invalid input data for prediction")
        return jsonify({
            'error': f'Invalid input: {str(e)}',
            'success': False
        }), 400
    except Exception as e:
        log_error(logger, e, "Prediction failed")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict crowd levels for multiple routes/stops
    
    Expected JSON payload:
    {
        "requests": [
            {"stop_lat": 12.9716, "stop_lon": 77.5946, "time": "14:30", "day_of_week": 1},
            {"stop_lat": 13.0827, "stop_lon": 77.5877, "time": "18:00", "day_of_week": 1}
        ]
    }
    """
    if model is None:
        logger.error("Batch prediction request received but model is not loaded")
        return jsonify({
            'error': 'Model not loaded. Please train the model first.'
        }), 500
    
    try:
        data = request.get_json()
        
        # Validate batch request data
        validator = BatchPredictionRequestValidator()
        is_valid, result = validator.validate(data)
        if not is_valid:
            errors = result.get('errors', [])
            logger.warning(f"Invalid batch prediction request: {errors}")
            return jsonify({
                'error': 'Invalid batch request data',
                'details': errors,
                'success': False
            }), 400
        
        # Use validated data
        requests_list = result.get('requests', [])
        logger.info(f"Batch prediction request for {len(requests_list)} items")
        
        predictions = []
        for idx, req in enumerate(requests_list):
            # Process each request
            stop_lat = req.get('stop_lat', 12.9716)
            stop_lon = req.get('stop_lon', 77.5946)
            time_str = req.get('time')
            day_of_week = req.get('day_of_week', datetime.now().weekday())
            
            # Parse and predict - handle optional time field
            if time_str:
                time_obj = datetime.strptime(time_str, '%H:%M')
                hour = time_obj.hour
            else:
                # Use current hour if time not provided
                hour = datetime.now().hour
                time_str = datetime.now().strftime('%H:%M')
            is_rush_hour = 1 if (config.MORNING_RUSH_START <= hour <= config.MORNING_RUSH_END) or (config.EVENING_RUSH_START <= hour <= config.EVENING_RUSH_END) else 0
            
            # Create features and predict
            features = pd.DataFrame({
                'hour': [hour],
                'day_of_week': [day_of_week],
                'is_rush_hour': [is_rush_hour],
                'stop_lat': [stop_lat],
                'stop_lon': [stop_lon]
            })
            
            prediction = model.predict(features)[0]
            crowd_level = CROWD_LEVELS.get(prediction, 'Unknown')
            
            logger.debug(f"Batch item {idx+1}: {crowd_level} at {time_str}")
            
            predictions.append({
                'stop_lat': stop_lat,
                'stop_lon': stop_lon,
                'time': time_str,
                'hour': hour,
                'is_rush_hour': bool(is_rush_hour),
                'crowd_level': crowd_level
            })
        
        logger.info(f"Batch prediction completed successfully for {len(predictions)} items")
        
        return jsonify({
            'success': True,
            'predictions': predictions
        })
    
    except Exception as e:
        log_error(logger, e, "Batch prediction failed")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if model is None:
        logger.warning("Model info requested but model is not loaded")
        return jsonify({
            'error': 'Model not loaded'
        }), 404
    
    try:
        info = {
            'model_type': type(model).__name__,
            'features': list(model.feature_names_in_) if hasattr(model, 'feature_names_in_') else 'Unknown',
            'classes': list(model.classes_) if hasattr(model, 'classes_') else 'Unknown',
            'n_features': model.n_features_in_ if hasattr(model, 'n_features_in_') else 'Unknown'
        }
        
        # Convert numpy types to Python types for JSON serialization
        for key, value in info.items():
            if isinstance(value, np.integer):
                info[key] = int(value)
            elif isinstance(value, np.floating):
                info[key] = float(value)
            elif isinstance(value, np.ndarray):
                info[key] = value.tolist()
            elif isinstance(value, list):
                # Handle lists that might contain numpy types
                info[key] = [int(x) if isinstance(x, np.integer) else 
                           float(x) if isinstance(x, np.floating) else x 
                           for x in value]
        
        logger.debug(f"Model info retrieved: {info['model_type']}")
        return jsonify(info)
    except Exception as e:
        log_error(logger, e, "Failed to retrieve model info")
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Log startup information
    log_startup(
        logger,
        'Bus Crowd Prediction API',
        config.PREDICT_API_HOST,
        config.PREDICT_API_PORT,
        model_loaded=model is not None,
        features=', '.join(feature_columns) if model else 'N/A',
        endpoints=4
    )
    
    logger.info("Available Endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /predict - Single prediction")
    logger.info("  POST /predict/batch - Batch predictions")
    logger.info("  GET  /model/info - Model information")
    
    try:
        app.run(debug=config.DEBUG, host=config.PREDICT_API_HOST, port=config.PREDICT_API_PORT)
    except KeyboardInterrupt:
        logger.info("Server shutdown requested by user")
    except Exception as e:
        log_error(logger, e, "Server crashed unexpectedly")
        raise
    finally:
        logger.info("Bus Crowd Prediction API - Stopped")
