@echo off
echo 🚀 Installing BusFlow React Native App...

echo 📦 Installing dependencies...
npm install

echo 🔧 Installing Expo CLI...
npm install -g @expo/cli

echo 📁 Creating assets directory...
if not exist assets mkdir assets

echo 🖼️ Creating placeholder assets...
echo Placeholder icon > assets\icon.png
echo Placeholder splash > assets\splash.png
echo Placeholder adaptive icon > assets\adaptive-icon.png
echo Placeholder favicon > assets\favicon.png

echo ✅ Installation complete!
echo.
echo To start the app:
echo   npm start
echo.
echo To run on specific platforms:
echo   npm run android
echo   npm run ios
echo   npm run web
pause
