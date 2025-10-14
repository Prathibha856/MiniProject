@echo off
echo 🚀 Starting BusFlow App...

echo 📱 Checking for port conflicts...
netstat -an | findstr :8081 >nul
if %errorlevel% == 0 (
    echo ⚠️  Port 8081 is in use, using port 8082...
    npx expo start --port 8082
) else (
    echo ✅ Port 8081 is available, starting normally...
    npx expo start
)

echo.
echo 🎉 BusFlow app should now be running!
echo 📱 Use Expo Go app to scan the QR code
echo 🌐 Press 'w' for web version
echo 🤖 Press 'a' for Android
echo 🍎 Press 'i' for iOS
pause
