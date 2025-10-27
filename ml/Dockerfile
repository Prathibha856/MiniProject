# ==========================================
# Multi-stage Dockerfile for BMTC ML Backend
# ==========================================

# Stage 1: Base image with Python dependencies
FROM python:3.9-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create application directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# ==========================================
# Stage 2: Production image
# ==========================================
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    APP_ENV=production

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/models /app/logs /app/output /app/dataset/gtfs && \
    chown -R appuser:appuser /app

# Set working directory
WORKDIR /app

# Copy Python packages from base stage
COPY --from=base /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=base /usr/local/bin /usr/local/bin

# Copy application files
COPY --chown=appuser:appuser predict_api.py .
COPY --chown=appuser:appuser fare_service.py .
COPY --chown=appuser:appuser config.py .
COPY --chown=appuser:appuser logger.py .
COPY --chown=appuser:appuser validators.py .
COPY --chown=appuser:appuser start_services.py .

# Copy dataset directory (if exists)
COPY --chown=appuser:appuser dataset/gtfs/ ./dataset/gtfs/ 2>/dev/null || true

# Create volume mount points
VOLUME ["/app/models", "/app/logs", "/app/output", "/app/dataset/gtfs"]

# Switch to non-root user
USER appuser

# Expose Flask API ports
EXPOSE 5000 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Default command - run both services
CMD ["python", "start_services.py"]
