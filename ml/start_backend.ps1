# BMTC Journey Planner - Backend Startup Script
# This script helps diagnose and start the backend services

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "BMTC Journey Planner - Backend Startup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if required files exist
Write-Host "`nChecking required files..." -ForegroundColor Yellow
$files = @(
    "fare_service.py",
    "config.py",
    "logger.py"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing!" -ForegroundColor Red
    }
}

# Check GTFS data
Write-Host "`nChecking GTFS data..." -ForegroundColor Yellow
$gtfsDir = "dataset\gtfs"
if (Test-Path $gtfsDir) {
    $gtfsFiles = @("stops.txt", "routes.txt", "shapes.txt")
    foreach ($file in $gtfsFiles) {
        $path = Join-Path $gtfsDir $file
        if (Test-Path $path) {
            $size = (Get-Item $path).Length / 1MB
            Write-Host "✅ $file ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
        } else {
            Write-Host "❌ $file missing!" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ GTFS directory not found!" -ForegroundColor Red
}

# Check if port 5001 is already in use
Write-Host "`nChecking port availability..." -ForegroundColor Yellow
$port5001 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
if ($port5001) {
    Write-Host "⚠️  Port 5001 already in use!" -ForegroundColor Yellow
    Write-Host "   Existing process will be terminated." -ForegroundColor Yellow
    $port5001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
}

# Start fare service
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Starting Fare Service on port 5001..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the service`n" -ForegroundColor Yellow

# Run with explicit configuration
$env:FARE_API_HOST = "0.0.0.0"
$env:FARE_API_PORT = "5001"
$env:CORS_ORIGINS = "http://localhost:3000,http://localhost:3001"

python fare_service.py
