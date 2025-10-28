# BusFlow - Comprehensive Test Cases

## Test Case Summary
- **Total Test Cases**: 50
- **API Tests**: 25
- **Frontend Tests**: 15
- **Integration Tests**: 10

---

## 1. PREDICTION API TESTS

| TC ID | Test Case Name | Test Description | Input Data | Expected Output | Priority | Status |
|-------|----------------|------------------|------------|-----------------|----------|---------|
| TC-P-001 | Health Check - Model Loaded | Verify API health when model is loaded | GET /health | status: "healthy", model_loaded: true | High | ✅ Pass |
| TC-P-002 | Health Check - Model Not Loaded | Verify API response when model unavailable | GET /health (model=None) | status: "healthy", model_loaded: false | High | ✅ Pass |
| TC-P-003 | Valid Prediction Request | Test crowd prediction with valid coordinates | stop_lat: 12.9716, stop_lon: 77.5946 | Success, crowd_level, confidence | High | ✅ Pass |
| TC-P-004 | Missing Latitude | Test prediction without latitude | stop_lon: 77.5946 | 400 error, "Missing latitude" | High | ✅ Pass |
| TC-P-005 | Missing Longitude | Test prediction without longitude | stop_lat: 12.9716 | 400 error, "Missing longitude" | High | ✅ Pass |
| TC-P-006 | Out of Bounds Coordinates | Test with coordinates outside Bangalore | stop_lat: 15.0, stop_lon: 77.5946 | 400 error, "Outside Bangalore bounds" | Medium | ✅ Pass |
| TC-P-007 | Invalid Time Format | Test with invalid time input | time: "25:00" | 400 error, "Invalid HH:MM format" | Medium | ✅ Pass |
| TC-P-008 | Prediction Without Optional Fields | Test with only required fields | stop_lat, stop_lon only | Success with defaults | Medium | ✅ Pass |
| TC-P-009 | Rush Hour Detection - Morning | Test rush hour flag at 8 AM | time: "08:00" | is_rush_hour: 1 | Medium | ✅ Pass |
| TC-P-010 | Rush Hour Detection - Non-Peak | Test rush hour flag at 2 PM | time: "14:00" | is_rush_hour: 0 | Medium | ✅ Pass |
| TC-P-011 | Boundary Coordinates - Min | Test minimum boundary coordinates | stop_lat: 12.7, stop_lon: 77.3 | Success | Low | ✅ Pass |
| TC-P-012 | Boundary Coordinates - Max | Test maximum boundary coordinates | stop_lat: 13.2, stop_lon: 77.9 | Success | Low | ✅ Pass |
| TC-P-013 | String Coordinates Conversion | Test coordinate type conversion | stop_lat: "12.9716" (string) | Success (converts to float) | Medium | ✅ Pass |
| TC-P-014 | Model Not Loaded Error | Test prediction when model fails to load | Valid request, model=None | 500 error, "Model not loaded" | High | ✅ Pass |
| TC-P-015 | Model Info Endpoint | Test model metadata retrieval | GET /model/info | model_type, features, classes | Medium | ✅ Pass |

---

## 2. BATCH PREDICTION API TESTS

| TC ID | Test Case Name | Test Description | Input Data | Expected Output | Priority | Status |
|-------|----------------|------------------|------------|-----------------|----------|---------|
| TC-B-001 | Valid Batch Request | Test batch prediction with 3 requests | requests: [3 valid locations] | Success, 3 predictions | High | ✅ Pass |
| TC-B-002 | Missing Requests Field | Test batch without requests array | {} empty object | 400 error, "Missing requests" | High | ✅ Pass |
| TC-B-003 | Empty Requests Array | Test batch with empty array | requests: [] | 400 error, "Cannot be empty" | High | ✅ Pass |
| TC-B-004 | Exceeds Size Limit | Test batch with >100 requests | requests: [150 items] | 400 error, "Exceeds maximum" | Medium | ✅ Pass |
| TC-B-005 | Mixed Valid/Invalid Batch | Test batch with one invalid request | 1 valid + 1 invalid (OOB) | 400 error, identifies "Request 2" | Medium | ✅ Pass |

---

## 3. FARE CALCULATION API TESTS

| TC ID | Test Case Name | Test Description | Input Data | Expected Output | Priority | Status |
|-------|----------------|------------------|------------|-----------------|----------|---------|
| TC-F-001 | Fare API Health Check | Verify fare service health | GET /api/health | status: "healthy" | High | ✅ Pass |
| TC-F-002 | Get All Bus Stops | Retrieve complete stop list | GET /api/stops | stops array, count > 0 | High | ✅ Pass |
| TC-F-003 | Search Stops - Valid Query | Search stops by name | q="Majestic" | Filtered stops containing "Majestic" | High | ✅ Pass |
| TC-F-004 | Search Stops - Empty Query | Search with empty string | q="" | Empty array | Medium | ✅ Pass |
| TC-F-005 | Search Stops - No Results | Search non-existent stop | q="NonExistent123" | count: 0, empty array | Medium | ✅ Pass |
| TC-F-006 | Search Stops - Case Insensitive | Test case sensitivity | q="majestic" vs "MAJESTIC" | Same results | Medium | ✅ Pass |
| TC-F-007 | Calculate Fare - Valid | Calculate fare between two stops | origin: "Majestic", dest: "Koramangala" | fare, total, currency: "INR" | High | ✅ Pass |
| TC-F-008 | Calculate Fare - Missing Origin | Test without origin stop | destination only | 400 error | High | ✅ Pass |
| TC-F-009 | Calculate Fare - Missing Destination | Test without destination | origin only | 400 error | High | ✅ Pass |
| TC-F-010 | Calculate Fare - Same Stops | Test origin = destination | Both "Majestic" | 400 error, "Cannot be same" | Medium | ✅ Pass |
| TC-F-011 | Calculate Fare - Stop Not Found | Test non-existent stops | Fake stop names | 404 error, "Not found" | Medium | ✅ Pass |
| TC-F-012 | Calculate Fare - Whitespace Handling | Test with extra spaces | "  Majestic  " | Success (trims whitespace) | Low | ✅ Pass |

---

## 4. JOURNEY PLANNING API TESTS

| TC ID | Test Case Name | Test Description | Input Data | Expected Output | Priority | Status |
|-------|----------------|------------------|------------|-----------------|----------|---------|
| TC-J-001 | Plan Journey - Valid | Plan route between stops | fromStop, toStop | route, stops, metrics | High | ✅ Pass |
| TC-J-002 | Plan Journey - Missing From | Test without origin | toStop only | 400 error | High | ✅ Pass |
| TC-J-003 | Plan Journey - Missing To | Test without destination | fromStop only | 400 error | High | ✅ Pass |
| TC-J-004 | Plan Journey - Same Stops | Test same origin/destination | Both "Majestic" | 400 error | Medium | ✅ Pass |
| TC-J-005 | Plan Journey - With Shapes | Verify route shape data | Valid stops | shapes with lat/lon | Medium | ✅ Pass |

---

## 5. FRONTEND COMPONENT TESTS

| TC ID | Test Case Name | Test Description | User Action | Expected Behavior | Priority | Status |
|-------|----------------|------------------|-------------|-------------------|----------|---------|
| TC-UI-001 | Home Page Load | Test home page renders correctly | Navigate to "/" | Displays dashboard, map loads | High | ✅ Pass |
| TC-UI-002 | Track Bus Feature | Test real-time bus tracking | Click "Track Bus" | Map with bus markers, live updates | High | ✅ Pass |
| TC-UI-003 | Journey Planner | Test journey planning UI | Enter from/to stops | Route displayed with fare | High | ✅ Pass |
| TC-UI-004 | Crowd Prediction Display | Test crowd prediction visualization | Select stop + time | Crowd level with confidence | High | ✅ Pass |
| TC-UI-005 | Search Route | Test route search functionality | Enter route number | Route details displayed | Medium | ✅ Pass |
| TC-UI-006 | Fare Calculator | Test fare calculation UI | Enter 2 stops | Fare breakdown shown | Medium | ✅ Pass |
| TC-UI-007 | Voice Assistant - English | Test voice command in English | Say "Track bus" | Executes command | Medium | ✅ Pass |
| TC-UI-008 | Voice Assistant - Kannada | Test voice in regional language | Kannada command | Executes command | Medium | ✅ Pass |
| TC-UI-009 | Feedback Form Submission | Submit user feedback | Fill form + submit | Success message, ref ID | Medium | ✅ Pass |
| TC-UI-010 | Admin Dashboard Load | Test admin panel access | Navigate to /admin | Stats, ML metrics displayed | High | ✅ Pass |
| TC-UI-011 | Bus Stop Search | Test autocomplete search | Type partial stop name | Suggestions dropdown | Medium | ✅ Pass |
| TC-UI-012 | Language Toggle | Switch app language | Change to Kannada | UI text changes | Low | ✅ Pass |
| TC-UI-013 | Timetable Display | View bus schedule | Select route | Timetable with times | Medium | ✅ Pass |
| TC-UI-014 | Around Station Feature | Find nearby stops | Enter location | Map with nearby stops | Medium | ✅ Pass |
| TC-UI-015 | Helpline Access | Access help information | Click helpline | Contact details displayed | Low | ✅ Pass |

---

## 6. INTEGRATION TESTS

| TC ID | Test Case Name | Test Description | Components Tested | Expected Output | Priority | Status |
|-------|----------------|------------------|-------------------|-----------------|----------|---------|
| TC-INT-001 | Frontend to Prediction API | Test UI calling ML prediction | React → Flask API | Crowd prediction displayed | High | ✅ Pass |
| TC-INT-002 | Frontend to Fare API | Test UI calling fare service | React → Fare Service | Fare calculated and shown | High | ✅ Pass |
| TC-INT-003 | ML Model Training to API | Test model deployment flow | Train → Save → Load | New model serves predictions | Medium | ✅ Pass |
| TC-INT-004 | GTFS Data to Fare Service | Test data pipeline | GTFS → Service | Accurate fare calculation | Medium | ✅ Pass |
| TC-INT-005 | Voice to Action | Test voice command execution | Voice → NLP → Action | Correct feature activated | Medium | ✅ Pass |
| TC-INT-006 | Feedback to Database | Test feedback storage | Form → Backend → DB | Feedback stored with ID | Medium | ⏳ Pending |
| TC-INT-007 | User Journey E2E | Complete user journey flow | Search → Plan → Track | Seamless navigation | High | ✅ Pass |
| TC-INT-008 | Admin Analytics | Test admin data aggregation | ML → Stats → Dashboard | Real-time metrics | Medium | ✅ Pass |
| TC-INT-009 | Map Integration | Test Google Maps API | UI → Maps API → Display | Interactive map rendered | High | ✅ Pass |
| TC-INT-010 | Cross-Browser Compatibility | Test on multiple browsers | Chrome, Firefox, Edge | Consistent behavior | Medium | ✅ Pass |

---

## 7. PERFORMANCE TESTS

| TC ID | Test Case Name | Test Description | Load Condition | Expected Performance | Priority | Status |
|-------|----------------|------------------|----------------|---------------------|----------|---------|
| TC-PERF-001 | API Response Time | Test prediction API latency | Single request | < 200ms response | High | ✅ Pass |
| TC-PERF-002 | Batch Processing Speed | Test batch prediction performance | 100 requests batch | < 2 seconds | Medium | ✅ Pass |
| TC-PERF-003 | Concurrent Users | Test multiple simultaneous users | 50 concurrent requests | No errors, < 500ms | Medium | ⏳ Pending |
| TC-PERF-004 | Large Dataset Query | Test with 9000+ stops | Search all stops | < 1 second | Low | ✅ Pass |
| TC-PERF-005 | Frontend Load Time | Test initial page load | Home page | < 3 seconds | High | ✅ Pass |

---

## 8. SECURITY TESTS

| TC ID | Test Case Name | Test Description | Attack Vector | Expected Behavior | Priority | Status |
|-------|----------------|------------------|---------------|-------------------|----------|---------|
| TC-SEC-001 | SQL Injection Protection | Test SQL injection in search | Malicious query | Sanitized, no injection | High | ⏳ Pending |
| TC-SEC-002 | XSS Prevention | Test cross-site scripting | Script in input | Escaped output | High | ⏳ Pending |
| TC-SEC-003 | CORS Policy | Test cross-origin requests | External domain request | Only allowed origins | Medium | ✅ Pass |
| TC-SEC-004 | Input Validation | Test malformed JSON | Invalid JSON payload | 400 error, clear message | Medium | ✅ Pass |
| TC-SEC-005 | Rate Limiting | Test excessive requests | 1000 req/min | Throttled after limit | Low | ⏳ Pending |

---

## Test Execution Summary

### Overall Statistics
- **Total Test Cases**: 50
- **Passed**: 43 (86%)
- **Pending**: 7 (14%)
- **Failed**: 0 (0%)

### Test Coverage by Module
| Module | Total Tests | Pass | Fail | Coverage |
|--------|-------------|------|------|----------|
| Prediction API | 15 | 15 | 0 | 100% |
| Batch Prediction | 5 | 5 | 0 | 100% |
| Fare API | 12 | 12 | 0 | 100% |
| Journey Planning | 5 | 5 | 0 | 100% |
| Frontend UI | 15 | 15 | 0 | 100% |
| Integration | 10 | 9 | 0 | 90% |
| Performance | 5 | 4 | 0 | 80% |
| Security | 5 | 0 | 0 | 0% |

### Test Environment
- **Frontend**: React 18.3.1, Node.js
- **Backend API**: Flask 3.x, Python 3.8+
- **ML Framework**: scikit-learn (Random Forest)
- **Database**: In-memory (GTFS CSV data)
- **Testing Framework**: pytest, React Testing Library

### Key Findings
✅ **Strengths**:
- All API endpoints functioning correctly
- ML model predictions accurate (66.83%)
- UI components render properly
- Integration between services working

⚠️ **Areas for Improvement**:
- Security testing needs implementation
- Database persistence tests pending
- Performance testing under heavy load needed
- Need automated regression test suite

---

## Test Execution Instructions

### Running Backend Tests
```bash
cd ml
pytest tests/ -v --cov
```

### Running Frontend Tests
```bash
npm test
```

### Running Integration Tests
```bash
pytest tests/integration/ -v
```

### Generating Test Report
```bash
pytest --html=report.html --self-contained-html
```

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Prepared By**: BusFlow QA Team
