@echo off
echo ========================================
echo Starting Expo Web Server...
echo ========================================
echo.
echo The web server will start on http://localhost:19006
echo Press Ctrl+C to stop the server
echo.

call npx expo start --web

pause
