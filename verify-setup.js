#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying BusFlow setup...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'App.js',
  'app.json',
  'babel.config.js',
  'tailwind.config.js',
  'metro.config.js',
  'global.css',
  'screens/SplashScreen.js',
  'screens/OnboardingScreen.js',
  'screens/HomeScreen.js',
  'screens/RoutesScreen.js',
  'screens/ScheduleScreen.js',
  'screens/ProfileScreen.js',
  'components/MapComponent.js'
];

let allFilesExist = true;

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'expo',
    'react',
    'react-native',
    '@react-navigation/native',
    '@react-navigation/stack',
    '@react-navigation/bottom-tabs',
    'react-native-screens',
    'react-native-safe-area-context',
    'expo-location',
    '@react-native-async-storage/async-storage',
    'react-native-pager-view',
    'nativewind',
    'tailwindcss'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json');
  allFilesExist = false;
}

// Check if node_modules exists
console.log('\n📦 Checking installation...');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules directory exists');
} else {
  console.log('❌ node_modules directory missing - run npm install');
  allFilesExist = false;
}

// Summary
console.log('\n📊 Summary:');
if (allFilesExist) {
  console.log('🎉 All checks passed! BusFlow is ready to run.');
  console.log('\nTo start the app:');
  console.log('  npm start');
  console.log('\nTo run on specific platforms:');
  console.log('  npm run android');
  console.log('  npm run ios');
  console.log('  npm run web');
} else {
  console.log('⚠️  Some issues found. Please fix them before running the app.');
  console.log('\nFor help, check TROUBLESHOOTING.md');
}

console.log('\n🚀 Happy coding with BusFlow!');
