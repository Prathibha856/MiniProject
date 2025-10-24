"""
Prediction API Backend
Flask/FastAPI endpoint for serving bus crowd predictions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Define paths
MODEL_DIR = Path(__file__).parent / 'models'
MODEL_PATH = MODEL_DIR / 'crowd_prediction_model.pkl'
SCALER_PATH = MODEL_DIR / 'scaler.pkl'

# Load trained model and feature info
try:
    model = joblib.load(MODEL_PATH)
    print(f"✓ Model loaded from {MODEL_PATH}")
except FileNotFoundError:
    model = None
    print("⚠ Model not found. Please train the model first.")

try:
    feature_info = joblib.load(MODEL_DIR / 'feature_info.pkl')
    feature_columns = feature_info['feature_columns']
    print("✓ Feature info loaded")
except FileNotFoundError:
    feature_columns = ['hour', 'day_of_week', 'is_rush_hour', 'stop_lat', 'stop_lon']
    print("⚠ Using default feature columns")

# Crowd level mapping
CROWD_LEVELS = {
    0: 'Low',
    1: 'Medium',
    2: 'High',
    3: 'Very High'
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
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
        return jsonify({
            'error': 'Model not loaded. Please train the model first.'
        }), 500
    
    try:
        # Get request data
        data = request.get_json()
        
        # Extract features
        stop_lat = data.get('stop_lat', 12.9716)
        stop_lon = data.get('stop_lon', 77.5946)
        time_str = data.get('time', datetime.now().strftime('%H:%M'))
        day_of_week = data.get('day_of_week', datetime.now().weekday())
        
        # Parse time
        time_obj = datetime.strptime(time_str, '%H:%M')
        hour = time_obj.hour
        
        # Determine if rush hour
        is_rush_hour = 1 if (7 <= hour <= 9) or (17 <= hour <= 19) else 0
        
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
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 400

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
        return jsonify({
            'error': 'Model not loaded. Please train the model first.'
        }), 500
    
    try:
        data = request.get_json()
        requests_list = data.get('requests', [])
        
        predictions = []
        for req in requests_list:
            # Process each request
            stop_lat = req.get('stop_lat', 12.9716)
            stop_lon = req.get('stop_lon', 77.5946)
            time_str = req.get('time', datetime.now().strftime('%H:%M'))
            day_of_week = req.get('day_of_week', datetime.now().weekday())
            
            # Parse and predict
            time_obj = datetime.strptime(time_str, '%H:%M')
            hour = time_obj.hour
            is_rush_hour = 1 if (7 <= hour <= 9) or (17 <= hour <= 19) else 0
            
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
            
            predictions.append({
                'stop_lat': stop_lat,
                'stop_lon': stop_lon,
                'time': time_str,
                'hour': hour,
                'is_rush_hour': bool(is_rush_hour),
                'crowd_level': crowd_level
            })
        
        return jsonify({
            'success': True,
            'predictions': predictions
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 400

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if model is None:
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
        return jsonify(info)
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("Bus Crowd Prediction API")
    print("=" * 50)
    print(f"Model loaded: {model is not None}")
    print(f"Features: {feature_columns if model else 'N/A'}")
    print("\nEndpoints:")
    print("  GET  /health - Health check")
    print("  POST /predict - Single prediction")
    print("  POST /predict/batch - Batch predictions")
    print("  GET  /model/info - Model information")
    print("=" * 50)
    print("\nStarting server on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
