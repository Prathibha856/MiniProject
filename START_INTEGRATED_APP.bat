@echo off
echo ========================================
echo   BusFlow - Integrated ML Application
echo ========================================
echo.
echo Starting ML API and React Frontend...
echo.

REM Check if ML API is already running
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] ML API already running on http://localhost:5000
) else (
    echo [STARTING] ML API on http://localhost:5000
    start "ML API - Flask" cmd /k "cd /d f:\MiniProject\ml && python predict_api.py"
    echo Waiting for ML API to start...
    timeout /t 5 /nobreak >nul
)

echo.
echo [STARTING] React Frontend on http://localhost:3000
start "BusFlow Frontend - React" cmd /k "cd /d f:\MiniProject && npm start"

echo.
echo ========================================
echo   Both services are starting!
echo ========================================
echo.
echo ML API:      http://localhost:5000
echo React App:   http://localhost:3000
echo.
echo Press any key to view integration guide...
pause >nul
start ML_FRONTEND_INTEGRATION.md
