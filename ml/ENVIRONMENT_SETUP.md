# Environment Configuration Guide

## Quick Start

### Development Mode (Default) ✅
No environment variables needed! Just run:
```bash
python predict_api.py
python fare_service.py
```

**What you get:**
- Debug mode enabled
- Verbose logging (DEBUG level)
- No rate limiting
- CORS allows all origins
- No caching (fresh data every request)

---

## Environment Variable Priority

The configuration checks environment variables in this order:

1. **APP_ENV** (highest priority)
2. **FLASK_ENV** (Flask compatibility)
3. **ENVIRONMENT** (legacy support)
4. **Default:** `development`

---

## Running in Different Environments

### 1. Development (Default)

**Option A: No environment variables (recommended)**
```bash
python predict_api.py
```

**Option B: Explicit**
```bash
# Windows PowerShell
$env:APP_ENV="development"
python predict_api.py

# Linux/Mac
APP_ENV=development python predict_api.py
```

**Features:**
- ✅ Debug mode ON
- ✅ Verbose logging
- ✅ No authentication
- ✅ CORS allows all
- ✅ No rate limiting

---

### 2. Testing

```bash
# Windows PowerShell
$env:APP_ENV="testing"
python test_api.py

# Linux/Mac
APP_ENV=testing python test_api.py
```

**Features:**
- ✅ Debug mode ON
- ✅ Testing mode ON
- ✅ Uses test data paths
- ✅ Faster timeouts
- ✅ No external services

---

### 3. Production ⚠️

**REQUIRES SECRET_KEY!**

```bash
# Windows PowerShell
$env:APP_ENV="production"
$env:SECRET_KEY="your-super-secret-key-min-32-chars"
python predict_api.py

# Linux/Mac
APP_ENV=production SECRET_KEY="your-super-secret-key" python predict_api.py
```

**Features:**
- ✅ Debug mode OFF
- ✅ Minimal logging (WARNING level)
- ✅ CORS restricted
- ✅ Caching enabled (Redis)
- ✅ Rate limiting enabled
- ✅ Metrics enabled

**Production Checklist:**
- [ ] Set SECRET_KEY (required!)
- [ ] Configure CORS_ORIGINS
- [ ] Set up Redis for caching
- [ ] Configure rate limiting
- [ ] Set LOG_LEVEL appropriately
- [ ] Use production WSGI server (gunicorn)

---

## Configuration File (.env)

For persistent configuration, create a `.env` file:

```bash
# Copy the example file
cp .env.example .env

# Edit with your settings
# Note: .env is in .gitignore (won't be committed)
```

**Example .env for production:**
```env
APP_ENV=production
SECRET_KEY=your-secure-secret-key-change-this
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
LOG_LEVEL=WARNING
REDIS_HOST=localhost
REDIS_PORT=6379
RATE_LIMIT_ENABLED=True
```

**Load .env file:**
```bash
# Install python-dotenv
pip install python-dotenv

# In your Python code
from dotenv import load_dotenv
load_dotenv()

# Now environment variables are loaded
from config import config
```

---

## Common Use Cases

### Local Development (Recommended)
```bash
# Just run it - uses development config by default
python predict_api.py
```

### Testing Your Changes
```bash
APP_ENV=testing python -m pytest tests/
```

### Staging Environment
```bash
APP_ENV=development \
LOG_LEVEL=INFO \
CORS_ORIGINS=https://staging.yourdomain.com \
python predict_api.py
```

### Production Deployment
```bash
APP_ENV=production \
SECRET_KEY=$(openssl rand -base64 32) \
CORS_ORIGINS=https://yourdomain.com \
LOG_LEVEL=WARNING \
REDIS_HOST=redis.internal \
gunicorn -w 4 -b 0.0.0.0:5000 predict_api:app
```

---

## Checking Current Configuration

### View Configuration Summary
```python
from config import print_config_summary
print_config_summary()
```

**Output:**
```
============================================================
BMTC Application Configuration
============================================================
Environment: DEVELOPMENT
Debug Mode: True
Log Level: DEBUG

API Endpoints:
  Prediction API: http://0.0.0.0:5000
  Fare API: http://0.0.0.0:5001

CORS Origins:
  - *

Fare Configuration:
  Tier 1: Up to 2.0 km = ₹5.0
  Tier 2: Up to 5.0 km = ₹10.0
  ...
============================================================
```

### Check Environment Programmatically
```python
from config import config, is_development, is_production, is_testing, ENVIRONMENT

print(f"Environment: {ENVIRONMENT}")
print(f"Is Development: {is_development()}")
print(f"Is Production: {is_production()}")
print(f"Debug Mode: {config.DEBUG}")
print(f"Port: {config.PREDICT_API_PORT}")
```

---

## Testing Configuration

Run the configuration test suite:
```bash
python test_config.py
```

**Tests:**
- ✅ Default to development
- ✅ Explicit environment selection
- ✅ Environment variable priority
- ✅ Production requires SECRET_KEY
- ✅ All three configs load correctly

---

## Troubleshooting

### Problem: SECRET_KEY Error

**Error:**
```
⚠️  PRODUCTION CONFIGURATION ERROR
SECRET_KEY must be set in production environment.
```

**Solution:**
```bash
# Set SECRET_KEY for production
$env:SECRET_KEY="your-secret-key"  # PowerShell
export SECRET_KEY="your-secret-key"  # Linux/Mac

# OR run in development mode (no SECRET_KEY needed)
python predict_api.py  # Uses development by default
```

### Problem: Wrong Environment Loading

**Check which environment variables are set:**
```bash
# PowerShell
Get-ChildItem Env: | Where-Object {$_.Name -match "ENV|ENVIRONMENT"}

# Linux/Mac
env | grep ENV
```

**Clear environment variables:**
```bash
# PowerShell
Remove-Item Env:APP_ENV
Remove-Item Env:FLASK_ENV
Remove-Item Env:ENVIRONMENT

# Linux/Mac
unset APP_ENV FLASK_ENV ENVIRONMENT
```

### Problem: Configuration Not Updating

**Config is cached after first import. To reload:**
```python
import sys

# Remove config from cache
if 'config' in sys.modules:
    del sys.modules['config']

# Now import fresh
from config import config
```

---

## Best Practices

### Development
✅ **DO:**
- Use default (no environment variables)
- Enable verbose logging
- Test with different ports

❌ **DON'T:**
- Set production environment variables
- Use production secrets

### Production
✅ **DO:**
- Always set SECRET_KEY
- Use environment-specific .env files
- Enable monitoring and metrics
- Use production WSGI server
- Configure CORS properly
- Set up Redis for caching

❌ **DON'T:**
- Use debug mode
- Allow CORS from all origins
- Skip rate limiting
- Use default secret key

---

## Summary

| Mode | Command | SECRET_KEY | Debug | Logging |
|------|---------|------------|-------|---------|
| **Development** | `python predict_api.py` | Not needed | ON | DEBUG |
| **Testing** | `APP_ENV=testing python test.py` | Not needed | ON | DEBUG |
| **Production** | `APP_ENV=production SECRET_KEY=... python predict_api.py` | **Required** | OFF | WARNING |

**Default:** Development mode (safest for local work)

**Remember:** 
- Development mode works out of the box
- Production mode requires SECRET_KEY
- Use .env files for persistent config
- Never commit secrets to git
