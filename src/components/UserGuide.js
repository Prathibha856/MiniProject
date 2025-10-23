import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../styles/common-page.css';

const UserGuide = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const guides = [
    {
      id: 'overview',
      title: 'Getting Started',
      icon: 'fa-rocket',
      content: [
        { subtitle: 'Welcome to BMTC Smart Transit', text: 'Your complete bus journey solution for Bangalore city. This app helps you plan journeys, track buses in real-time, and get route information.' },
        { subtitle: 'System Requirements', text: 'Internet connection required. Works on all modern browsers (Chrome, Firefox, Safari, Edge). Mobile-responsive design for smartphones and tablets.' },
        { subtitle: 'Language Support', text: 'Available in English, Kannada (ಕನ್ನಡ), and Hindi (हिंदी). Change language anytime from the home screen.' }
      ]
    },
    {
      id: 'journey',
      title: 'Journey Planner',
      icon: 'fa-route',
      content: [
        { subtitle: 'How to Plan Your Journey', text: '1. Select origin station from suggestions or type to search\n2. Select destination station\n3. Use swap button to reverse direction\n4. Click "Search Routes" to find available buses\n5. View results in List or Map view' },
        { subtitle: 'Understanding Route Results', text: 'Direct Routes: Single bus from origin to destination\nConnecting Routes: Multiple buses with transfers\nDuration: Total journey time including transfers\nFare: Total ticket cost for the journey' },
        { subtitle: 'Using Filters', text: 'Depart Time: Set preferred departure time\nService Type: Choose Ordinary, AC, or Volvo buses\nSort By: Arrange results by duration, fare, or departure time' },
        { subtitle: 'Recent Searches', text: 'App automatically saves your last 5 searches. Click any recent search to quickly reload that route.' }
      ]
    },
    {
      id: 'track',
      title: 'Track a Bus',
      icon: 'fa-bus',
      content: [
        { subtitle: 'Real-Time Bus Tracking', text: 'Enter bus number (e.g., 335E, 500D) to see all running buses with that number. View live location on map with GPS accuracy.' },
        { subtitle: 'Bus Information Display', text: 'Current speed and direction\nNext upcoming stop\nEstimated arrival time (ETA)\nRoute name and destination\nNumber of active trips' },
        { subtitle: 'Map vs List View', text: 'Map View: See bus locations on interactive map. Click bus markers for details.\nList View: See all running trips in a list with complete information.' },
        { subtitle: 'Auto-Refresh', text: 'Bus locations update automatically every 30 seconds. Use refresh button for manual update.' }
      ]
    },
    {
      id: 'route',
      title: 'Search by Route',
      icon: 'fa-search-location',
      content: [
        { subtitle: 'Finding Routes', text: 'Browse all available bus routes. Search by route number or station name. View complete route path with all stops.' },
        { subtitle: 'Adding Favorites', text: 'Click star icon on any route to save as favorite. Access favorites quickly from home screen. Remove from favorites anytime.' },
        { subtitle: 'Set Notifications', text: 'Enable notifications for specific routes. Get alerts about service delays or cancellations. Receive updates about route changes.' }
      ]
    },
    {
      id: 'timetable',
      title: 'Time Table',
      icon: 'fa-clock',
      content: [
        { subtitle: 'Viewing Schedules', text: 'Select origin and destination stations. Choose date for schedule. See all buses with departure and arrival times.' },
        { subtitle: 'Service Types', text: 'Ordinary: Standard buses\nAC: Air-conditioned buses\nVolvo: Premium AC buses\nChakra: Circular route buses' },
        { subtitle: 'Peak vs Off-Peak', text: 'More frequent service during peak hours (7-10 AM, 5-8 PM). Reduced frequency during off-peak and weekends.' }
      ]
    },
    {
      id: 'station',
      title: 'Around Bus Station',
      icon: 'fa-map-marked-alt',
      content: [
        { subtitle: 'Nearby Amenities', text: 'Find ATMs, restaurants, hospitals, and other facilities near bus stations. View walking distance and directions.' },
        { subtitle: 'Station Facilities', text: 'Waiting areas and shelters\nTicket counters\nRest rooms\nFood stalls\nParking facilities' }
      ]
    },
    {
      id: 'fare',
      title: 'Fare Calculator',
      icon: 'fa-calculator',
      content: [
        { subtitle: 'Calculating Fare', text: 'Select origin and destination. System shows fare for different bus types. Concession rates for students, senior citizens displayed separately.' },
        { subtitle: 'Fare Structure', text: 'Distance-based pricing\nOrdinary buses: ₹5 minimum\nAC buses: Higher rates\nPass options: Daily, Weekly, Monthly\nSpecial rates for students (50% off)' }
      ]
    },
    {
      id: 'icons',
      title: 'Icons & Symbols',
      icon: 'fa-icons',
      content: [
        { subtitle: 'Common Icons', text: '🏠 Home - Return to main screen\n🔄 Refresh - Update data\n⭐ Favorite - Save route\n🔔 Notifications - Alerts\n📍 Location - GPS marker\n🚌 Bus - Vehicle indicator\n⏰ Time - Schedule\n💰 Fare - Price info' },
        { subtitle: 'Status Indicators', text: '🟢 Green - On time/Available\n🟡 Yellow - Minor delay\n🔴 Red - Major delay/Issue\n⚫ Gray - Not in service' }
      ]
    },
    {
      id: 'faq',
      title: 'FAQs',
      icon: 'fa-question-circle',
      content: [
        { subtitle: 'Why is bus location not showing?', text: 'Check your internet connection. Some buses may not have GPS enabled. Try refreshing after a few seconds. Contact helpline if issue persists.' },
        { subtitle: 'How accurate is the ETA?', text: 'ETA is calculated based on current traffic and bus speed. Accuracy is typically ±5 minutes. Heavy traffic may affect timing.' },
        { subtitle: 'Can I book tickets through this app?', text: 'Currently, app is for information only. Tickets must be purchased on the bus or through official BMTC booking channels.' },
        { subtitle: 'How do I report incorrect information?', text: 'Use Feedback form to report issues. Include bus number, route, and description. We review all reports within 48 hours.' },
        { subtitle: 'Does the app work offline?', text: 'Internet connection required for real-time data. Recent searches and favorites saved locally. Offline mode planned for future update.' },
        { subtitle: 'How often is data updated?', text: 'Bus locations: Every 30 seconds\nRoutes & schedules: Daily\nFare information: As notified by BMTC' }
      ]
    },
    {
      id: 'tips',
      title: 'Tips & Best Practices',
      icon: 'fa-lightbulb',
      content: [
        { subtitle: 'For Best Experience', text: 'Enable location services for nearby bus stops\nSave frequently used routes as favorites\nCheck schedule before peak hours\nAllow notifications for service alerts\nKeep app updated to latest version' },
        { subtitle: 'Travel Tips', text: 'Arrive 5 minutes before scheduled time\nCarry exact change for tickets\nUse off-peak hours to avoid crowds\nPlan alternate routes during events\nCheck for route diversions on festivals' }
      ]
    },
    {
      id: 'contact',
      title: 'Need More Help?',
      icon: 'fa-headset',
      content: [
        { subtitle: 'Contact Support', text: '📞 Helpline: 1800-425-1663 (24x7)\n📧 Email: support@mybmtc.com\n🌐 Website: mybmtc.karnataka.gov.in\n💬 Feedback: Use in-app feedback form' },
        { subtitle: 'Office Hours', text: 'Customer Service: 8 AM - 8 PM\nLost & Found: 9 AM - 6 PM\nPass Office: 9 AM - 5 PM' }
      ]
    }
  ];

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.content.some(item => 
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const activeGuide = guides.find(g => g.id === activeSection) || guides[0];

  return (
    <div>
      <header className="page-header">
        <div className="page-header-container">
          <div className="page-header-left">
            <img src="/assets/bmtc-logo.png" alt="BMTC" className="header-logo" onClick={() => navigate('/')} onError={e => e.target.style.display='none'} />
            <h2>User Guide & Help</h2>
          </div>
          <div className="page-header-right">
            <button className="icon-btn" onClick={() => navigate('/')}>
              <i className="fas fa-home"></i>
            </button>
          </div>
        </div>
      </header>

      <main style={{padding:'20px',background:'#f5f5f5',minHeight:'calc(100vh - 80px)'}}>
        <div className="container">
          {/* Hero Section */}
          <div style={{textAlign:'center',padding:'40px 20px',background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',borderRadius:'15px',color:'white',marginBottom:'30px'}}>
            <i className="fas fa-book-reader" style={{fontSize:'3rem',marginBottom:'15px'}}></i>
            <h2 style={{marginBottom:'10px'}}>How Can We Help You?</h2>
            <p style={{opacity:0.9}}>Find answers, learn features, and get the most out of BMTC Smart Transit</p>
            
            {/* Search Bar */}
            <div style={{maxWidth:'600px',margin:'20px auto 0'}}>
              <div style={{position:'relative'}}>
                <i className="fas fa-search" style={{position:'absolute',left:'15px',top:'50%',transform:'translateY(-50%)',color:'#666'}}></i>
                <input
                  type="text"
                  placeholder="Search for help topics..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{width:'100%',padding:'12px 45px',borderRadius:'25px',border:'none',fontSize:'1rem'}}
                />
              </div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:'20px'}}>
            {/* Sidebar Navigation */}
            <div style={{position:'sticky',top:'20px',alignSelf:'start'}}>
              <div style={{background:'white',borderRadius:'15px',padding:'20px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
                <h4 style={{marginBottom:'15px',color:'#333'}}>
                  <i className="fas fa-list"></i> Topics
                </h4>
                {filteredGuides.map(guide => (
                  <div
                    key={guide.id}
                    onClick={() => setActiveSection(guide.id)}
                    style={{
                      padding:'12px 15px',
                      borderRadius:'8px',
                      cursor:'pointer',
                      marginBottom:'8px',
                      background: activeSection === guide.id ? '#e3f2fd' : 'transparent',
                      borderLeft: activeSection === guide.id ? '4px solid #2196f3' : '4px solid transparent',
                      transition:'all 0.3s',
                      display:'flex',
                      alignItems:'center',
                      gap:'10px'
                    }}
                  >
                    <i className={`fas ${guide.icon}`} style={{color: activeSection === guide.id ? '#2196f3' : '#666',fontSize:'1.1rem'}}></i>
                    <span style={{fontWeight: activeSection === guide.id ? '600' : 'normal',fontSize:'0.95rem'}}>
                      {guide.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div style={{background:'white',borderRadius:'15px',padding:'20px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',marginTop:'20px'}}>
                <h4 style={{marginBottom:'15px',color:'#333'}}>
                  <i className="fas fa-external-link-alt"></i> Quick Links
                </h4>
                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                  <button className="btn btn-outline" onClick={() => navigate('/helpline')} style={{justifyContent:'flex-start'}}>
                    <i className="fas fa-phone"></i> Contact Helpline
                  </button>
                  <button className="btn btn-outline" onClick={() => navigate('/feedback')} style={{justifyContent:'flex-start'}}>
                    <i className="fas fa-comment-dots"></i> Send Feedback
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div style={{background:'white',borderRadius:'15px',padding:'40px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
              <div style={{borderBottom:'3px solid #2196f3',paddingBottom:'15px',marginBottom:'30px'}}>
                <h2 style={{color:'#333',display:'flex',alignItems:'center',gap:'15px'}}>
                  <i className={`fas ${activeGuide.icon}`} style={{color:'#2196f3',fontSize:'2rem'}}></i>
                  {activeGuide.title}
                </h2>
              </div>

              {activeGuide.content.map((item, idx) => (
                <div key={idx} style={{marginBottom:'35px'}}>
                  <h3 style={{color:'#d32f2f',marginBottom:'12px',fontSize:'1.3rem'}}>
                    {item.subtitle}
                  </h3>
                  <div style={{color:'#555',lineHeight:'1.8',fontSize:'1.05rem',whiteSpace:'pre-line',background:'#f9f9f9',padding:'20px',borderRadius:'10px',borderLeft:'4px solid #2196f3'}}>
                    {item.text}
                  </div>
                </div>
              ))}

              {/* Navigation Buttons */}
              <div style={{display:'flex',justifyContent:'space-between',marginTop:'40px',paddingTop:'30px',borderTop:'2px solid #f0f0f0'}}>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    const currentIndex = guides.findIndex(g => g.id === activeSection);
                    if (currentIndex > 0) setActiveSection(guides[currentIndex - 1].id);
                  }}
                  disabled={guides.findIndex(g => g.id === activeSection) === 0}
                  style={{opacity: guides.findIndex(g => g.id === activeSection) === 0 ? 0.5 : 1}}
                >
                  <i className="fas fa-arrow-left"></i> Previous
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const currentIndex = guides.findIndex(g => g.id === activeSection);
                    if (currentIndex < guides.length - 1) setActiveSection(guides[currentIndex + 1].id);
                  }}
                  disabled={guides.findIndex(g => g.id === activeSection) === guides.length - 1}
                  style={{opacity: guides.findIndex(g => g.id === activeSection) === guides.length - 1 ? 0.5 : 1}}
                >
                  Next <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Still Need Help? */}
          <div style={{background:'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',borderRadius:'15px',padding:'40px',textAlign:'center',color:'white',marginTop:'30px'}}>
            <i className="fas fa-hands-helping" style={{fontSize:'3rem',marginBottom:'15px'}}></i>
            <h3 style={{marginBottom:'10px'}}>Still Need Help?</h3>
            <p style={{marginBottom:'25px',opacity:0.9}}>Our support team is available 24/7 to assist you</p>
            <div style={{display:'flex',gap:'15px',justifyContent:'center',flexWrap:'wrap'}}>
              <button className="btn" onClick={() => navigate('/helpline')} style={{background:'white',color:'#f5576c',border:'none'}}>
                <i className="fas fa-phone"></i> Call Helpline
              </button>
              <button className="btn" onClick={() => navigate('/feedback')} style={{background:'rgba(255,255,255,0.2)',color:'white',border:'2px solid white'}}>
                <i className="fas fa-envelope"></i> Email Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserGuide;
