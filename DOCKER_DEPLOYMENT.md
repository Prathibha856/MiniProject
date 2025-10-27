# Docker Deployment Guide

Complete guide for deploying the BMTC Bus Crowd Prediction System using Docker and Docker Compose.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Building Images](#building-images)
- [Running Services](#running-services)
- [Stopping Services](#stopping-services)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## 🔧 Prerequisites

Before deploying, ensure you have:

1. **Docker** (version 20.10+)
   ```bash
   docker --version
   ```

2. **Docker Compose** (version 2.0+)
   ```bash
   docker-compose --version
   ```

3. **Model Files** - Trained ML model must exist at:
   - `ml/models/crowd_prediction_model.pkl`
   - `ml/models/feature_info.pkl`

4. **GTFS Data** - Bus route data at:
   - `ml/dataset/gtfs/stops.txt`
   - `ml/dataset/gtfs/routes.txt`
   - `ml/dataset/gtfs/fare_attributes.txt`
   - `ml/dataset/gtfs/fare_rules.txt`

---

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
cd F:/MiniProject
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
notepad .env  # Windows
# or
nano .env     # Linux/Mac
```

### 3. Build and Run
```bash
# Build all services
docker-compose build

# Start all services in detached mode
docker-compose up -d
```

### 4. Verify Deployment
```bash
# Check service status
docker-compose ps

# Check logs
docker-compose logs -f

# Test APIs
curl http://localhost:5000/health
curl http://localhost:5001/api/health
curl http://localhost:3000/health
```

**Access the application:**
- **Frontend**: http://localhost:3000
- **Prediction API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/docs
- **Fare Service**: http://localhost:5001

---

## ⚙️ Configuration

### Environment Variables

Key variables in `.env`:

```bash
# Application
APP_ENV=production
DEBUG=False
LOG_LEVEL=INFO

# Ports
PREDICT_API_PORT=5000
FARE_API_PORT=5001
FRONTEND_PORT=3000

# CORS (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Security
SECRET_KEY=your-secure-secret-key-here

# Frontend
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FARE_API_URL=http://localhost:5001
REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key-here
```

### Generate Secure Secret Key
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 🏗️ Building Images

### Build All Services
```bash
docker-compose build
```

### Build Individual Services
```bash
# ML Backend only
docker-compose build ml-backend

# Frontend only
docker-compose build frontend
```

### Build with No Cache (Fresh Build)
```bash
docker-compose build --no-cache
```

---

## ▶️ Running Services

### Start All Services
```bash
# Foreground (with logs)
docker-compose up

# Background (detached)
docker-compose up -d
```

### Start Specific Service
```bash
docker-compose up ml-backend
docker-compose up frontend
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ml-backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 ml-backend
```

### Execute Commands in Container
```bash
# Access ML backend shell
docker-compose exec ml-backend /bin/sh

# Run Python commands
docker-compose exec ml-backend python -c "from config import config; print(config.MODEL_PATH)"

# Check file structure
docker-compose exec ml-backend ls -la /app
```

---

## 🛑 Stopping Services

### Stop All Services
```bash
docker-compose stop
```

### Stop and Remove Containers
```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ Deletes logs/output)
```bash
docker-compose down -v
```

### Restart Services
```bash
docker-compose restart
```

---

## 🔍 Troubleshooting

### Check Service Health
```bash
# ML Backend health
curl http://localhost:5000/health

# Fare API health
curl http://localhost:5001/api/health

# Frontend health
curl http://localhost:3000/health
```

### Common Issues

#### 1. Model File Not Found
```bash
# Check if model exists
ls -la ml/models/

# Train model if missing
cd ml
python train_model_v3.py
```

#### 2. Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Linux/Mac

# Change port in .env
PREDICT_API_PORT=5002
```

#### 3. Container Won't Start
```bash
# Check container logs
docker-compose logs ml-backend

# Inspect container
docker inspect bmtc-ml-backend

# Check container status
docker ps -a
```

#### 4. GTFS Data Missing
```bash
# Verify GTFS files
ls -la ml/dataset/gtfs/

# Download if missing (see main README)
```

#### 5. Permission Issues
```bash
# Fix permissions (Linux/Mac)
sudo chown -R $USER:$USER ml/models ml/logs ml/output

# Windows - run PowerShell as Administrator
icacls ml\models /grant Everyone:F /T
```

---

## 🚢 Production Deployment

### Production Checklist

1. **Security**
   ```bash
   # Generate secure secret key
   export SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
   
   # Set production environment
   export APP_ENV=production
   export DEBUG=False
   ```

2. **CORS Configuration**
   ```bash
   # Set actual domain
   export CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

3. **SSL/TLS**
   - Use reverse proxy (Nginx, Traefik, Caddy)
   - Configure SSL certificates (Let's Encrypt)
   - Force HTTPS redirect

4. **Resource Limits**
   - Configure in `docker-compose.yml`
   - Set CPU and memory limits
   - Monitor resource usage

5. **Logging**
   ```bash
   # Set appropriate log level
   export LOG_LEVEL=WARNING
   
   # Configure log rotation
   # Already set in docker-compose.yml
   ```

6. **Monitoring**
   ```bash
   # Enable metrics
   export METRICS_ENABLED=True
   export TRACK_PERFORMANCE=True
   ```

### Production Build
```bash
# Build production images
docker-compose -f docker-compose.yml build

# Tag images
docker tag bmtc-ml-backend:latest your-registry/bmtc-ml-backend:v1.0
docker tag bmtc-frontend:latest your-registry/bmtc-frontend:v1.0

# Push to registry
docker push your-registry/bmtc-ml-backend:v1.0
docker push your-registry/bmtc-frontend:v1.0
```

### Production Deployment with Environment File
```bash
# Use production environment file
docker-compose --env-file .env.production up -d
```

### Health Monitoring
```bash
# Check health status
docker-compose ps

# Auto-restart on failure (already configured)
restart: unless-stopped
```

### Backup Volumes
```bash
# Backup models
docker run --rm -v bmtc-ml-logs:/data -v $(pwd):/backup alpine tar czf /backup/logs-backup.tar.gz /data

# Backup logs
docker run --rm -v bmtc-ml-output:/data -v $(pwd):/backup alpine tar czf /backup/output-backup.tar.gz /data
```

---

## 📊 Docker Commands Reference

### Images
```bash
# List images
docker images

# Remove image
docker rmi bmtc-ml-backend:latest

# Prune unused images
docker image prune -a
```

### Containers
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Remove container
docker rm bmtc-ml-backend

# Remove all stopped containers
docker container prune
```

### Volumes
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect bmtc-ml-logs

# Remove volume
docker volume rm bmtc-ml-logs

# Remove all unused volumes
docker volume prune
```

### Networks
```bash
# List networks
docker network ls

# Inspect network
docker network inspect bmtc-network

# Remove network
docker network rm bmtc-network
```

---

## 🔗 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Production Deployment Guide](https://docs.docker.com/compose/production/)

---

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review [Troubleshooting](#troubleshooting) section
3. Open an issue on GitHub
4. Contact: support@bmtc-prediction.com

---

**Happy Deploying! 🎉**
