# BMTC Bus Crowd Prediction System

**ML-powered crowd prediction and fare calculation for Bangalore Metropolitan Transport Corporation (BMTC) buses**

[![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![Flask](https://img.shields.io/badge/flask-3.0.0-green.svg)](https://flask.palletsprojects.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6.1-orange.svg)](https://scikit-learn.org/)
[![Model Accuracy](https://img.shields.io/badge/model%20accuracy-66.83%25-brightgreen.svg)](models/model_metadata.json)

---

## 📋 Overview

This project provides **real-time bus crowd prediction** and **fare calculation services** for BMTC buses using machine learning and GTFS (General Transit Feed Specification) data. The system consists of two Flask-based REST APIs that work together to help passengers plan their journeys more effectively.

### Key Features

- 🤖 **ML-Powered Crowd Prediction**: Random Forest classifier predicting crowd levels (Low, Medium, High, Very High)
- 💰 **Intelligent Fare Calculation**: GTFS-based fare calculation with multiple fallback strategies
- 🚌 **Comprehensive Coverage**: 9,360 bus stops across Bangalore
- 🗺️ **Journey Planning**: Route planning with distance and time estimation
- 📊 **Rush Hour Detection**: Automatic identification of peak travel times (7-9 AM, 5-7 PM)
- 🌐 **REST APIs**: Easy integration with web and mobile frontends

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│              (http://localhost:3000)                     │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│   Prediction API     │      │     Fare API         │
│   (port 5000)        │      │   (port 5001)        │
│                      │      │                      │
│  - Crowd Prediction  │      │  - Fare Calculation  │
│  - ML Model (RF)     │      │  - GTFS Data         │
│  - Batch Endpoints   │      │  - Journey Planning  │
└──────────────────────┘      └──────────────────────┘
           │                               │
           ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│   Trained Model      │      │    GTFS Dataset      │
│  - crowd_prediction  │      │  - 9,360 stops       │
│    _model.pkl        │      │  - 54,724 trips      │
│  - 66.83% accuracy   │      │  - Fare rules        │
└──────────────────────┘      └──────────────────────┘
```

### Model Performance

- **Algorithm**: Random Forest Classifier
- **Overall Accuracy**: 66.83%
- **Training Samples**: 12,000
- **Test Samples**: 3,000
- **Features**: hour, day_of_week, is_rush_hour, stop_lat, stop_lon

**Performance by Class:**
| Crowd Level | Precision | Recall | F1-Score |
|------------|-----------|--------|----------|
| Low | 76.6% | 72.6% | 74.6% |
| Medium | 60.8% | 69.9% | 65.1% |
| High | 39.1% | 13.8% | 20.4% |
| Very High | 64.3% | 86.0% | 73.5% |

**Feature Importance:**
1. `is_rush_hour` - 37.99%
2. `day_of_week` - 20.10%
3. `hour` - 17.75%
4. `stop_lon` - 12.08%
5. `stop_lat` - 12.08%

---

## 🎯 Prerequisites

### System Requirements
- **Operating System**: Windows, macOS, or Linux
- **Python**: 3.11 or higher
- **Memory**: Minimum 4GB RAM (8GB recommended for training)
- **Disk Space**: ~500MB for dependencies and datasets

### Required Libraries

**Core Dependencies:**
```
flask>=3.0.0
flask-cors>=4.0.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
joblib>=1.3.0
```

**Full list available in:**
- `requirements.txt` - Main project dependencies
- `requirements_fare.txt` - Fare service specific dependencies

---

## 🚀 Installation

### Step 1: Clone or Download the Project

```bash
cd F:\MiniProject\ml
```

### Step 2: Create Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
# Install main dependencies
pip install -r requirements.txt

# Verify installation
pip list | findstr flask  # Windows
pip list | grep flask     # Linux/macOS
```

### Step 4: Verify Dataset and Model Files

**Check GTFS Dataset:**
```bash
# Ensure these files exist in dataset/gtfs/
ls dataset/gtfs/stops.txt
ls dataset/gtfs/routes.txt
ls dataset/gtfs/fare_attributes.txt
ls dataset/gtfs/fare_rules.txt
```

**Check Model Files:**
```bash
# Ensure trained model exists
ls models/crowd_prediction_model.pkl
ls models/feature_info.pkl
ls models/model_metadata.json
```

**If model doesn't exist, train it:**
```bash
python train_model_v3.py
```

---

## ⚙️ Configuration

### Port Configuration

By default, the APIs run on:
- **Prediction API**: `http://localhost:5000`
- **Fare Service API**: `http://localhost:5001`

**To change ports, edit the respective files:**

**predict_api.py (line 239):**
```python
app.run(debug=True, host='0.0.0.0', port=5000)  # Change port here
```

**fare_service.py (line 661):**
```python
app.run(host='0.0.0.0', port=5001, debug=True)  # Change port here
```

### CORS Configuration

**To allow requests from different origins, edit fare_service.py (line 8):**
```python
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
```

Change to:
```python
# Allow multiple origins
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})

# Allow all origins (development only)
CORS(app)
```

### Environment Variables (Optional)

Create a `.env` file in the project root:
```env
# API Configuration
PREDICT_API_PORT=5000
FARE_API_PORT=5001

# CORS
CORS_ORIGINS=http://localhost:3000

# Paths
GTFS_DIR=./dataset/gtfs
MODEL_DIR=./models

# Logging
LOG_LEVEL=INFO
DEBUG=True
```

---

## 🏃‍♂️ Running the Application

### Start Both Services

**Terminal 1 - Prediction API:**
```bash
python predict_api.py
```

Output:
```
✓ Model loaded from F:\MiniProject\ml\models\crowd_prediction_model.pkl
✓ Feature info loaded
==================================================
Bus Crowd Prediction API
==================================================
Model loaded: True
Features: ['hour', 'day_of_week', 'is_rush_hour', 'stop_lat', 'stop_lon']

Endpoints:
  GET  /health - Health check
  POST /predict - Single prediction
  POST /predict/batch - Batch predictions
  GET  /model/info - Model information
==================================================

Starting server on http://localhost:5000
 * Running on http://127.0.0.1:5000
```

**Terminal 2 - Fare Service API:**
```bash
python fare_service.py
```

Output:
```
Loading GTFS data...
GTFS data loaded successfully
Loaded 185 fare attributes
Loaded 1364815 fare rules
Loaded 9360 stops
Loaded 4190 routes
Loaded 1905101 shape points

Starting BMTC Fare Service on http://localhost:5001
 * Running on http://127.0.0.1:5001
```

### Verify Services are Running

```bash
# Check Prediction API
curl http://localhost:5000/health

# Check Fare API
curl http://localhost:5001/api/fare/health
```

---

## 📡 API Endpoints Documentation

### Prediction API (Port 5000)

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "features": ["hour", "day_of_week", "is_rush_hour", "stop_lat", "stop_lon"]
}
```

---

#### 2. Predict Crowd Level
```http
POST /predict
Content-Type: application/json
```

**Request Body:**
```json
{
  "stop_lat": 12.9716,
  "stop_lon": 77.5946,
  "time": "08:30",
  "day_of_week": 1
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `stop_lat` | float | Yes | Latitude (12.7 to 13.2 for Bangalore) |
| `stop_lon` | float | Yes | Longitude (77.3 to 77.9 for Bangalore) |
| `time` | string | No | Time in HH:MM format (default: current time) |
| `day_of_week` | int | No | 0=Monday, 6=Sunday (default: current day) |

**Response:**
```json
{
  "success": true,
  "prediction": {
    "crowd_level": "Very High",
    "crowd_level_code": 3,
    "confidence": 0.6,
    "probabilities": {
      "Low": 0.1,
      "Medium": 0.15,
      "High": 0.15,
      "Very High": 0.6
    }
  },
  "input": {
    "stop_lat": 12.9716,
    "stop_lon": 77.5946,
    "time": "08:30",
    "hour": 8,
    "is_rush_hour": 1,
    "day_of_week": 1
  }
}
```

---

#### 3. Batch Predictions
```http
POST /predict/batch
Content-Type: application/json
```

**Request Body:**
```json
{
  "requests": [
    {
      "stop_lat": 12.9716,
      "stop_lon": 77.5946,
      "time": "08:00",
      "day_of_week": 1
    },
    {
      "stop_lat": 13.0827,
      "stop_lon": 77.5877,
      "time": "18:30",
      "day_of_week": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "stop_lat": 12.9716,
      "stop_lon": 77.5946,
      "time": "08:00",
      "hour": 8,
      "is_rush_hour": true,
      "crowd_level": "Very High"
    },
    {
      "stop_lat": 13.0827,
      "stop_lon": 77.5877,
      "time": "18:30",
      "hour": 18,
      "is_rush_hour": true,
      "crowd_level": "High"
    }
  ]
}
```

---

#### 4. Model Information
```http
GET /model/info
```

**Response:**
```json
{
  "model_type": "RandomForestClassifier",
  "features": ["hour", "day_of_week", "is_rush_hour", "stop_lat", "stop_lon"],
  "classes": [0, 1, 2, 3],
  "n_features": 5
}
```

---

### Fare Service API (Port 5001)

#### 1. Health Check
```http
GET /api/fare/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "BMTC Fare Calculation Service",
  "version": "1.0"
}
```

---

#### 2. Get All Stops
```http
GET /api/fare/stops
```

**Response:**
```json
{
  "stops": [
    {
      "stop_id": "1",
      "stop_name": "Kempegowda Bus Station (Majestic)"
    },
    {
      "stop_id": "2",
      "stop_name": "K.R. Market"
    }
  ],
  "count": 9360
}
```

---

#### 3. Search Stops
```http
GET /api/fare/stops/search?q=majestic
```

**Response:**
```json
{
  "stops": [
    {
      "stop_id": "1",
      "stop_name": "Kempegowda Bus Station (Majestic)"
    },
    {
      "stop_id": "45",
      "stop_name": "Majestic Metro Station"
    }
  ],
  "count": 2,
  "query": "majestic"
}
```

---

#### 4. Calculate Fare
```http
POST /api/fare/calculate
Content-Type: application/json
```

**Request Body:**
```json
{
  "origin": "Kempegowda Bus Station",
  "destination": "Electronic City",
  "route_id": "500"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `origin` | string | Yes | Origin stop name |
| `destination` | string | Yes | Destination stop name |
| `route_id` | string | No | Specific route ID for accurate pricing |

**Response:**
```json
{
  "origin": "Kempegowda Bus Station",
  "destination": "Electronic City",
  "actual_origin_name": "Kempegowda Bus Station (Majestic)",
  "actual_destination_name": "Electronic City",
  "origin_id": "1",
  "destination_id": "8745",
  "fare": 25.0,
  "currency": "INR",
  "fare_id": "distance_based",
  "route_id": null,
  "distance_km": 18.5,
  "gst": 1.25,
  "total": 26.25,
  "source": "distance_calculation",
  "message": "Fare calculated from GTFS dataset"
}
```

**Fare Calculation Strategy:**
1. **Direct GTFS lookup** - Searches fare_rules.txt for exact origin-destination match
2. **Zone-based lookup** - Fallback using zone contains rules
3. **Distance-based calculation** - Uses Haversine formula with fare bands:
   - Up to 2 km: ₹5
   - 2-5 km: ₹10
   - 5-10 km: ₹15
   - 10-15 km: ₹20
   - 15+ km: ₹25
4. **Default fallback** - Base fare ₹10 if all strategies fail

---

#### 5. Plan Journey
```http
GET /api/journey/plan?fromStop=Majestic&toStop=Electronic+City
```

**Response:**
```json
[
  {
    "route": {
      "routeId": "500",
      "routeShortName": "500",
      "routeLongName": "Kempegowda Bus Station - Electronic City",
      "routeType": 3
    },
    "stops": [
      {
        "stopId": "1",
        "stopName": "Kempegowda Bus Station (Majestic)",
        "stopLat": 12.9716,
        "stopLon": 77.5946
      },
      {
        "stopId": "8745",
        "stopName": "Electronic City",
        "stopLat": 12.8456,
        "stopLon": 77.6603
      }
    ],
    "metrics": {
      "distance": 18.5,
      "estimatedTimeMinutes": 55,
      "fare": 25
    },
    "departureTime": "09:00 AM",
    "arrivalTime": "09:55 AM",
    "shapes": [
      {
        "shapePtLat": 12.9716,
        "shapePtLon": 77.5946,
        "shapePtSequence": 0
      }
    ]
  }
]
```

---

## 📊 Dataset Information

### GTFS Dataset Statistics

| Data Type | Count | Details |
|-----------|-------|---------|
| **Bus Stops** | 9,360 | Complete coverage of BMTC network |
| **Routes** | 4,190 | All active BMTC routes |
| **Trips** | 54,724 | Daily trip schedules |
| **Fare Attributes** | 185 | Unique fare definitions |
| **Fare Rules** | 1,364,815 | Origin-destination fare mappings |
| **Shape Points** | 1,905,101 | Route path coordinates for mapping |
| **Translations** | 8,944 | Kannada/English bilingual support |

### Data Sources

**GTFS Data**: Official BMTC dataset from [Vonter/BMTC GTFS Repository](https://github.com/geohacker/bmtc)

**Training Data**: 15,000 synthetic samples with realistic patterns:
- Rush hour probability: 60% High/Very High crowds
- Non-rush hour: 80% Low/Medium crowds
- Weekday vs weekend variations
- Location-based crowding (central Bangalore busier)

**Why Synthetic Data?**
> BMTC does not publicly share real-time passenger count data. This project demonstrates the ML pipeline using synthetic data with realistic patterns. The model can be easily updated with real data when available through a BMTC partnership.

### Dataset Structure

```
dataset/
├── gtfs/                           # Official BMTC GTFS data
│   ├── stops.txt                   # 9,360 bus stops with coordinates
│   ├── routes.txt                  # 4,190 routes
│   ├── trips.txt                   # 54,724 trip schedules
│   ├── fare_attributes.txt         # 185 fare definitions
│   ├── fare_rules.txt              # 1.36M fare rules (44MB)
│   ├── shapes.txt                  # Route polylines (95MB)
│   ├── stop_times.txt              # Stop timing sequences
│   ├── calendar.txt                # Service calendar
│   ├── translations.txt            # Bilingual support
│   └── agency.txt                  # BMTC agency info
│
├── training_data_v2.csv            # 15,000 synthetic training samples
├── processed_gtfs.csv              # Processed GTFS data
└── kaggle/                         # Reference Kaggle dataset
```

---

## 💻 Usage Examples

### Example 1: Check Rush Hour Crowd at Majestic

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d "{\"stop_lat\": 12.9716, \"stop_lon\": 77.5946, \"time\": \"08:30\", \"day_of_week\": 1}"
```

**Expected Output:** "Very High" crowd level (rush hour, weekday)

---

### Example 2: Calculate Fare from Majestic to Electronic City

```bash
curl -X POST http://localhost:5001/api/fare/calculate \
  -H "Content-Type: application/json" \
  -d "{\"origin\": \"Kempegowda Bus Station\", \"destination\": \"Electronic City\"}"
```

**Expected Output:** ₹25 base fare + ₹1.25 GST = ₹26.25 total

---

### Example 3: Search for Stops Near Whitefield

```bash
curl "http://localhost:5001/api/fare/stops/search?q=whitefield"
```

**Expected Output:** List of all stops containing "whitefield"

---

### Example 4: Batch Predictions for Multiple Times

```bash
curl -X POST http://localhost:5000/predict/batch \
  -H "Content-Type: application/json" \
  -d "{\"requests\": [{\"stop_lat\": 12.9716, \"stop_lon\": 77.5946, \"time\": \"08:00\", \"day_of_week\": 1}, {\"stop_lat\": 12.9716, \"stop_lon\": 77.5946, \"time\": \"14:00\", \"day_of_week\": 1}]}"
```

**Expected Output:** "Very High" for 8 AM (rush hour), "Low" for 2 PM (off-peak)

---

### Example 5: Plan Journey

```bash
curl "http://localhost:5001/api/journey/plan?fromStop=Majestic&toStop=Silk%20Board"
```

**Expected Output:** Route information with distance, time, and fare

---

## 📁 Project Structure

```
F:\MiniProject\ml/
│
├── predict_api.py                  # ML Prediction API (Flask, port 5000)
├── fare_service.py                 # Fare Calculation API (Flask, port 5001)
├── train_model_v3.py               # Model training script
├── test_fare_service.py            # Manual API test script
│
├── models/                         # Trained ML models
│   ├── crowd_prediction_model.pkl  # Random Forest model (8.7MB)
│   ├── feature_info.pkl            # Feature configuration
│   └── model_metadata.json         # Training metrics & model info
│
├── dataset/                        # Data files
│   ├── gtfs/                       # Official BMTC GTFS data
│   │   ├── stops.txt               # 9,360 bus stops
│   │   ├── routes.txt              # 4,190 routes
│   │   ├── trips.txt               # 54,724 trips
│   │   ├── fare_attributes.txt     # 185 fare types
│   │   ├── fare_rules.txt          # 1.36M fare rules
│   │   ├── shapes.txt              # Route polylines (95MB)
│   │   ├── stop_times.txt          # Stop sequences
│   │   ├── calendar.txt            # Service calendar
│   │   └── translations.txt        # Kannada/English
│   │
│   ├── training_data_v2.csv        # 15,000 synthetic samples
│   ├── processed_gtfs.csv          # Processed GTFS
│   └── kaggle/                     # Reference data
│
├── output/                         # Exported CSV files
│   ├── fare_attributes.csv
│   ├── fare_rules.csv
│   ├── merged_fares_analysis.csv
│   ├── routes.csv
│   └── stops.csv
│
├── docs/                           # Documentation
│   ├── WARP.md                     # Project context (Warp AI)
│   ├── CODEBASE_ANALYSIS.md        # Code quality analysis
│   ├── DATA_REALITY_CHECK.md       # Data sourcing analysis
│   └── SESSION_SUMMARY.md          # Training session summary
│
├── requirements.txt                # Python dependencies (main)
├── requirements_fare.txt           # Fare service dependencies
├── README.md                       # This file
│
└── train_model.ipynb               # Jupyter notebook for experimentation
```

---

## 🧪 Testing

### Manual Testing

Run the comprehensive test suite:
```bash
# Ensure both APIs are running first
python test_fare_service.py
```

**Tests included:**
1. Health checks for both services
2. Get all stops
3. Search stops by name
4. Calculate fare for multiple routes
5. Get routes information

### Expected Test Results

```
==================================================
  BMTC FARE CALCULATION SERVICE - TEST SUITE
==================================================

TEST 1: Health Check
✓ Service Status: healthy
✓ Service Name: BMTC Fare Calculation Service
✓ Version: 1.0

TEST 2: Get Stops
✓ Total stops loaded: 9360

TEST 3: Search Stops
✓ Search for 'majestic': 12 results

TEST 4: Fare Calculation
✓ Fare: ₹25.0
✓ Total: ₹26.25

TEST 5: Get Routes
✓ Total routes: 4190

==================================================
Results: 5/5 tests passed
==================================================

🎉 All tests passed! Your fare calculator is working perfectly!
```

### Automated Testing (To Be Implemented)

The project has pytest installed but no test suite yet. See [CODEBASE_ANALYSIS.md](docs/CODEBASE_ANALYSIS.md) for testing recommendations.

---

## 🔧 Troubleshooting

### Model Not Loading Error

**Error:**
```
⚠ Model not found. Please train the model first.
```

**Solution:**
```bash
# Train the model
python train_model_v3.py

# Verify model file exists
ls models/crowd_prediction_model.pkl
```

---

### GTFS Data Not Found Error

**Error:**
```
GTFS directory not found: F:\MiniProject\ml\dataset\gtfs
```

**Solution:**
```bash
# Check if GTFS files exist
ls dataset/gtfs/

# Required files:
# - stops.txt
# - routes.txt
# - fare_attributes.txt
# - fare_rules.txt
```

---

### Port Already in Use Error

**Error:**
```
OSError: [WinError 10048] Only one usage of each socket address is normally permitted
```

**Solution (Windows):**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or change the port in the code
```

**Solution (Linux/macOS):**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9

# Or change the port
```

---

### CORS Error from Frontend

**Error:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
Edit `fare_service.py` line 8:
```python
# Allow your frontend origin
CORS(app, resources={r"/api/*": {"origins": "http://your-frontend-url:port"}})
```

---

### ModuleNotFoundError

**Error:**
```
ModuleNotFoundError: No module named 'flask'
```

**Solution:**
```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Linux/macOS

# Install dependencies
pip install -r requirements.txt
```

---

## 🚀 Performance Optimization

### Current Performance
- **Prediction API**: ~50-100ms per request
- **Fare API**: ~100-200ms per request (GTFS lookup)
- **GTFS Load Time**: ~2-3 seconds (cached with `@lru_cache`)

### Optimization Tips

1. **Use Production WSGI Server**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 predict_api:app
   ```

2. **Database for GTFS Data** (instead of CSV)
   - PostgreSQL + PostGIS for spatial queries
   - Redis for caching frequently accessed data

3. **Load Balancing** for high traffic
   - Nginx reverse proxy
   - Multiple worker processes

---

## 🔐 Security Considerations

### Current Security Status

⚠️ **Development Mode** - Not production-ready
- Debug mode enabled
- No authentication/authorization
- No rate limiting
- No input sanitization
- CORS open to localhost only

### Production Recommendations

- [ ] Disable debug mode (`debug=False`)
- [ ] Add API authentication (JWT tokens)
- [ ] Implement rate limiting (Flask-Limiter)
- [ ] Add input validation and sanitization
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS with SSL certificates
- [ ] Add request logging and monitoring
- [ ] Implement CORS restrictions

See [CODEBASE_ANALYSIS.md](docs/CODEBASE_ANALYSIS.md) for detailed security recommendations.

---

## 📈 Future Enhancements

### Short-term (Planned)
- [ ] Add automated test suite (pytest)
- [ ] Implement proper logging infrastructure
- [ ] Add configuration management (config.py)
- [ ] Create Docker containers
- [ ] Add input validation

### Medium-term
- [ ] Integrate real-time BMTC data (when available)
- [ ] Add user feedback mechanism
- [ ] Implement caching layer (Redis)
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Create admin dashboard

### Long-term
- [ ] Mobile app integration
- [ ] Real-time bus tracking
- [ ] Predictive arrival times
- [ ] Multi-city support
- [ ] Advanced ML models (deep learning)

---

## 🤝 Contributing

This is an academic mini-project, but contributions are welcome!

### Code Standards
- Follow PEP 8 style guide
- Add docstrings to all functions (Google style)
- Keep functions under 50 lines
- Add type hints for new code
- Write tests for new features

### Contribution Process
1. Fork the repository (if applicable)
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with description

---

## 📚 Documentation

- **[WARP.md](WARP.md)** - Comprehensive project context for Warp AI
- **[CODEBASE_ANALYSIS.md](docs/CODEBASE_ANALYSIS.md)** - Detailed code review and improvement recommendations
- **[DATA_REALITY_CHECK.md](docs/DATA_REALITY_CHECK.md)** - Analysis of data sources and synthetic data rationale
- **[SESSION_SUMMARY.md](docs/SESSION_SUMMARY.md)** - Model training session notes and results

---

## 🔗 External Resources

- **GTFS Specification**: https://gtfs.org/reference/static
- **BMTC Official Website**: https://www.mybmtc.karnataka.gov.in
- **Flask Documentation**: https://flask.palletsprojects.com
- **Scikit-learn Documentation**: https://scikit-learn.org
- **BMTC GTFS Data Source**: https://github.com/geohacker/bmtc

---

## 📝 License

This is an academic project created for educational purposes.

---

## 👥 Contact & Support

**Project Type**: Mini Project / Academic  
**Status**: MVP Complete - Development Ongoing  
**Created**: October 2025  
**Last Updated**: October 26, 2025

---

## 🙏 Acknowledgments

- **BMTC** for providing public GTFS data
- **Vonter/geohacker** for maintaining BMTC GTFS repository
- **Scikit-learn** community for excellent ML tools
- **Flask** team for the lightweight web framework

---

## ⚠️ Important Notes

1. **Synthetic Data**: This model is trained on synthetic data as real passenger count data is not publicly available from BMTC. Accuracy of 66.83% is good for proof-of-concept.

2. **No Real-time Data**: The system uses GTFS static data, not real-time feeds. Predictions are based on historical patterns encoded in the synthetic training data.

3. **Bangalore Only**: Coordinate validation is specific to Bangalore region (12.7-13.2°N, 77.3-77.9°E).

4. **Development Mode**: Current configuration is for development. See Security Considerations for production deployment.

5. **Academic Purpose**: This project is for educational demonstration. For production use with real BMTC data, a partnership with BMTC would be required.

---

**Built with ❤️ for improving public transportation in Bangalore**
