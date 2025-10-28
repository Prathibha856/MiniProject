# BusFlow - System Architecture

## Overview
BusFlow is a Smart Transit Solution for BMTC Bangalore featuring real-time bus tracking, ML-powered crowd prediction, fare calculation, and journey planning.

---

## Architecture Diagram (High-Level)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Port 3001)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              React Web Application (SPA)                      │  │
│  │  ┌────────────┬────────────┬────────────┬─────────────────┐ │  │
│  │  │  Home      │  Track Bus │   Journey  │   Crowd         │ │  │
│  │  │  Dashboard │            │   Planner  │   Prediction    │ │  │
│  │  └────────────┴────────────┴────────────┴─────────────────┘ │  │
│  │  ┌────────────┬────────────┬────────────┬─────────────────┐ │  │
│  │  │  Fare      │  Search    │   Admin    │   Feedback      │ │  │
│  │  │  Calculator│  Route     │   Dashboard│                 │ │  │
│  │  └────────────┴────────────┴────────────┴─────────────────┘ │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │           Context & State Management                     │ │  │
│  │  │  • AppContext (Global State)                            │ │  │
│  │  │  • VoiceContext (Voice Commands)                        │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  External Integrations                        │  │
│  │  • Google Maps API (Maps, Geocoding)                        │  │
│  │  • Web Speech API (Voice Recognition)                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    ▼
                        HTTP/HTTPS (REST API)
                        CORS Enabled (localhost)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────┐    ┌───────────────────────────────┐ │
│  │  Prediction API Service   │    │   Fare Calculation Service    │ │
│  │     (Port 5000)           │    │       (Port 5001)             │ │
│  │  ┌────────────────────┐  │    │  ┌─────────────────────────┐ │ │
│  │  │  Flask REST API    │  │    │  │   Flask REST API        │ │ │
│  │  │  • /health         │  │    │  │   • /api/health         │ │ │
│  │  │  • /predict        │  │    │  │   • /api/stops          │ │ │
│  │  │  • /predict/batch  │  │    │  │   • /api/calculate_fare │ │ │
│  │  │  • /model/info     │  │    │  │   • /api/journey/plan   │ │ │
│  │  └────────────────────┘  │    │  │   • /api/routes         │ │ │
│  │                           │    │  └─────────────────────────┘ │ │
│  │  ┌────────────────────┐  │    │                               │ │
│  │  │  Request Handler   │  │    │  ┌─────────────────────────┐ │ │
│  │  │  • Validators      │  │    │  │   GTFS Data Processor   │ │ │
│  │  │  • Logger          │  │    │  │   • Parse stops.txt     │ │ │
│  │  │  • Error Handler   │  │    │  │   • Parse routes.txt    │ │ │
│  │  └────────────────────┘  │    │  │   • Parse fare_rules    │ │ │
│  │                           │    │  │   • Calculate distance  │ │ │
│  │  ┌────────────────────┐  │    │  └─────────────────────────┘ │ │
│  │  │  CORS & Middleware │  │    │                               │ │
│  │  └────────────────────┘  │    │  ┌─────────────────────────┐ │ │
│  └──────────────────────────┘    │  │   Fare Calculator       │ │ │
│                                   │  │   • Haversine formula   │ │ │
│                                   │  │   • Tier-based pricing  │ │ │
│                                   │  │   • GST calculation     │ │ │
│                                   │  └─────────────────────────┘ │ │
│                                   └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MACHINE LEARNING LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               ML Prediction Engine                            │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │  │
│  │  │  Random Forest   │  │  Feature         │  │  Scaler    │ │  │
│  │  │  Classifier      │  │  Engineering     │  │  (Optional)│ │  │
│  │  │  • 100 trees     │  │  • hour          │  │            │ │  │
│  │  │  • max_depth=20  │  │  • day_of_week   │  │            │ │  │
│  │  │  • 66.83% acc.   │  │  • is_rush_hour  │  │            │ │  │
│  │  │                  │  │  • stop_lat      │  │            │ │  │
│  │  │                  │  │  • stop_lon      │  │            │ │  │
│  │  └──────────────────┘  └──────────────────┘  └────────────┘ │  │
│  │                                                               │  │
│  │  ┌──────────────────────────────────────────────────────────┐│  │
│  │  │  Crowd Level Classification (4 classes)                  ││  │
│  │  │  • 0: Low      (< 25% capacity)                         ││  │
│  │  │  • 1: Medium   (25-50% capacity)                        ││  │
│  │  │  • 2: High     (50-75% capacity)                        ││  │
│  │  │  • 3: Very High (> 75% capacity)                        ││  │
│  │  └──────────────────────────────────────────────────────────┘│  │
│  │                                                               │  │
│  │  ┌──────────────────────────────────────────────────────────┐│  │
│  │  │  Training Pipeline                                        ││  │
│  │  │  • Data: 15,000 synthetic BMTC samples                   ││  │
│  │  │  • Framework: scikit-learn                               ││  │
│  │  │  • Serialization: joblib (pkl files)                     ││  │
│  │  └──────────────────────────────────────────────────────────┘│  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────┐  │
│  │  GTFS Static Data  │  │  ML Model Files    │  │  Bus Stop    │  │
│  │  (CSV Format)      │  │  (Pickled)         │  │  Data        │  │
│  │  • stops.txt       │  │  • model.pkl       │  │  • 9360+     │  │
│  │  • routes.txt      │  │  • feature_info    │  │    stops     │  │
│  │  • stop_times.txt  │  │  • scaler.pkl      │  │  • Lat/Lon   │  │
│  │  • fare_rules.txt  │  │  • metadata.json   │  │  • Zone ID   │  │
│  │  • shapes.txt      │  │                    │  │              │  │
│  │  • calendar.txt    │  │  Training Data:    │  │  Bus Routes: │  │
│  │  • trips.txt       │  │  • training_v2.csv │  │  • 4190+     │  │
│  └────────────────────┘  └────────────────────┘  └──────────────┘  │
│                                                                       │
│  Note: Currently file-based storage. Future: PostgreSQL/MongoDB      │
└─────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Deployment Architecture                    │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │  │
│  │  │  Development   │  │  Testing       │  │  Production    │ │  │
│  │  │  Environment   │  │  Environment   │  │  Environment   │ │  │
│  │  │  • Local       │  │  • pytest      │  │  • Cloud VPS   │ │  │
│  │  │  • Hot reload  │  │  • Coverage    │  │  • nginx       │ │  │
│  │  │  • Debug mode  │  │  • Mock data   │  │  • gunicorn    │ │  │
│  │  └────────────────┘  └────────────────┘  └────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 Logging & Monitoring                          │  │
│  │  • Application logs (INFO/DEBUG/ERROR)                       │  │
│  │  • API request/response logging                              │  │
│  │  • Performance metrics (response time)                       │  │
│  │  • Error tracking with stack traces                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Frontend Layer (React)
**Technology**: React 18.3.1, React Router, Context API

**Key Components**:
- **Home Dashboard**: Main landing page with quick actions
- **Track Bus**: Real-time bus tracking with Google Maps
- **Journey Planner**: Multi-stop route planning
- **Crowd Prediction**: ML-powered bus occupancy forecasting
- **Fare Calculator**: Distance-based fare calculation
- **Search Route**: Route number and stop search
- **Admin Dashboard**: Analytics and ML metrics
- **Feedback**: User complaint submission system
- **Voice Assistant**: Multilingual voice commands (EN, KN, HI)

**State Management**:
- AppContext: Global app state, language preferences
- VoiceContext: Voice recognition state

**External APIs**:
- Google Maps JavaScript API
- Web Speech API (browser-native)

---

### 2. Backend API Layer

#### **A. Prediction API Service (Port 5000)**
**Technology**: Flask 3.x, Python 3.8+

**Endpoints**:
```
GET  /health              - Health check
POST /predict             - Single prediction
POST /predict/batch       - Batch predictions (up to 100)
GET  /model/info          - Model metadata
```

**Features**:
- CORS enabled for localhost:3001
- Request validation (coordinates, time format)
- Error handling with detailed messages
- Logging with rotation
- Swagger/OpenAPI documentation

**Input Validation**:
- Coordinates must be within Bangalore bounds (12.7-13.2 lat, 77.3-77.9 lon)
- Time format: HH:MM (24-hour)
- Day of week: 0-6 (Monday-Sunday)

#### **B. Fare Calculation Service (Port 5001)**
**Technology**: Flask 3.x, Python 3.8+

**Endpoints**:
```
GET  /api/health                 - Health check
GET  /api/stops                  - Get all stops
GET  /api/stops/search           - Search stops
POST /api/calculate_fare         - Calculate fare
GET  /api/journey/plan           - Plan multi-stop journey
GET  /api/routes                 - Get all routes
GET  /api/routes/search          - Search routes
```

**Features**:
- GTFS data parsing and caching
- Haversine distance calculation
- Tier-based fare structure
- GST calculation (5%)
- Journey path optimization

**Fare Tiers**:
```
Up to 2 km:    ₹5
2-5 km:        ₹10
5-10 km:       ₹15
10-15 km:      ₹20
15+ km:        ₹25
```

---

### 3. Machine Learning Layer

#### **Model Architecture**
**Algorithm**: Random Forest Classifier

**Specifications**:
- **Estimators**: 100 trees
- **Max Depth**: 20
- **Training Samples**: 15,000 (synthetic BMTC data)
- **Test Samples**: 3,000
- **Accuracy**: 66.83%
- **Response Time**: ~145ms average

**Features** (5 dimensions):
1. `hour` - Hour of day (0-23)
2. `day_of_week` - Day (0-6, Mon-Sun)
3. `is_rush_hour` - Binary flag (0/1)
4. `stop_lat` - Latitude
5. `stop_lon` - Longitude

**Output Classes**:
- **Class 0**: Low (< 25% capacity)
- **Class 1**: Medium (25-50% capacity)
- **Class 2**: High (50-75% capacity)
- **Class 3**: Very High (> 75% capacity)

**Rush Hours**:
- Morning: 7:00 AM - 9:00 AM
- Evening: 5:00 PM - 7:00 PM

**Model Persistence**:
- Format: joblib (pickle)
- Files: `crowd_prediction_model.pkl`, `feature_info.pkl`, `scaler.pkl`

---

### 4. Data Layer

#### **GTFS Static Data**
**Format**: CSV files (General Transit Feed Specification)

**Files**:
```
gtfs/
├── stops.txt           - Bus stop locations (9360+ stops)
├── routes.txt          - Bus routes (4190+ routes)
├── stop_times.txt      - Timetable data
├── trips.txt           - Trip information
├── shapes.txt          - Route shapes (polylines)
├── fare_attributes.txt - Fare information
├── fare_rules.txt      - Fare calculation rules
├── calendar.txt        - Service days
└── agency.txt          - Transit agency info
```

**Data Volume**:
- **Bus Stops**: 9,360+
- **Routes**: 4,190+
- **Daily Trips**: ~50,000+

#### **Model Storage**
```
models/
├── crowd_prediction_model.pkl  - Trained model
├── feature_info.pkl            - Feature metadata
├── scaler.pkl                  - Feature scaler
└── model_metadata.json         - Model version info
```

#### **Training Data**
```
dataset/
└── training_data_v2.csv        - 15,000 samples
```

---

### 5. Infrastructure & Deployment

#### **Development Setup**
```
React Dev Server:     localhost:3001
Prediction API:       localhost:5000
Fare Service:         localhost:5001
```

#### **Technology Stack**
| Layer | Technology |
|-------|------------|
| Frontend | React 18.3.1, React Router 6.20.1 |
| Backend API | Flask 3.x, Python 3.8+ |
| ML Framework | scikit-learn, NumPy, Pandas |
| Maps | Google Maps JavaScript API |
| Voice | Web Speech API |
| Testing | pytest, React Testing Library |
| Build | Webpack (react-scripts) |

#### **Security Features**
- CORS configuration
- Input validation and sanitization
- Environment variable configuration
- Request timeout limits
- Error messages without sensitive data

#### **Logging System**
- **Levels**: DEBUG, INFO, WARNING, ERROR
- **Format**: Timestamp, module, level, message
- **Rotation**: 10MB max, 5 backups
- **Files**: `predict_api.log`, `fare_api.log`, `app.log`

---

## Data Flow Diagrams

### Crowd Prediction Flow
```
User → Frontend → API Request → Prediction API → Feature Engineering
                                                        ↓
                                               ML Model Inference
                                                        ↓
                                              Crowd Level + Confidence
                                                        ↓
                                              JSON Response → Frontend
                                                        ↓
                                              Visual Display to User
```

### Fare Calculation Flow
```
User Input (2 stops) → Frontend → API Request → Fare Service
                                                      ↓
                                              Load GTFS Data
                                                      ↓
                                              Find Stop Coordinates
                                                      ↓
                                              Calculate Distance (Haversine)
                                                      ↓
                                              Apply Fare Tier + GST
                                                      ↓
                                              JSON Response → Frontend
                                                      ↓
                                              Display Fare Breakdown
```

### Voice Command Flow
```
User Speech → Web Speech API → Voice Context → NLP Processing
                                                      ↓
                                              Intent Recognition
                                                      ↓
                                              Route to Feature Component
                                                      ↓
                                              Execute Action
                                                      ↓
                                              Voice Feedback
```

---

## Scalability & Future Enhancements

### Current Limitations
- In-memory data storage (GTFS CSV files)
- Single-instance deployment
- No real-time bus tracking (demo data)
- Limited to Bangalore region

### Proposed Enhancements
1. **Database Integration**
   - Migrate to PostgreSQL/MongoDB
   - Implement caching with Redis
   - Add database indexing

2. **Real-time Features**
   - WebSocket for live bus tracking
   - Push notifications
   - Live occupancy updates

3. **Scalability**
   - Docker containerization
   - Kubernetes orchestration
   - Load balancing
   - CDN for static assets

4. **ML Improvements**
   - Deep learning models (LSTM for time-series)
   - Continuous learning pipeline
   - A/B testing framework
   - Feature drift monitoring

5. **Security**
   - JWT authentication
   - API rate limiting
   - SQL injection prevention
   - XSS protection

---

## System Requirements

### Development Environment
- **Node.js**: 14.x or higher
- **Python**: 3.8 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB for dependencies and data
- **OS**: Windows 10/11, macOS, Linux

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Network Requirements
- Stable internet for Google Maps API
- API endpoints accessible via localhost
- CORS configuration for development

---

## Deployment Architecture (Production)

```
                    Internet
                       │
                       ▼
               ┌──────────────┐
               │  CDN (Static)│
               │  Cloudflare  │
               └──────────────┘
                       │
                       ▼
               ┌──────────────┐
               │   nginx      │
               │  (Reverse    │
               │   Proxy)     │
               └──────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼               ▼
   ┌────────┐    ┌────────┐    ┌────────┐
   │ React  │    │Predict │    │ Fare   │
   │  App   │    │  API   │    │  API   │
   │        │    │        │    │        │
   └────────┘    └────────┘    └────────┘
                       │               │
                       ▼               ▼
               ┌────────────────────────┐
               │    PostgreSQL DB       │
               │    (Future)            │
               └────────────────────────┘
```

---

**Architecture Version**: 1.0  
**Last Updated**: January 2025  
**Document Prepared By**: BusFlow Development Team
