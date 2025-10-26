# BMTC Bus Crowd Prediction System

## Project Overview

This project provides **ML-powered crowd prediction** and **fare calculation** services for Bangalore Metropolitan Transport Corporation (BMTC) buses. It consists of two Flask-based REST APIs that serve a React frontend for real-time bus crowd monitoring and route planning.

## System Architecture

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

## Core Services

### 1. Prediction API (`predict_api.py`)
**Port:** 5000  
**Purpose:** Machine learning-based crowd prediction for bus stops

**Key Features:**
- Random Forest classifier trained on 15,000 synthetic samples
- Predicts crowd levels: Low, Medium, High, Very High
- Rush hour detection (7-9 AM, 5-7 PM)
- Weekday vs weekend patterns
- Location-based predictions using Bangalore coordinates

**Endpoints:**
- `GET /health` - Health check and model status
- `POST /predict` - Single crowd prediction
- `POST /predict/batch` - Batch predictions for multiple stops
- `GET /model/info` - Model metadata

**Model Details:**
- **Algorithm:** Random Forest Classifier
- **Features:** hour, day_of_week, is_rush_hour, stop_lat, stop_lon
- **Accuracy:** 66.83%
- **Training Data:** 12,000 samples (synthetic with realistic patterns)
- **Test Data:** 3,000 samples

### 2. Fare Service API (`fare_service.py`)
**Port:** 5001  
**Purpose:** GTFS-based fare calculation and route information

**Key Features:**
- GTFS static data processing (official BMTC dataset)
- Fare calculation with multiple fallback strategies
- Journey planning between stops
- Route shape visualization data
- Distance-based fare estimation

**Endpoints:**
- `GET /api/fare/health` - Service health check
- `GET /api/fare/stops` - List all 9,360 bus stops
- `GET /api/fare/stops/search?q=<query>` - Search stops by name
- `POST /api/fare/calculate` - Calculate fare between origin/destination
- `GET /api/journey/plan` - Plan journey with route details
- `GET /api/export-fares` - Export fare data to CSV

**Fare Calculation Strategy:**
1. **Direct GTFS lookup** - Matches origin/destination in fare_rules.txt
2. **Zone-based lookup** - Fallback using zone contains rules
3. **Distance-based calculation** - Haversine distance with fare bands:
   - Up to 2 km: ₹5
   - 2-5 km: ₹10
   - 5-10 km: ₹15
   - 10-15 km: ₹20
   - 15+ km: ₹25
4. **Default fallback** - Base fare ₹10 if all else fails

## Data Assets

### GTFS Dataset (`dataset/gtfs/`)
Official BMTC transit data in GTFS format:

| File | Records | Purpose |
|------|---------|---------|
| `stops.txt` | 9,360 | Bus stop locations with coordinates |
| `routes.txt` | 4,190 | Route information and names |
| `trips.txt` | 54,724 | Trip schedules and patterns |
| `fare_attributes.txt` | 185 | Fare pricing definitions |
| `fare_rules.txt` | 1.36M | Origin-destination fare mappings |
| `shapes.txt` | 95MB | Route shape polylines for mapping |
| `stop_times.txt` | 276KB | Stop timing sequences |
| `calendar.txt` | - | Service calendar |
| `translations.txt` | 8,944 | Multilingual support (Kannada/English) |

### Training Data (`dataset/training_data_v2.csv`)
- **Samples:** 15,000 synthetic records with realistic patterns
- **Features:** hour, day_of_week, is_rush_hour, stop_lat, stop_lon, crowd_level_code
- **Generation Logic:**
  - Rush hour probability: 60% High/Very High
  - Non-rush hour: 80% Low/Medium
  - Weekday vs weekend variations
  - Central Bangalore locations busier

### Model Artifacts (`models/`)
- `crowd_prediction_model.pkl` - Trained Random Forest model (8.7MB)
- `feature_info.pkl` - Feature configuration and metadata
- `model_metadata.json` - Training metrics and model version info

## Technology Stack

**Backend:**
- Python 3.11+
- Flask 3.0.0 (Web framework)
- Flask-CORS 4.0.0 (Cross-origin support)
- scikit-learn 1.6.1 (Machine learning)
- pandas 2.2.3 (Data processing)
- numpy 1.26.2 (Numerical computing)
- joblib 1.3.0 (Model serialization)

**Data Processing:**
- GTFS specification for transit data
- CSV-based data storage
- LRU caching for GTFS data loading

**Development:**
- Pytest 8.3.4 (Testing framework - installed but not used yet)
- Jupyter Notebook (Model experimentation)

## Project Structure

```
F:\MiniProject\ml/
├── predict_api.py              # ML Prediction API (Flask)
├── fare_service.py             # Fare Calculation API (Flask)
├── train_model_v3.py           # Model training script
├── test_fare_service.py        # Manual API test script
│
├── models/
│   ├── crowd_prediction_model.pkl
│   ├── feature_info.pkl
│   └── model_metadata.json
│
├── dataset/
│   ├── gtfs/                   # GTFS transit data (9,360 stops)
│   │   ├── stops.txt
│   │   ├── routes.txt
│   │   ├── trips.txt
│   │   ├── fare_attributes.txt
│   │   ├── fare_rules.txt
│   │   └── shapes.txt
│   ├── kaggle/                 # Reference Kaggle data
│   ├── training_data_v2.csv    # ML training data (15,000 samples)
│   └── processed_gtfs.csv
│
├── output/                     # Exported fare analysis CSVs
│
├── docs/
│   ├── CODEBASE_ANALYSIS.md    # Comprehensive code review
│   ├── DATA_REALITY_CHECK.md   # Data sourcing analysis
│   └── SESSION_SUMMARY.md      # Training session summary
│
├── requirements.txt            # Python dependencies (main)
└── requirements_fare.txt       # Python dependencies (fare service)
```

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train Model (Optional - model already trained)
```bash
python train_model_v3.py
```

### 3. Start Prediction API
```bash
python predict_api.py
# Runs on http://localhost:5000
```

### 4. Start Fare Service API (in separate terminal)
```bash
python fare_service.py
# Runs on http://localhost:5001
```

### 5. Test APIs
```bash
# Test prediction API
curl http://localhost:5000/health

# Test fare API
curl http://localhost:5001/api/fare/health

# Run manual test suite
python test_fare_service.py
```

## API Usage Examples

### Predict Crowd Level
```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "stop_lat": 12.9716,
    "stop_lon": 77.5946,
    "time": "08:30",
    "day_of_week": 1
  }'
```

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

### Calculate Fare
```bash
curl -X POST http://localhost:5001/api/fare/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Kempegowda Bus Station",
    "destination": "Electronic City"
  }'
```

**Response:**
```json
{
  "origin": "Kempegowda Bus Station",
  "destination": "Electronic City",
  "actual_origin_name": "Kempegowda Bus Station (Majestic)",
  "actual_destination_name": "Electronic City",
  "fare": 25.0,
  "currency": "INR",
  "distance_km": 18.5,
  "gst": 1.25,
  "total": 26.25,
  "source": "distance_calculation"
}
```

### Search Bus Stops
```bash
curl "http://localhost:5001/api/fare/stops/search?q=majestic"
```

## Known Issues & Limitations

### Current State
✅ **Working:**
- ML model trained and functional (66.83% accuracy)
- Both APIs running and serving requests
- GTFS data loaded successfully
- Basic error handling in place

❌ **Missing:**
- No automated test suite (only manual tests)
- No configuration management (hardcoded ports/paths)
- No proper logging (using print statements)
- No input validation
- No README.md
- No .gitignore
- No CI/CD pipeline
- No Docker support
- No API documentation (OpenAPI/Swagger)

### Model Limitations
- **Synthetic Data:** Model trained on generated data (no real passenger counts available publicly)
- **Accuracy:** 66.83% - Good for MVP, but could improve with real data
- **Class Imbalance:** "High" crowd level has poor F1-score (20.4%)
- **Bangalore Only:** Coordinates validated only for Bangalore region

### Data Limitations
- GTFS data is static (no real-time updates)
- Fare rules file is large (1.36M rows, 44MB)
- No real-time passenger count data from BMTC
- Synthetic crowd levels based on assumptions

## Development Roadmap

### Phase 1: Code Quality (Week 1) ⚠️ PRIORITY
- [ ] Create README.md
- [ ] Add .gitignore
- [ ] Create config.py for centralized configuration
- [ ] Replace print() with proper logging
- [ ] Add input validation with validators.py

### Phase 2: Testing (Week 2)
- [ ] Create pytest test suite
- [ ] Unit tests for prediction logic
- [ ] Unit tests for fare calculation
- [ ] Integration tests for both APIs
- [ ] Achieve 80%+ code coverage

### Phase 3: DevOps (Week 3)
- [ ] Add Docker support
- [ ] Create docker-compose.yml
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add code linting (black, flake8, mypy)
- [ ] Create deployment documentation

### Phase 4: Production Readiness (Week 4)
- [ ] Refactor large functions
- [ ] Add type hints throughout
- [ ] Add API documentation (OpenAPI)
- [ ] Add performance monitoring
- [ ] Add caching layer
- [ ] Security hardening (rate limiting, input sanitization)

## Contributing Guidelines

### Code Standards
- **Python:** PEP 8 style guide
- **Line Length:** Max 100 characters
- **Functions:** Keep under 50 lines
- **Type Hints:** Required for all new functions
- **Docstrings:** Required for all public functions (Google style)

### Testing Requirements
- All new features must have tests
- Maintain 80%+ code coverage
- Integration tests for API endpoints
- Unit tests for business logic

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, docs, style, refactor, test, chore

## Deployment

### Local Development
```bash
# Terminal 1: Prediction API
python predict_api.py

# Terminal 2: Fare Service API
python fare_service.py

# Terminal 3: Frontend (if available)
cd frontend && npm start
```

### Production (Planned)
- Docker containers for each service
- Nginx reverse proxy
- Environment-based configuration
- Production WSGI server (Gunicorn)
- Database for GTFS data (PostgreSQL + PostGIS)

## Performance Metrics

### Model Performance
- **Accuracy:** 66.83%
- **Precision (Low):** 76.6%
- **Recall (Very High):** 86.0%
- **Feature Importance:** is_rush_hour (37.99%), day_of_week (20.10%)

### API Performance
- **Prediction API:** ~50-100ms per request (with model loaded)
- **Fare API:** ~100-200ms per request (GTFS lookup)
- **GTFS Load Time:** ~2-3 seconds (cached with @lru_cache)

### Data Metrics
- **Stops Coverage:** 9,360 bus stops (100% of BMTC network)
- **Routes:** 4,190 routes
- **Fare Rules:** 1.36M origin-destination pairs

## Security Considerations

### Current
- CORS enabled for http://localhost:3000 (hardcoded)
- No authentication/authorization
- No rate limiting
- No input sanitization
- Debug mode enabled

### Recommended
- [ ] Add API authentication (JWT tokens)
- [ ] Implement rate limiting (Flask-Limiter)
- [ ] Add input validation and sanitization
- [ ] Disable debug mode in production
- [ ] Use environment variables for secrets
- [ ] Add HTTPS support
- [ ] Implement request logging

## Troubleshooting

### Model Not Loading
```python
# Check if model file exists
ls models/crowd_prediction_model.pkl

# Retrain if needed
python train_model_v3.py
```

### GTFS Data Not Found
```python
# Check GTFS directory
ls dataset/gtfs/

# Files required:
# - stops.txt
# - routes.txt
# - fare_attributes.txt
# - fare_rules.txt
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in code (temporary)
app.run(port=5002)
```

## Resources

### Documentation
- [CODEBASE_ANALYSIS.md](CODEBASE_ANALYSIS.md) - Detailed code review and recommendations
- [DATA_REALITY_CHECK.md](DATA_REALITY_CHECK.md) - Data sourcing analysis
- [SESSION_SUMMARY.md](SESSION_SUMMARY.md) - Training session notes

### External References
- [GTFS Specification](https://gtfs.org/reference/static)
- [BMTC Official Website](https://www.mybmtc.karnataka.gov.in)
- [Scikit-learn Documentation](https://scikit-learn.org)
- [Flask Documentation](https://flask.palletsprojects.com)

## Contact & Support

**Project Type:** Mini Project / Academic  
**Status:** MVP Complete - Needs Production Hardening  
**Last Updated:** 2025-10-26  

---

**Note:** This is a proof-of-concept project demonstrating ML-based crowd prediction using synthetic data. For production deployment with real BMTC passenger data, a partnership with BMTC would be required to access real-time passenger count data.
