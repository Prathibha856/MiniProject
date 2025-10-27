"""
Prediction API Backend
Flask/FastAPI endpoint for serving bus crowd predictions
"""

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flasgger import Swagger, swag_from
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

# Configure Swagger UI
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/docs"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "BMTC Bus Crowd Prediction API",
        "description": "Machine Learning API for predicting bus crowd levels in Bangalore Metropolitan Transport Corporation (BMTC) buses. Provides real-time predictions based on location, time, and day of week.",
        "version": "1.0.0",
        "contact": {
            "name": "BMTC Prediction Team",
            "email": "support@bmtc-prediction.com"
        },
        "license": {
            "name": "MIT",
            "url": "https://opensource.org/licenses/MIT"
        }
    },
    "host": f"{config.PREDICT_API_HOST}:{config.PREDICT_API_PORT}",
    "basePath": "/",
    "schemes": ["http", "https"],
    "tags": [
        {
            "name": "Health",
            "description": "Health check and service status endpoints"
        },
        {
            "name": "Prediction",
            "description": "Bus crowd prediction endpoints"
        },
        {
            "name": "Model",
            "description": "Model information and metadata"
        }
    ]
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)

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
    """
    Health Check Endpoint
    ---
    tags:
      - Health
    summary: Check API health status
    description: Returns the current health status of the prediction API, including model availability and feature information.
    responses:
      200:
        description: API is healthy and operational
        schema:
          type: object
          properties:
            status:
              type: string
              example: "healthy"
              description: Overall health status of the API
            model_loaded:
              type: boolean
              example: true
              description: Whether the ML model is loaded and ready for predictions
            features:
              type: array
              items:
                type: string
              example: ["hour", "day_of_week", "is_rush_hour", "stop_lat", "stop_lon"]
              description: List of features used by the model
    """
    logger.debug("Health check endpoint called")
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'features': feature_columns if model else None
    })

@app.route('/predict', methods=['POST'])
def predict_crowd():
    """
    Predict Bus Crowd Level
    ---
    tags:
      - Prediction
    summary: Predict crowd level for a specific bus stop
    description: |
      Predicts the crowd level at a bus stop based on location coordinates, time, and day of week.
      
      **Crowd Levels:**
      - 0: Low (< 25% capacity)
      - 1: Medium (25-50% capacity)
      - 2: High (50-75% capacity)
      - 3: Very High (> 75% capacity)
      
      **Coordinates:**
      - Must be within Bangalore bounds (Lat: 12.7-13.2, Lon: 77.3-77.9)
      
      **Time Format:**
      - HH:MM (24-hour format, e.g., "14:30")
      - Optional - defaults to current time if not provided
      
      **Day of Week:**
      - 0: Monday, 1: Tuesday, ..., 6: Sunday
      - Optional - defaults to current day if not provided
    parameters:
      - name: body
        in: body
        required: true
        description: Prediction request with stop location and optional time parameters
        schema:
          type: object
          required:
            - stop_lat
            - stop_lon
          properties:
            stop_lat:
              type: number
              format: float
              minimum: 12.7
              maximum: 13.2
              example: 12.9716
              description: Latitude of the bus stop (Bangalore bounds)
            stop_lon:
              type: number
              format: float
              minimum: 77.3
              maximum: 77.9
              example: 77.5946
              description: Longitude of the bus stop (Bangalore bounds)
            time:
              type: string
              pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
              example: "14:30"
              description: Time in HH:MM format (optional, defaults to current time)
            day_of_week:
              type: integer
              minimum: 0
              maximum: 6
              example: 1
              description: Day of week (0=Monday, 6=Sunday, optional)
    responses:
      200:
        description: Successful prediction
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            prediction:
              type: object
              properties:
                crowd_level:
                  type: string
                  example: "Medium"
                  enum: ["Low", "Medium", "High", "Very High"]
                crowd_level_code:
                  type: integer
                  example: 1
                  minimum: 0
                  maximum: 3
                confidence:
                  type: number
                  format: float
                  example: 0.75
                  description: Confidence score (0-1)
                probabilities:
                  type: object
                  description: Probability distribution across all crowd levels
                  example:
                    Low: 0.1
                    Medium: 0.6
                    High: 0.2
                    Very High: 0.1
            input:
              type: object
              description: Processed input parameters used for prediction
              properties:
                stop_lat:
                  type: number
                  example: 12.9716
                stop_lon:
                  type: number
                  example: 77.5946
                time:
                  type: string
                  example: "14:30"
                day_of_week:
                  type: integer
                  example: 1
                hour:
                  type: integer
                  example: 14
                is_rush_hour:
                  type: integer
                  example: 0
                  description: 1 if rush hour, 0 otherwise
      400:
        description: Invalid request - validation errors
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Invalid request data"
            details:
              type: array
              items:
                type: string
              example: ["stop_lat must be between 12.7 and 13.2 (Bangalore bounds)"]
            success:
              type: boolean
              example: false
      500:
        description: Server error - model not loaded or prediction failed
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Model not loaded. Please train the model first."
            success:
              type: boolean
              example: false
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
    Batch Predict Bus Crowd Levels
    ---
    tags:
      - Prediction
    summary: Predict crowd levels for multiple bus stops in a single request
    description: |
      Performs batch predictions for multiple bus stops at once. Useful for predicting crowds across multiple routes or stops simultaneously.
      
      **Batch Size Limit:** Maximum 100 requests per batch
      
      Each request in the batch follows the same format as the single prediction endpoint.
    parameters:
      - name: body
        in: body
        required: true
        description: Batch prediction request containing multiple stop predictions
        schema:
          type: object
          required:
            - requests
          properties:
            requests:
              type: array
              minItems: 1
              maxItems: 100
              items:
                type: object
                required:
                  - stop_lat
                  - stop_lon
                properties:
                  stop_lat:
                    type: number
                    format: float
                    example: 12.9716
                  stop_lon:
                    type: number
                    format: float
                    example: 77.5946
                  time:
                    type: string
                    example: "14:30"
                  day_of_week:
                    type: integer
                    example: 1
              example:
                - stop_lat: 12.9716
                  stop_lon: 77.5946
                  time: "14:30"
                  day_of_week: 1
                - stop_lat: 13.0827
                  stop_lon: 77.5877
                  time: "18:00"
                  day_of_week: 1
    responses:
      200:
        description: Successful batch predictions
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            predictions:
              type: array
              items:
                type: object
                properties:
                  stop_lat:
                    type: number
                    example: 12.9716
                  stop_lon:
                    type: number
                    example: 77.5946
                  time:
                    type: string
                    example: "14:30"
                  hour:
                    type: integer
                    example: 14
                  is_rush_hour:
                    type: boolean
                    example: false
                  crowd_level:
                    type: string
                    example: "Medium"
      400:
        description: Invalid batch request
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Invalid batch request data"
            details:
              type: array
              items:
                type: string
              example: ["Request 2: stop_lat must be between 12.7 and 13.2", "Batch size exceeds maximum of 100 requests"]
            success:
              type: boolean
              example: false
      500:
        description: Server error
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Model not loaded"
            success:
              type: boolean
              example: false
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
    """
    Get Model Information
    ---
    tags:
      - Model
    summary: Retrieve information about the loaded ML model
    description: |
      Returns metadata about the currently loaded machine learning model, including:
      - Model type (e.g., RandomForestClassifier, XGBoost)
      - Feature names and count
      - Target classes (crowd levels)
      
      Useful for debugging and understanding model characteristics.
    responses:
      200:
        description: Model information retrieved successfully
        schema:
          type: object
          properties:
            model_type:
              type: string
              example: "RandomForestClassifier"
              description: Type/class of the ML model
            features:
              type: array
              items:
                type: string
              example: ["hour", "day_of_week", "is_rush_hour", "stop_lat", "stop_lon"]
              description: List of features the model uses
            classes:
              type: array
              items:
                type: integer
              example: [0, 1, 2, 3]
              description: Target classes (crowd levels)
            n_features:
              type: integer
              example: 5
              description: Number of input features
      404:
        description: Model not loaded
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Model not loaded"
      500:
        description: Server error
        schema:
          type: object
          properties:
            error:
              type: string
              example: "Failed to retrieve model information"
    """
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
    logger.info("  GET  /docs - Swagger API Documentation")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /predict - Single prediction")
    logger.info("  POST /predict/batch - Batch predictions")
    logger.info("  GET  /model/info - Model information")
    logger.info("")
    logger.info(f"📚 API Documentation: http://{config.PREDICT_API_HOST}:{config.PREDICT_API_PORT}/docs")
    
    try:
        app.run(debug=config.DEBUG, host=config.PREDICT_API_HOST, port=config.PREDICT_API_PORT)
    except KeyboardInterrupt:
        logger.info("Server shutdown requested by user")
    except Exception as e:
        log_error(logger, e, "Server crashed unexpectedly")
        raise
    finally:
        logger.info("Bus Crowd Prediction API - Stopped")
