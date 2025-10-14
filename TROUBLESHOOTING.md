# BusFlow - Troubleshooting Guide

## Common Issues and Solutions

### 1. Installation Issues

**Problem:** `npm install` fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### 2. Expo CLI Issues

**Problem:** Expo CLI not found
**Solution:**
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Or use npx
npx expo start
```

### 3. Metro Bundler Issues

**Problem:** Metro bundler fails to start
**Solution:**
```bash
# Clear Metro cache
npx expo start --clear

# Or reset Metro cache
npx react-native start --reset-cache
```

### 4. Android/iOS Build Issues

**Problem:** Build fails on Android/iOS
**Solution:**
```bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios

# Or use Expo Go app
npx expo start
# Then scan QR code with Expo Go app
```

### 5. Location Permission Issues

**Problem:** Location not working
**Solution:**
- Check device location settings
- Grant location permission in app settings
- For Android: Add location permissions in app.json
- For iOS: Add location usage description

### 6. Map Issues

**Problem:** Map not displaying
**Solution:**
- The app uses a placeholder map component
- For real maps, install react-native-maps properly
- Configure Google Maps API key if needed

### 7. Navigation Issues

**Problem:** Navigation not working
**Solution:**
```bash
# Install required dependencies
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# Install peer dependencies
npx expo install react-native-screens react-native-safe-area-context
```

### 8. Styling Issues

**Problem:** TailwindCSS not working
**Solution:**
```bash
# Install NativeWind
npm install nativewind

# Configure babel.config.js (already done)
# Configure tailwind.config.js (already done)
```

### 9. AsyncStorage Issues

**Problem:** Data not persisting
**Solution:**
```bash
# Install AsyncStorage
npx expo install @react-native-async-storage/async-storage
```

### 10. Performance Issues

**Problem:** App running slowly
**Solution:**
- Use React DevTools Profiler
- Optimize images and assets
- Use FlatList for large lists
- Implement proper memoization

## Quick Fixes

### Reset Everything
```bash
# Clear all caches and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npx expo start --clear
```

### Check Dependencies
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update
```

### Debug Mode
```bash
# Start with debug mode
npx expo start --dev-client

# Or with tunnel
npx expo start --tunnel
```

## Platform-Specific Issues

### Android
- Ensure Android SDK is installed
- Check device/emulator is connected
- Verify USB debugging is enabled

### iOS
- Ensure Xcode is installed
- Check iOS Simulator is available
- Verify Apple Developer account (for device testing)

### Web
- Some native features won't work on web
- Use responsive design for web compatibility
- Test with different browsers

## Getting Help

1. Check Expo documentation: https://docs.expo.dev/
2. Check React Navigation docs: https://reactnavigation.org/
3. Check React Native docs: https://reactnative.dev/
4. Search GitHub issues for specific packages
5. Ask on Stack Overflow with relevant tags

## Contact

For BusFlow-specific issues, please create an issue in the project repository.
