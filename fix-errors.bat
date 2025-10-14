@echo off
echo 🔧 Fixing BusFlow App Errors...

echo 📦 Updating React Native version...
npx expo install --fix

echo 📁 Creating missing assets...
if not exist assets mkdir assets
echo # Placeholder icon > assets\icon.png
echo # Placeholder splash > assets\splash.png
echo # Placeholder adaptive icon > assets\adaptive-icon.png
echo # Placeholder favicon > assets\favicon.png

echo 🧹 Clearing Metro cache...
npx expo start --clear

echo ✅ Errors should now be fixed!
echo 📱 The app should be running on http://localhost:8081
echo 🌐 Open in browser or scan QR code with Expo Go app
pause
