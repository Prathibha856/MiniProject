#!/bin/bash

echo "🚀 Installing BusFlow React Native App..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Expo CLI if not already installed
echo "🔧 Installing Expo CLI..."
npm install -g @expo/cli

# Create assets directory if it doesn't exist
echo "📁 Creating assets directory..."
mkdir -p assets

# Create placeholder images
echo "🖼️ Creating placeholder assets..."
echo "Placeholder icon" > assets/icon.png
echo "Placeholder splash" > assets/splash.png
echo "Placeholder adaptive icon" > assets/adaptive-icon.png
echo "Placeholder favicon" > assets/favicon.png

echo "✅ Installation complete!"
echo ""
echo "To start the app:"
echo "  npm start"
echo ""
echo "To run on specific platforms:"
echo "  npm run android"
echo "  npm run ios"
echo "  npm run web"
