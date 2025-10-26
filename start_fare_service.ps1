# BMTC Fare Calculator - Quick Start Script
# This script starts the backend fare calculation service

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "BMTC Fare Calculator Service" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Navigate to ml directory
Set-Location -Path "ml"

# Check if requirements are installed
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow
$flaskInstalled = pip show flask 2>$null
if (-not $flaskInstalled) {
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    pip install -r requirements_fare.txt
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

# Check if GTFS data exists
Write-Host ""
Write-Host "Checking GTFS dataset..." -ForegroundColor Yellow
if (Test-Path "dataset\gtfs\fare_attributes.txt") {
    Write-Host "✓ GTFS data found" -ForegroundColor Green
} else {
    Write-Host "✗ GTFS data not found at ml/dataset/gtfs/" -ForegroundColor Red
    exit 1
}

# Start the service
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Starting Fare Calculation Service..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will be available at: http://localhost:5001" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

python fare_service.py
