import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useVoice } from '../context/VoiceContext';
import '../styles/main.css';

const Home = () => {
  const navigate = useNavigate();
  const { language, changeLanguage } = useApp();
  const { voiceEnabled, toggleVoice, voiceSupport } = useVoice();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const firstVisit = !localStorage.getItem('bmtc_language');
    if (firstVisit) setShowModal(true);
  }, []);

  const t = {
    en: {
      title: 'BusFlow', tagline: 'Your Complete Bus Journey Solution',
      welcome: 'Welcome to BusFlow', subtitle: 'Smart Transit for Everyone',
      services: 'Our Services', language: 'Language', helpline: 'Helpline',
      voice: 'Voice', voiceOn: 'Voice On', voiceOff: 'Voice Off',
      journeyPlanner: 'Journey Planner', journeyPlannerDesc: 'Plan your trip with multiple route options',
      trackBus: 'Track a Bus', trackBusDesc: 'Real-time bus location tracking',
      crowdPrediction: 'Crowd Prediction', crowdPredictionDesc: 'AI-powered crowd level predictions',
      searchRoute: 'Search by Route', searchRouteDesc: 'Find routes and running buses',
      timeTable: 'Time Table', timeTableDesc: 'View bus schedules and timings',
      aroundStation: 'Around Bus Station', aroundStationDesc: 'Find nearby amenities',
      fareCalculator: 'Fare Calculator', fareCalculatorDesc: 'Calculate your journey fare',
      aboutBus: 'About Bus', aboutBusDesc: 'Browse all available buses and routes',
      feedback: 'Feedback', feedbackDesc: 'Share your experience with us',
      userGuide: 'User Guide', userGuideDesc: 'Learn how to use the app',
    },
    kn: {
      title: 'BusFlow', tagline: 'ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಬಸ್ ಪ್ರಯಾಣ ಪರಿಹಾರ',
      welcome: 'BusFlow ಗೆ ಸ್ವಾಗತ', subtitle: 'ಎಲ್ಲರಿಗೂ ಸ್ಮಾರ್ಟ್ ಸಾರಿಗೆ',
      services: 'ನಮ್ಮ ಸೇವೆಗಳು', language: 'ಭಾಷೆ', helpline: 'ಹೆಲ್ಪ್‌ಲೈನ್',
      voice: 'ಧ್ವನಿ', voiceOn: 'ಧ್ವನಿ ಆನ್', voiceOff: 'ಧ್ವನಿ ಆಫ್',
      journeyPlanner: 'ಪ್ರಯಾಣ ಯೋಜಕ', trackBus: 'ಬಸ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
      crowdPrediction: 'ಜನಸಂದಣಿ ಮುನ್ಸೂಚನೆ',
      searchRoute: 'ಮಾರ್ಗದಿಂದ ಹುಡುಕಿ', timeTable: 'ಸಮಯ ಕೋಷ್ಟಕ',
      aroundStation: 'ಬಸ್ ನಿಲ್ದಾಣದ ಸುತ್ತಲೂ', fareCalculator: 'ದರ ಕ್ಯಾಲ್ಕುಲೇಟರ್',
      aboutBus: 'ಬಸ್ ಬಗ್ಗೆ',
      feedback: 'ಪ್ರತಿಕ್ರಿಯೆ', userGuide: 'ಬಳಕೆದಾರ ಮಾರ್ಗದರ್ಶಿ',
    },
    hi: {
      title: 'BusFlow', tagline: 'आपका संपूर्ण बस यात्रा समाधान',
      welcome: 'BusFlow में आपका स्वागत है', subtitle: 'सभी के लिए स्मार्ट ट्रांजिट',
      services: 'हमारी सेवाएं', language: 'भाषा', helpline: 'हेल्पलाइन',
      voice: 'आवाज़', voiceOn: 'आवाज़ चालू', voiceOff: 'आवाज़ बंद',
      journeyPlanner: 'यात्रा योजनाकार', trackBus: 'बस ट्रैक करें',
      crowdPrediction: 'भीड़ पूर्वानुमान',
      searchRoute: 'मार्ग द्वारा खोजें', timeTable: 'समय सारणी',
      aroundStation: 'बस स्टेशन के आसपास', fareCalculator: 'किराया कैलकुलेटर',
      aboutBus: 'बस के बारे में',
      feedback: 'फीडबैक', userGuide: 'उपयोगकर्ता गाइड',
    }
  };

  const text = t[language];

  const features = [
    { route: '/journey-planner', icon: 'fa-route', key: 'journeyPlanner', color: '#2196f3' },
    { route: '/track-bus', icon: 'fa-bus', key: 'trackBus', color: '#4caf50' },
    { route: '/crowd-prediction', icon: 'fa-chart-line', key: 'crowdPrediction', color: '#e91e63' },
    { route: '/search-route', icon: 'fa-search-location', key: 'searchRoute', color: '#ff9800' },
    { route: '/timetable', icon: 'fa-clock', key: 'timeTable', color: '#9c27b0' },
    { route: '/around-station', icon: 'fa-map-marked-alt', key: 'aroundStation', color: '#f44336' },
    { route: '/fare-calculator', icon: 'fa-calculator', key: 'fareCalculator', color: '#00bcd4' },
    { route: '/about-bus', icon: 'fa-info-circle', key: 'aboutBus', color: '#3f51b5' },
    { route: '/feedback', icon: 'fa-comment-dots', key: 'feedback', color: '#ff5722' },
    { route: '/user-guide', icon: 'fa-book-open', key: 'userGuide', color: '#607d8b' },
  ];

  return (
    <div>
      {/* Language Modal */}
      {showModal && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Select Language / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ</h2>
            <div className="language-options">
              <button className="lang-btn" onClick={() => { changeLanguage('en'); setShowModal(false); }}>
                <i className="fas fa-globe"></i> English
              </button>
              <button className="lang-btn" onClick={() => { changeLanguage('kn'); setShowModal(false); }}>
                <i className="fas fa-globe"></i> ಕನ್ನಡ (Kannada)
              </button>
              <button className="lang-btn" onClick={() => { changeLanguage('hi'); setShowModal(false); }}>
                <i className="fas fa-globe"></i> हिंदी (Hindi)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo-section">
            <img src="/assets/bmtc-logo.png" alt="BusFlow Logo" className="bmtc-logo" onError={e => e.target.style.display='none'} />
            <div className="logo-text">
              <h1>{text.title}</h1>
              <p>{text.tagline}</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="header-btn" onClick={() => setShowModal(true)}>
              <i className="fas fa-language"></i>
              <span>{text.language}</span>
            </button>
            {voiceSupport.tts && voiceSupport.stt && (
              <button 
                className={`header-btn ${voiceEnabled ? 'voice-active' : ''}`}
                onClick={toggleVoice}
                title={voiceEnabled ? text.voiceOn : text.voiceOff}
              >
                <i className={`fas ${voiceEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
                <span>{voiceEnabled ? text.voiceOn : text.voiceOff}</span>
              </button>
            )}
            <button className="header-btn" onClick={() => navigate('/helpline')}>
              <i className="fas fa-phone"></i>
              <span>{text.helpline}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>{text.welcome}</h2>
          <p>{text.subtitle}</p>
        </div>
      </section>

      {/* Main Features Grid */}
      <main className="main-content">
        <div className="container">
          <h2 className="section-title">{text.services}</h2>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card" onClick={() => navigate(feature.route)} style={{'--feature-color': feature.color}}>
                <div className="feature-icon" style={{background: feature.color}}>
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3>{text[feature.key]}</h3>
                <p>{text[`${feature.key}Desc`] || ''}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Quick Info Section */}
      <section className="quick-info">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <i className="fas fa-shield-alt"></i>
              <h4>Safe Travel</h4>
              <p>GPS-enabled buses for your safety</p>
            </div>
            <div className="info-card">
              <i className="fas fa-clock"></i>
              <h4>Real-time Updates</h4>
              <p>Live bus tracking information</p>
            </div>
            <div className="info-card">
              <i className="fas fa-credit-card"></i>
              <h4>Easy Payment</h4>
              <p>Multiple payment options available</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
