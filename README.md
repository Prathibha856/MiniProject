# BusFlow - Smart Transit Solution

A modern React web application for real-time bus tracking, journey planning, and crowd management for BMTC Bangalore.

## Features

### 🚀 Splash & Onboarding
- Beautiful splash screen with loading animation
- 3-screen onboarding flow with smooth transitions
- Location permission request
- AsyncStorage integration for first-launch detection

### 🏠 Home Dashboard
- Real-time bus tracking with interactive map
- Search functionality for destinations and bus numbers
- Current location detection and nearest stop display
- Live bus list with occupancy levels
- Clickable bus markers with detailed popups

### 🗺️ Routes Screen
- Complete route listings with search
- Route details including stops, duration, and frequency
- Fare information and action buttons
- Modern card-based UI

### 📅 Schedule Screen
- Time-based schedule filtering
- Real-time departure information
- Status indicators (On Time, Delayed)
- Alert and sharing functionality

### 👤 Profile Screen
- User profile management
- Quick stats dashboard
- Account settings and preferences
- Help & support section

## Tech Stack

- **React Native** with Expo
- **React Navigation** for screen transitions
- **NativeWind** for TailwindCSS styling
- **Expo Location** for GPS functionality
- **React Native Maps** for map integration
- **AsyncStorage** for data persistence
- **React Native Reanimated** for smooth animations

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your preferred platform:
```bash
npm run android
npm run ios
npm run web
```

## Project Structure

```
BusFlow/
├── screens/
│   ├── SplashScreen.js
│   ├── OnboardingScreen.js
│   ├── HomeScreen.js
│   ├── RoutesScreen.js
│   ├── ScheduleScreen.js
│   └── ProfileScreen.js
├── App.js
├── package.json
├── tailwind.config.js
└── README.md
```

## Features Implemented

✅ Splash screen with logo and loading animation  
✅ 3-screen onboarding with swiper navigation  
✅ Location permission handling  
✅ Home screen with search and map integration  
✅ Interactive bus markers with popups  
✅ Real-time bus list with occupancy levels  
✅ Routes screen with search and filtering  
✅ Schedule screen with time slots  
✅ Profile screen with user stats  
✅ Bottom tab navigation  
✅ Responsive design with TailwindCSS  
✅ Mock data for demonstration  

## Mock Data

The app includes realistic mock data for:
- Bus routes and schedules
- Real-time bus locations
- User location and nearest stops
- Occupancy levels and ETAs

## Next Steps

- Integrate with real bus tracking APIs
- Add push notifications for bus alerts
- Implement user authentication
- Add payment integration
- Include offline mode support

## License

© 2025 BusFlow. All rights reserved.


