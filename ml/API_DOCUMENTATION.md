# BMTC Bus Crowd Prediction API Documentation

## Overview

The BMTC Bus Crowd Prediction API provides real-time crowd level predictions for Bangalore Metropolitan Transport Corporation buses using machine learning. The API predicts crowd levels based on location, time, and day of week.

**Base URL:** `http://localhost:5000`  
**API Documentation:** `http://localhost:5000/docs` (Swagger UI)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)
8. [SDKs & Client Libraries](#sdks--client-libraries)

---

## Getting Started

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Start the Prediction API
python predict_api.py
```

The API will be available at `http://localhost:5000`

### Quick Start

```bash
# Health check
curl http://localhost:5000/health

# Make a prediction
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "stop_lat": 12.9716,
    "stop_lon": 77.5946,
    "time": "14:30",
    "day_of_week": 1
  }'
```

---

## Authentication

**Current Status:** No authentication required (Development)

**Future Implementation:** The API will support the following authentication methods:

- **API Key Authentication:** Pass API key in `X-API-Key` header
- **OAuth 2.0:** For production deployments
- **Rate Limiting:** Based on API key or IP address

### Example with API Key (Future)

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"stop_lat": 12.9716, "stop_lon": 77.5946}'
```

---

## Endpoints

### 1. Health Check

**GET** `/health`

Check the API health status and model availability.

**Response 200 OK:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "features": ["hour", "day_of_week", "is_rush_hour", "stop_lat", "stop_lon"]
}
```

---

### 2. Predict Crowd Level

**POST** `/predict`

Predict the crowd level at a specific bus stop.

#### Request Body

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| `stop_lat` | float | **Yes** | Latitude of bus stop | 12.7 - 13.2 (Bangalore) |
| `stop_lon` | float | **Yes** | Longitude of bus stop | 77.3 - 77.9 (Bangalore) |
| `time` | string | No | Time in HH:MM format | 24-hour format, defaults to current time |
| `day_of_week` | integer | No | Day of week | 0-6 (Mon-Sun), defaults to current day |

#### Request Example

```json
{
  "stop_lat": 12.9716,
  "stop_lon": 77.5946,
  "time": "14:30",
  "day_of_week": 1
}
```

#### Response 200 OK

```json
{
  "success": true,
  "prediction": {
    "crowd_level": "Medium",
    "crowd_level_code": 1,
    "confidence": 0.75,
    "probabilities": {
      "Low": 0.1,
      "Medium": 0.6,
      "High": 0.2,
      "Very High": 0.1
    }
  },
  "input": {
    "stop_lat": 12.9716,
    "stop_lon": 77.5946,
    "time": "14:30",
    "day_of_week": 1,
    "hour": 14,
    "is_rush_hour": 0
  }
}
```

#### Response 400 Bad Request

```json
{
  "error": "Invalid request data",
  "details": [
    "stop_lat must be between 12.7 and 13.2 (Bangalore bounds)"
  ],
  "success": false
}
```

#### Response 500 Internal Server Error

```json
{
  "error": "Model not loaded. Please train the model first.",
  "success": false
}
```

---

### 3. Batch Predict Crowd Levels

**POST** `/predict/batch`

Predict crowd levels for multiple bus stops in a single request.

**Batch Size Limit:** Maximum 100 requests per batch

#### Request Body

```json
{
  "requests": [
    {
      "stop_lat": 12.9716,
      "stop_lon": 77.5946,
      "time": "14:30",
      "day_of_week": 1
    },
    {
      "stop_lat": 13.0827,
      "stop_lon": 77.5877,
      "time": "18:00",
      "day_of_week": 1
    }
  ]
}
```

#### Response 200 OK

```json
{
  "success": true,
  "predictions": [
    {
      "stop_lat": 12.9716,
      "stop_lon": 77.5946,
      "time": "14:30",
      "hour": 14,
      "is_rush_hour": false,
      "crowd_level": "Medium"
    },
    {
      "stop_lat": 13.0827,
      "stop_lon": 77.5877,
      "time": "18:00",
      "hour": 18,
      "is_rush_hour": true,
      "crowd_level": "High"
    }
  ]
}
```

#### Response 400 Bad Request

```json
{
  "error": "Invalid batch request data",
  "details": [
    "Request 2: stop_lat must be between 12.7 and 13.2 (Bangalore bounds)",
    "Batch size exceeds maximum of 100 requests"
  ],
  "success": false
}
```

---

### 4. Get Model Information

**GET** `/model/info`

Retrieve metadata about the loaded machine learning model.

#### Response 200 OK

```json
{
  "model_type": "RandomForestClassifier",
  "features": ["hour", "day_of_week", "is_rush_hour", "stop_lat", "stop_lon"],
  "classes": [0, 1, 2, 3],
  "n_features": 5
}
```

#### Response 404 Not Found

```json
{
  "error": "Model not loaded"
}
```

---

## Data Models

### Crowd Levels

| Code | Level | Description | Capacity |
|------|-------|-------------|----------|
| 0 | Low | Plenty of seats available | < 25% |
| 1 | Medium | Some seats available | 25-50% |
| 2 | High | Standing room available | 50-75% |
| 3 | Very High | Crowded, limited space | > 75% |

### Rush Hours

| Period | Start | End |
|--------|-------|-----|
| Morning | 07:00 | 09:00 |
| Evening | 17:00 | 19:00 |

### Bangalore Coordinates Bounds

| Boundary | Latitude | Longitude |
|----------|----------|-----------|
| Minimum | 12.7 | 77.3 |
| Maximum | 13.2 | 77.9 |

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message",
  "details": ["Optional detailed error messages"],
  "success": false
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input or validation error |
| 404 | Not Found | Resource not found (e.g., model not loaded) |
| 500 | Internal Server Error | Server-side error or model failure |

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `stop_lat is required` | Missing latitude | Provide `stop_lat` in request |
| `stop_lat must be between 12.7 and 13.2` | Coordinate out of bounds | Use Bangalore coordinates |
| `time must be in HH:MM format` | Invalid time format | Use 24-hour format (e.g., "14:30") |
| `day_of_week must be between 0 and 6` | Invalid day | Use 0 (Monday) to 6 (Sunday) |
| `Model not loaded` | Model file missing | Train the model first |
| `Batch size exceeds maximum of 100` | Too many requests | Split into smaller batches |

---

## Rate Limiting

**Current Status:** No rate limiting (Development)

**Production Limits:** (Planned)
- **Free Tier:** 100 requests per hour
- **Pro Tier:** 1000 requests per hour
- **Enterprise:** Custom limits

### Rate Limit Headers (Future)

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635724800
```

---

## Examples

### Example 1: Morning Rush Hour Prediction

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
    "confidence": 0.85,
    "probabilities": {
      "Low": 0.02,
      "Medium": 0.08,
      "High": 0.25,
      "Very High": 0.65
    }
  },
  "input": {
    "stop_lat": 12.9716,
    "stop_lon": 77.5946,
    "time": "08:30",
    "day_of_week": 1,
    "hour": 8,
    "is_rush_hour": 1
  }
}
```

---

### Example 2: Multiple Stops (Batch)

```bash
curl -X POST http://localhost:5000/predict/batch \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {"stop_lat": 12.9716, "stop_lon": 77.5946, "time": "08:30"},
      {"stop_lat": 12.9352, "stop_lon": 77.6245, "time": "09:00"},
      {"stop_lat": 13.0827, "stop_lon": 77.5877, "time": "18:00"}
    ]
  }'
```

---

### Example 3: Using Current Time

```bash
# Time and day_of_week are optional - defaults to current time
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "stop_lat": 12.9716,
    "stop_lon": 77.5946
  }'
```

---

### Example 4: Python Client

```python
import requests

# API endpoint
url = "http://localhost:5000/predict"

# Request payload
payload = {
    "stop_lat": 12.9716,
    "stop_lon": 77.5946,
    "time": "14:30",
    "day_of_week": 1
}

# Make request
response = requests.post(url, json=payload)
data = response.json()

if data["success"]:
    print(f"Crowd Level: {data['prediction']['crowd_level']}")
    print(f"Confidence: {data['prediction']['confidence']:.2%}")
else:
    print(f"Error: {data['error']}")
```

---

### Example 5: JavaScript Client

```javascript
// Fetch API
fetch('http://localhost:5000/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    stop_lat: 12.9716,
    stop_lon: 77.5946,
    time: '14:30',
    day_of_week: 1
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log(`Crowd Level: ${data.prediction.crowd_level}`);
    console.log(`Confidence: ${data.prediction.confidence}`);
  } else {
    console.error(`Error: ${data.error}`);
  }
});
```

---

### Example 6: cURL with Error Handling

```bash
# Test with invalid coordinates (outside Bangalore)
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "stop_lat": 15.0,
    "stop_lon": 77.5946
  }'

# Response:
{
  "error": "Invalid request data",
  "details": [
    "stop_lat must be between 12.7 and 13.2 (Bangalore bounds)"
  ],
  "success": false
}
```

---

## SDKs & Client Libraries

### Python SDK (Planned)

```bash
pip install bmtc-prediction-sdk
```

```python
from bmtc_prediction import Client

client = Client(api_key="your-api-key")
result = client.predict(lat=12.9716, lon=77.5946, time="14:30")
print(result.crowd_level)
```

### JavaScript/TypeScript SDK (Planned)

```bash
npm install @bmtc/prediction-sdk
```

```typescript
import { BMTCClient } from '@bmtc/prediction-sdk';

const client = new BMTCClient({ apiKey: 'your-api-key' });
const result = await client.predict({
  stopLat: 12.9716,
  stopLon: 77.5946,
  time: '14:30'
});
console.log(result.crowdLevel);
```

---

## Interactive API Documentation

Visit **[http://localhost:5000/docs](http://localhost:5000/docs)** for interactive Swagger UI documentation where you can:

- Try out endpoints directly in your browser
- See request/response examples
- Download OpenAPI specification
- Generate client code

---

## Support

- **Email:** support@bmtc-prediction.com
- **GitHub Issues:** [github.com/bmtc/prediction-api/issues](https://github.com/bmtc/prediction-api/issues)
- **Documentation:** [docs.bmtc-prediction.com](https://docs.bmtc-prediction.com)

---

## Changelog

### Version 1.0.0 (2025-10-26)
- Initial API release
- Swagger/OpenAPI documentation
- Single and batch prediction endpoints
- Health check and model info endpoints
- Comprehensive input validation
- Bangalore coordinate bounds validation
- Rush hour detection

---

## License

MIT License - See LICENSE file for details
