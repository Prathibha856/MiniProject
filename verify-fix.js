#!/usr/bin/env node

const fs = require('fs');
const http = require('http');

console.log('🔍 Verifying BusFlow App Fix...\n');

// Check if app is running
function checkAppRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8081', (res) => {
      console.log('✅ App is running on port 8081');
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ App is not running on port 8081');
      console.log('   Error:', err.message);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      console.log('⏰ Timeout checking app status');
      resolve(false);
    });
  });
}

// Check assets
console.log('📁 Checking assets...');
const assets = ['assets/icon.png', 'assets/splash.png', 'assets/adaptive-icon.png', 'assets/favicon.png'];
assets.forEach(asset => {
  if (fs.existsSync(asset)) {
    console.log(`✅ ${asset}`);
  } else {
    console.log(`❌ ${asset} - MISSING`);
  }
});

// Check package.json for correct React Native version
console.log('\n📦 Checking React Native version...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const rnVersion = packageJson.dependencies['react-native'];
  if (rnVersion === '0.72.10') {
    console.log('✅ React Native version is correct: 0.72.10');
  } else {
    console.log(`⚠️  React Native version: ${rnVersion} (expected: 0.72.10)`);
  }
} catch (error) {
  console.log('❌ Error reading package.json');
}

// Check metro config
console.log('\n⚙️  Checking metro config...');
try {
  const metroConfig = fs.readFileSync('metro.config.js', 'utf8');
  if (metroConfig.includes('platforms') && metroConfig.includes('assetExts')) {
    console.log('✅ Metro config has resolver configuration');
  } else {
    console.log('⚠️  Metro config may need resolver configuration');
  }
} catch (error) {
  console.log('❌ Error reading metro.config.js');
}

// Check if app is running
console.log('\n🚀 Checking if app is running...');
checkAppRunning().then(isRunning => {
  if (isRunning) {
    console.log('\n🎉 All checks passed! BusFlow app is running successfully!');
    console.log('\n📱 Next steps:');
    console.log('   - Open http://localhost:8081 in your browser');
    console.log('   - Or scan QR code with Expo Go app on your phone');
    console.log('   - Press "w" for web version');
    console.log('   - Press "a" for Android emulator');
    console.log('   - Press "i" for iOS simulator');
  } else {
    console.log('\n⚠️  App may not be running. Try:');
    console.log('   - npx expo start --clear');
    console.log('   - Or run fix-errors.bat');
  }
});
