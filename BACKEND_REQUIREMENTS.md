# 🔧 Spring Boot Backend Requirements for BMTC App

## 📦 Required Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- MySQL Driver (or PostgreSQL) -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Lombok (optional, for cleaner code) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

---

## 🔌 Required API Endpoints

### 1. Bus Tracking Endpoints

```java
@RestController
@RequestMapping("/api/buses")
@CrossOrigin(origins = "http://localhost:3000")
public class BusController {
    
    // Get all running buses
    @GetMapping("/running")
    public ResponseEntity<List<Bus>> getRunningBuses() {
        // Return list of currently running buses with GPS coordinates
        return ResponseEntity.ok(busService.getRunningBuses());
    }
    
    // Track specific bus by number
    @GetMapping("/track/{busNumber}")
    public ResponseEntity<List<BusLocation>> trackBus(@PathVariable String busNumber) {
        // Return all active instances of this bus number with real-time location
        return ResponseEntity.ok(busService.trackBusByNumber(busNumber));
    }
}
```

**Response Format for `/api/buses/running`:**
```json
[
  {
    "vehicleId": "KA01AB1234",
    "busNumber": "335E",
    "routeName": "Kempegowda Bus Station to Kadugodi",
    "currentLat": 12.9716,
    "currentLng": 77.5946,
    "speed": 35.5,
    "direction": "NE",
    "nextStop": "MG Road",
    "eta": "2 mins",
    "lastUpdate": "2025-01-22T23:15:30Z"
  }
]
```

---

### 2. Route Search Endpoint

```java
@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:3000")
public class RouteController {
    
    @PostMapping("/search")
    public ResponseEntity<List<Route>> searchRoutes(@RequestBody RouteSearchRequest request) {
        // request contains: origin, destination, departTime, serviceType, sortBy
        return ResponseEntity.ok(routeService.findRoutes(
            request.getOrigin(),
            request.getDestination(),
            request.getFilters()
        ));
    }
}
```

**Request Body:**
```json
{
  "origin": "Majestic",
  "destination": "Whitefield",
  "filters": {
    "departTime": "09:30",
    "serviceType": "AC",
    "sortBy": "duration"
  }
}
```

**Response Format:**
```json
[
  {
    "id": 1,
    "type": "direct",
    "buses": ["335E", "500D"],
    "duration": "45 mins",
    "fare": "₹25",
    "from": "Majestic",
    "to": "Whitefield",
    "departTime": "09:30 AM",
    "arriveTime": "10:15 AM",
    "stops": ["Majestic", "Indiranagar", "Marathahalli", "Whitefield"],
    "serviceType": "Ordinary"
  },
  {
    "id": 2,
    "type": "connecting",
    "segments": [
      {
        "bus": "201",
        "from": "Majestic",
        "to": "KR Puram",
        "stops": ["Majestic", "Whitefield Road", "KR Puram"]
      },
      {
        "bus": "500D",
        "from": "KR Puram",
        "to": "Whitefield",
        "stops": ["KR Puram", "ITPL", "Whitefield"]
      }
    ],
    "duration": "1 hr 10 mins",
    "fare": "₹30",
    "serviceType": "AC"
  }
]
```

---

### 3. Stations Endpoint

```java
@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "http://localhost:3000")
public class StationController {
    
    @GetMapping
    public ResponseEntity<List<Station>> getAllStations() {
        return ResponseEntity.ok(stationService.getAllStations());
    }
}
```

**Response Format:**
```json
[
  {
    "id": 1,
    "name": "Kempegowda Bus Station (Majestic)",
    "shortName": "Majestic",
    "latitude": 12.9767,
    "longitude": 77.5713,
    "facilities": ["Waiting Area", "Toilets", "Food Court", "Ticket Counter"]
  }
]
```

---

### 4. Timetable Endpoint

```java
@RestController
@RequestMapping("/api/timetable")
@CrossOrigin(origins = "http://localhost:3000")
public class TimetableController {
    
    @PostMapping("/stations")
    public ResponseEntity<List<Schedule>> getTimetable(@RequestBody TimetableRequest request) {
        return ResponseEntity.ok(timetableService.getSchedule(
            request.getOrigin(),
            request.getDestination(),
            request.getDate()
        ));
    }
}
```

**Request:**
```json
{
  "origin": "Majestic",
  "destination": "Electronic City",
  "date": "2025-01-23"
}
```

**Response:**
```json
[
  {
    "busNumber": "500D",
    "serviceType": "Volvo AC",
    "departTime": "06:00 AM",
    "arriveTime": "07:15 AM",
    "frequency": "15 mins",
    "fare": "₹50"
  }
]
```

---

### 5. Fare Calculator Endpoint

```java
@RestController
@RequestMapping("/api/fare")
@CrossOrigin(origins = "http://localhost:3000")
public class FareController {
    
    @PostMapping("/calculate")
    public ResponseEntity<FareResponse> calculateFare(@RequestBody FareRequest request) {
        return ResponseEntity.ok(fareService.calculate(
            request.getFrom(),
            request.getTo(),
            request.getBusType()
        ));
    }
}
```

**Request:**
```json
{
  "from": "Majestic",
  "to": "Whitefield",
  "busType": "AC"
}
```

**Response:**
```json
{
  "baseFare": 25,
  "acFare": 40,
  "volvoFare": 50,
  "studentFare": 12.5,
  "seniorCitizenFare": 0,
  "distance": 22.5,
  "currency": "INR"
}
```

---

### 6. Feedback Endpoint

```java
@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:3000")
public class FeedbackController {
    
    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(@RequestBody Feedback feedback) {
        Feedback saved = feedbackService.save(feedback);
        return ResponseEntity.ok(new FeedbackResponse(
            "Feedback submitted successfully",
            "FB" + saved.getId(),
            "We will respond within 48 hours"
        ));
    }
}
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "category": "bus_service",
  "busNumber": "335E",
  "rating": 4,
  "subject": "Good service",
  "message": "Bus was clean and on time",
  "timestamp": "2025-01-22T23:20:00Z"
}
```

**Response:**
```json
{
  "message": "Feedback submitted successfully",
  "referenceId": "FB12345678",
  "note": "We will respond within 48 hours"
}
```

---

### 7. Favorites Endpoints

```java
@RestController
@RequestMapping("/api/users/{userId}/favorites")
@CrossOrigin(origins = "http://localhost:3000")
public class FavoritesController {
    
    @GetMapping
    public ResponseEntity<List<String>> getFavorites(@PathVariable String userId) {
        return ResponseEntity.ok(favoritesService.getFavorites(userId));
    }
    
    @PostMapping
    public ResponseEntity<String> addFavorite(
            @PathVariable String userId,
            @RequestBody FavoriteRequest request) {
        favoritesService.add(userId, request.getRouteNumber());
        return ResponseEntity.ok("Favorite added");
    }
    
    @DeleteMapping("/{routeNumber}")
    public ResponseEntity<String> removeFavorite(
            @PathVariable String userId,
            @PathVariable String routeNumber) {
        favoritesService.remove(userId, routeNumber);
        return ResponseEntity.ok("Favorite removed");
    }
}
```

---

### 8. Notifications Endpoint

```java
@RestController
@RequestMapping("/api/users/{userId}/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    
    @PostMapping
    public ResponseEntity<String> setNotification(
            @PathVariable String userId,
            @RequestBody NotificationRequest request) {
        notificationService.configure(
            userId,
            request.getRouteNumber(),
            request.isEnabled()
        );
        return ResponseEntity.ok("Notification settings updated");
    }
}
```

---

### 9. Crowd Prediction Endpoint ⭐ NEW!

```java
@RestController
@RequestMapping("/api/crowd")
@CrossOrigin(origins = "http://localhost:3000")
public class CrowdPredictionController {
    
    @GetMapping("/predict/{busNumber}")
    public ResponseEntity<List<CrowdPrediction>> predictCrowd(@PathVariable String busNumber) {
        // Return crowd predictions for all running instances of this bus
        return ResponseEntity.ok(crowdService.predictCrowdLevel(busNumber));
    }
}
```

**Request:** `GET /api/crowd/predict/335E`

**Response Format:**
```json
[
  {
    "busNumber": "335E",
    "vehicleId": "KA01AB1234",
    "route": "Kempegowda Bus Station - Kadugodi",
    "currentStop": "MG Road",
    "nextStop": "Indiranagar",
    "crowdLevel": "High",
    "occupancyPercent": 85,
    "currentPassengers": 51,
    "maxCapacity": 60,
    "seatsAvailable": 9,
    "standingRoom": false,
    "confidence": 0.87,
    "eta": "8 mins",
    "lastUpdated": "2025-01-22T23:15:30Z",
    "nextStopPrediction": {
      "stop": "Indiranagar",
      "crowdLevel": "Medium",
      "occupancyPercent": 70,
      "expectedBoarding": 5,
      "expectedAlighting": 20
    },
    "upcomingStops": [
      {
        "name": "Indiranagar",
        "crowdLevel": "Medium",
        "eta": "8 mins"
      },
      {
        "name": "Domlur",
        "crowdLevel": "Low",
        "eta": "15 mins"
      },
      {
        "name": "Marathahalli",
        "crowdLevel": "High",
        "eta": "25 mins"
      }
    ]
  }
]
```

**Crowd Levels:**
- `Empty`: 0-20% occupancy
- `Low`: 20-40% occupancy
- `Medium`: 40-60% occupancy
- `High`: 60-80% occupancy
- `Full`: 80-100% occupancy

**Prediction Logic Options:**

**Option 1: Rule-Based (Simple)**
```java
public CrowdLevel predictBasedOnTime() {
    int hour = LocalTime.now().getHour();
    boolean isWeekday = LocalDate.now().getDayOfWeek().getValue() <= 5;
    
    if (isWeekday && (hour >= 7 && hour <= 10 || hour >= 17 && hour <= 20)) {
        return CrowdLevel.HIGH; // Peak hours
    } else if (hour >= 11 && hour <= 16) {
        return CrowdLevel.LOW; // Off-peak
    }
    return CrowdLevel.MEDIUM;
}
```

**Option 2: ML-Based (Advanced)**
```java
public CrowdPrediction predictWithML(String busNumber, String currentStop) {
    // Load trained ML model
    MLModel model = modelService.getModel("crowd-prediction");
    
    // Prepare features
    Features features = Features.builder()
        .busNumber(busNumber)
        .hour(LocalTime.now().getHour())
        .dayOfWeek(LocalDate.now().getDayOfWeek().getValue())
        .isPeakHour(isPeakHour())
        .stopPopularity(stopService.getPopularityIndex(currentStop))
        .weatherCondition(weatherService.getCurrentWeather())
        .build();
    
    // Predict
    Prediction prediction = model.predict(features);
    
    return CrowdPrediction.builder()
        .crowdLevel(prediction.getCrowdLevel())
        .occupancyPercent(prediction.getOccupancyPercent())
        .confidence(prediction.getConfidence())
        .build();
}
```

---

## 🗄️ Database Schema (MySQL/PostgreSQL)

### Table: buses
```sql
CREATE TABLE buses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id VARCHAR(50) UNIQUE NOT NULL,
    bus_number VARCHAR(20) NOT NULL,
    route_name VARCHAR(200),
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    speed DECIMAL(5, 2),
    direction VARCHAR(10),
    next_stop VARCHAR(100),
    eta VARCHAR(20),
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    INDEX idx_bus_number (bus_number),
    INDEX idx_active (is_active)
);
```

### Table: stations
```sql
CREATE TABLE stations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    facilities TEXT,
    INDEX idx_name (name)
);
```

### Table: routes
```sql
CREATE TABLE routes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    route_number VARCHAR(20) NOT NULL,
    route_name VARCHAR(200),
    origin VARCHAR(100),
    destination VARCHAR(100),
    distance_km DECIMAL(6, 2),
    duration_mins INT,
    service_type VARCHAR(20),
    fare DECIMAL(6, 2),
    is_active BOOLEAN DEFAULT true,
    INDEX idx_route_number (route_number)
);
```

### Table: feedback
```sql
CREATE TABLE feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    category VARCHAR(50),
    bus_number VARCHAR(20),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    subject VARCHAR(200),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);
```

### Table: favorites
```sql
CREATE TABLE favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    route_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_route (user_id, route_number),
    INDEX idx_user (user_id)
);
```

---

## ⚙️ Application Properties (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/bmtc_db?useSSL=false&serverTimezone=UTC
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true

server:
  port: 8080
  servlet:
    context-path: /

logging:
  level:
    root: INFO
    com.bmtc: DEBUG
```

---

## 🔒 CORS Configuration (MUST HAVE!)

**Create `CorsConfig.java`:**
```java
package com.bmtc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(
                            "http://localhost:3000",           // React development
                            "https://your-production-url.com"  // Production URL
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
```

---

## 📋 Testing the Backend

### Test with cURL:

```bash
# Test buses endpoint
curl http://localhost:8080/api/buses/running

# Test route search
curl -X POST http://localhost:8080/api/routes/search \
  -H "Content-Type: application/json" \
  -d '{"origin":"Majestic","destination":"Whitefield"}'

# Test feedback submission
curl -X POST http://localhost:8080/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "category":"bus_service",
    "rating":5,
    "subject":"Great service",
    "message":"Very happy with the service"
  }'
```

---

## 🚀 Deployment Checklist

- [ ] All 10 endpoints implemented
- [ ] CORS configured for React app URL
- [ ] Database schema created
- [ ] Sample data inserted for testing
- [ ] Application running on port 8080
- [ ] Endpoints tested with Postman/cURL
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Security configured (if needed)
- [ ] Deployed to server (Heroku/AWS/etc.)
- [ ] Production URL shared with frontend team

---

## 📞 Integration Testing

After backend is ready:

1. Update React `.env` file with backend URL
2. Restart React app: `npm start`
3. Test each feature:
   - Journey Planner search
   - Track bus location
   - Submit feedback
   - View timetable
   - Calculate fare

---

## 🐛 Common Issues & Solutions

**Issue: CORS Error**
```
Solution: Make sure CorsConfig.java is properly configured with React app URL
```

**Issue: 404 Not Found**
```
Solution: Check if Spring Boot is running and endpoints match exactly
```

**Issue: Connection Refused**
```
Solution: Verify backend URL in .env file, check if Spring Boot app is running
```

**Issue: Empty Response**
```
Solution: Check database has sample data, verify JPA repository queries
```

---

## 📖 Example Entity Classes

```java
@Entity
@Table(name = "buses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String vehicleId;
    private String busNumber;
    private String routeName;
    private Double currentLat;
    private Double currentLng;
    private Double speed;
    private String direction;
    private String nextStop;
    private String eta;
    private LocalDateTime lastUpdate;
    private Boolean isActive;
}
```

---

**Once your friend implements these endpoints, your React app will work seamlessly with real data! 🎉**
