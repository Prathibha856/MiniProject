# Fix for React Native Web Bundling Errors

## Problem
React Native 0.76.5 has significant compatibility issues with web bundling through Expo/Webpack. The errors you're seeing are due to:
1. Missing module exports in React Native's internal files
2. Platform-specific modules that don't exist on web
3. Incompatible module resolution between React Native and react-native-web

## Solution

### Step 1: Install Required Dependencies
Run the following command to install necessary babel plugins:

```bash
npm install --save-dev @babel/plugin-proposal-class-properties @babel/plugin-transform-runtime @babel/preset-flow @babel/preset-react babel-loader
```

### Step 2: Clean and Reinstall
Clear your cache and reinstall dependencies:

```bash
# Delete node_modules and cache
rm -rf node_modules
rm -rf .expo
rm -rf web-build

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

### Step 3: Start the Web Server
After reinstalling, start the web development server:

```bash
npm run web
```

## Alternative Solution: Downgrade React Native

If the above doesn't work, the most reliable solution is to use Expo SDK 54's recommended React Native version:

1. Update `package.json` to use React Native 0.74.x:
```json
"react-native": "0.74.5"
```

2. Reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## What Was Changed

1. **webpack.config.js** - Created custom webpack configuration that:
   - Aliases `react-native` to `react-native-web`
   - Adds babel-loader for React Native modules
   - Suppresses warnings about missing modules
   - Configures proper module resolution

2. **package.json** - Added:
   - Babel plugins for proper transpilation
   - Module resolutions
   - Downgraded React Native to 0.76.3

3. **app.json** - Added web configuration with webpack bundler

## Why This Happens

React Native 0.76.x introduced breaking changes in its internal module structure. Many internal modules like:
- `Libraries/Utilities/Platform`
- `Libraries/Components/View/View`
- `Libraries/Image/Image`
- `Libraries/Network/RCTNetworking`

...are not properly exported or don't have web equivalents, causing webpack to fail when trying to bundle for web.

## Recommended Approach

For production apps, it's recommended to:
1. Use Expo's recommended React Native version for your Expo SDK
2. Avoid using React Native's internal APIs directly
3. Use `react-native-web` compatible components
4. Test web builds regularly during development

## If Errors Persist

If you still see errors after following these steps:

1. Check if you're importing React Native internals directly in your code
2. Ensure all third-party libraries are web-compatible
3. Consider using Expo's managed workflow instead of bare workflow
4. Check the Expo documentation for SDK 54 compatibility: https://docs.expo.dev/
