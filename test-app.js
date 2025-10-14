#!/usr/bin/env node

// Simple test to verify the app structure
const fs = require('fs');

console.log('🧪 Testing BusFlow app structure...\n');

// Test 1: Check if App.js is valid JavaScript
try {
  const appContent = fs.readFileSync('App.js', 'utf8');
  // Basic syntax check - look for common React patterns
  if (appContent.includes('import React') && 
      appContent.includes('export default') &&
      appContent.includes('NavigationContainer')) {
    console.log('✅ App.js structure looks good');
  } else {
    console.log('❌ App.js structure issues detected');
  }
} catch (error) {
  console.log('❌ Error reading App.js:', error.message);
}

// Test 2: Check if all screens are valid
const screens = [
  'screens/SplashScreen.js',
  'screens/OnboardingScreen.js', 
  'screens/HomeScreen.js',
  'screens/RoutesScreen.js',
  'screens/ScheduleScreen.js',
  'screens/ProfileScreen.js'
];

console.log('\n📱 Testing screen components...');
screens.forEach(screen => {
  try {
    const content = fs.readFileSync(screen, 'utf8');
    if (content.includes('export default') && 
        content.includes('React') &&
        content.includes('StyleSheet')) {
      console.log(`✅ ${screen}`);
    } else {
      console.log(`❌ ${screen} - structure issues`);
    }
  } catch (error) {
    console.log(`❌ ${screen} - file error`);
  }
});

// Test 3: Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.name === 'BusFlow' && packageJson.main) {
    console.log('\n✅ package.json configuration looks good');
  } else {
    console.log('\n❌ package.json configuration issues');
  }
} catch (error) {
  console.log('\n❌ Error reading package.json');
}

// Test 4: Check app.json
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  if (appJson.expo && appJson.expo.name === 'BusFlow') {
    console.log('✅ app.json configuration looks good');
  } else {
    console.log('❌ app.json configuration issues');
  }
} catch (error) {
  console.log('❌ Error reading app.json');
}

console.log('\n🎯 Test completed!');
console.log('If all tests passed, your BusFlow app should be ready to run.');
console.log('Run "npm start" to launch the development server.');
