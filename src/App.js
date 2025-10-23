import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './components/Home';
import TrackBus from './components/TrackBus';
import JourneyPlanner from './components/JourneyPlanner';
import CrowdPrediction from './components/CrowdPrediction';
import SearchRoute from './components/SearchRoute';
import TimeTable from './components/TimeTable';
import AroundStation from './components/AroundStation';
import FareCalculator from './components/FareCalculator';
import Feedback from './components/Feedback';
import UserGuide from './components/UserGuide';
import Helpline from './components/Helpline';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/track-bus" element={<TrackBus />} />
          <Route path="/journey-planner" element={<JourneyPlanner />} />
          <Route path="/crowd-prediction" element={<CrowdPrediction />} />
          <Route path="/search-route" element={<SearchRoute />} />
          <Route path="/timetable" element={<TimeTable />} />
          <Route path="/around-station" element={<AroundStation />} />
          <Route path="/fare-calculator" element={<FareCalculator />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/helpline" element={<Helpline />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
