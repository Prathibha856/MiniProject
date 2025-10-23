# 🚌 Crowd Prediction System - Data Requirements

## 📊 Overview
Predict bus crowd levels (Empty, Low, Medium, High, Full) based on historical data and real-time factors.

---

## 🗄️ Data Collection Requirements

### 1. Historical Data Needed (For Training ML Model)

#### **Passenger Count Data** (Primary)
```sql
CREATE TABLE passenger_counts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    bus_number VARCHAR(20),
    route_id BIGINT,
    stop_name VARCHAR(100),
    boarding_count INT,           -- People getting on
    alighting_count INT,          -- People getting off
    total_passengers INT,         -- Current bus capacity
    max_capacity INT,             -- Maximum seats/standing
    timestamp TIMESTAMP,
    day_of_week VARCHAR(10),      -- Monday, Tuesday, etc.
    time_slot VARCHAR(10),        -- Morning, Afternoon, Evening, Night
    is_peak_hour BOOLEAN,
    weather VARCHAR(20),          -- Sunny, Rainy, etc.
    is_holiday BOOLEAN,
    special_event VARCHAR(100),   -- Festival, Match, etc.
    INDEX idx_bus_time (bus_number, timestamp)
);
```

#### **Bus Trip Data**
```sql
CREATE TABLE bus_trips (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    trip_id VARCHAR(50) UNIQUE,
    bus_number VARCHAR(20),
    route_id BIGINT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    total_passengers_carried INT,
    average_occupancy_percent DECIMAL(5,2),
    peak_occupancy_percent DECIMAL(5,2),
    peak_occupancy_stop VARCHAR(100),
    INDEX idx_bus_route (bus_number, route_id)
);
```

#### **Stop-wise Patterns**
```sql
CREATE TABLE stop_patterns (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    stop_name VARCHAR(100),
    route_id BIGINT,
    avg_boarding_count DECIMAL(5,2),
    avg_alighting_count DECIMAL(5,2),
    peak_time_start TIME,
    peak_time_end TIME,
    day_type VARCHAR(10),         -- Weekday, Weekend
    crowd_level VARCHAR(20)       -- Empty, Low, Medium, High, Full
);
```

---

### 2. Real-Time Data Needed (For Predictions)

#### **Current Bus Status**
```json
{
  "busNumber": "335E",
  "currentPassengers": 45,
  "maxCapacity": 60,
  "currentStop": "MG Road",
  "nextStop": "Indiranagar",
  "speed": 25.5,
  "timestamp": "2025-01-22T11:30:00Z"
}
```

#### **Contextual Data**
- Current date/time
- Day of week
- Is peak hour (7-10 AM, 5-8 PM)
- Is holiday/weekend
- Weather conditions
- Special events nearby
- Traffic conditions

---

### 3. External Data Sources

1. **Weather API**
   - Temperature
   - Rain/Clear
   - Impact on crowd (people avoid buses in rain)

2. **Events Calendar**
   - Cricket matches
   - Festivals
   - Concerts
   - Exhibitions

3. **Traffic Data**
   - Road congestion
   - Alternative transport availability

4. **BMTC Internal Data**
   - GPS tracking
   - Ticket sales
   - Pass usage
   - Conductor reports

---

## 🤖 Machine Learning Model Requirements

### Input Features for ML Model:
1. **Time Features:**
   - Hour of day (0-23)
   - Day of week (0-6)
   - Is peak hour (boolean)
   - Is weekend (boolean)
   - Is holiday (boolean)

2. **Bus Features:**
   - Bus number
   - Route ID
   - Bus type (Ordinary/AC/Volvo)
   - Max capacity

3. **Stop Features:**
   - Current stop ID
   - Stop popularity index
   - Distance from origin
   - Distance to destination

4. **Historical Features:**
   - Average crowd at this time
   - Average crowd at this stop
   - Trend (increasing/decreasing)

5. **External Features:**
   - Weather condition
   - Temperature
   - Special events (boolean)
   - Traffic level (1-5)

### Output (Prediction):
```json
{
  "crowdLevel": "Medium",           // Empty, Low, Medium, High, Full
  "occupancyPercent": 65,           // 0-100%
  "currentPassengers": 39,          // Estimated number
  "seatsAvailable": 21,             // Estimated seats
  "standingRoom": true,             // Boolean
  "confidence": 0.85,               // 0-1
  "nextStopPrediction": {
    "stop": "Indiranagar",
    "crowdLevel": "High",
    "occupancyPercent": 85
  }
}
```

---

## 📊 ML Model Options

### Option 1: Random Forest Classifier
- **Pros:** Good for categorical output, handles missing data
- **Training Data Needed:** 6 months minimum
- **Accuracy Expected:** 75-85%

### Option 2: LSTM (Deep Learning)
- **Pros:** Learns time patterns, very accurate
- **Training Data Needed:** 1 year minimum
- **Accuracy Expected:** 85-95%

### Option 3: XGBoost
- **Pros:** Fast, accurate, industry standard
- **Training Data Needed:** 6 months minimum
- **Accuracy Expected:** 80-90%

---

## 🔄 Data Collection Strategy

### Phase 1: Manual Collection (1-3 months)
- Bus conductors report crowd levels at each stop
- Simple mobile app for conductors
- Categories: Empty (0-20%), Low (20-40%), Medium (40-60%), High (60-80%), Full (80-100%)

### Phase 2: Automated Sensors (3-6 months)
- Install passenger counting sensors at bus doors
- IR sensors or weight sensors
- Automatic data upload to server

### Phase 3: Video Analytics (6-12 months)
- CCTV cameras with AI
- Count people automatically
- Real-time occupancy tracking

---

## 🎯 Minimum Data for Basic Predictions

**If you have limited data, start with:**

1. **Historical Patterns** (Minimum 3 months data):
   - Bus X is 80% full during morning peak (7-9 AM)
   - Bus Y is 30% full during afternoon (2-4 PM)

2. **Rule-Based System:**
   ```
   IF time = 7-10 AM AND day = Weekday THEN crowd = High
   IF time = 2-4 PM AND day = Weekday THEN crowd = Low
   IF time = 5-8 PM AND day = Weekday THEN crowd = High
   IF day = Weekend THEN crowd = Medium
   ```

3. **Combine with Real-Time:**
   - If GPS shows bus stopped for long → Likely full
   - If speed is slow → Likely crowded
   - If multiple buses same route nearby → Crowd distributed

---

## 📋 Quick Start Without Historical Data

### Use Rule-Based Predictions:

```javascript
function predictCrowd(busNumber, currentTime, dayOfWeek, currentStop) {
  const hour = currentTime.getHours();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isPeakMorning = hour >= 7 && hour <= 10;
  const isPeakEvening = hour >= 17 && hour <= 20;
  
  // Default rules
  if (isWeekday && (isPeakMorning || isPeakEvening)) {
    return { level: 'High', percent: 80, color: 'red' };
  } else if (isWeekday && (hour >= 11 && hour <= 16)) {
    return { level: 'Low', percent: 30, color: 'green' };
  } else {
    return { level: 'Medium', percent: 50, color: 'orange' };
  }
}
```

---

## 🚀 Implementation Phases

### Phase 1: Rule-Based (Now - 3 months)
- Use time-based rules
- No ML needed
- 60-70% accuracy

### Phase 2: Simple ML (3-6 months)
- Collect 3 months data
- Train basic model
- 70-80% accuracy

### Phase 3: Advanced ML (6-12 months)
- Collect 6-12 months data
- Train deep learning model
- Real-time updates
- 85-95% accuracy

---

## 📊 Data Format for ML Training

### CSV Format:
```csv
timestamp,bus_number,route_id,stop_name,hour,day_of_week,is_peak,is_holiday,weather,passengers,max_capacity,crowd_level
2025-01-15 07:30:00,335E,12,Majestic,7,3,true,false,Sunny,48,60,High
2025-01-15 08:00:00,335E,12,MG Road,8,3,true,false,Sunny,56,60,High
2025-01-15 14:30:00,335E,12,Indiranagar,14,3,false,false,Sunny,18,60,Low
```

### JSON Format for API:
```json
{
  "trainingData": [
    {
      "timestamp": "2025-01-15T07:30:00Z",
      "busNumber": "335E",
      "routeId": 12,
      "stopName": "Majestic",
      "features": {
        "hour": 7,
        "dayOfWeek": 3,
        "isPeak": true,
        "isHoliday": false,
        "weather": "Sunny",
        "temperature": 25
      },
      "labels": {
        "passengers": 48,
        "maxCapacity": 60,
        "occupancyPercent": 80,
        "crowdLevel": "High"
      }
    }
  ]
}
```

---

## 🎓 Learning Resources for ML Team

1. **Time Series Forecasting:** Use for predicting future crowd
2. **Classification:** Classify into Empty/Low/Medium/High/Full
3. **Regression:** Predict exact passenger count

**Python Libraries:**
- scikit-learn (Random Forest)
- TensorFlow/Keras (LSTM)
- XGBoost
- pandas for data processing

---

## ✅ Summary: What You Need

### Minimum Requirements (Start Now):
- [ ] Bus capacity data (max passengers per bus)
- [ ] Route information
- [ ] Time-based rules (peak vs off-peak)

### Medium Term (3-6 months):
- [ ] 3+ months of passenger count data
- [ ] Historical trip data
- [ ] Weather data integration

### Long Term (6-12 months):
- [ ] 1 year of detailed data
- [ ] ML model trained and deployed
- [ ] Real-time sensor data
- [ ] Video analytics

**Start with rule-based, improve with ML as you collect data! 🚀**
