import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { mlApiService } from '../services/mlApi';
import '../styles/common-page.css';

const CrowdPrediction = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [busNumber, setBusNumber] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Sample bus data (will be replaced with API)
  const sampleBuses = [
    {
      busNumber: '335E',
      route: 'Kempegowda Bus Station - Kadugodi',
      currentStop: 'MG Road',
      nextStop: 'Indiranagar',
      crowdLevel: 'High',
      occupancyPercent: 85,
      currentPassengers: 51,
      maxCapacity: 60,
      seatsAvailable: 9,
      standingRoom: false,
      confidence: 0.87,
      eta: '8 mins',
      lastUpdated: '2 mins ago',
      nextStopPrediction: {
        stop: 'Indiranagar',
        crowdLevel: 'Medium',
        occupancyPercent: 70,
        expectedBoarding: 5,
        expectedAlighting: 20
      },
      upcomingStops: [
        { name: 'Indiranagar', crowdLevel: 'Medium', eta: '8 mins' },
        { name: 'Domlur', crowdLevel: 'Low', eta: '15 mins' },
        { name: 'Marathahalli', crowdLevel: 'High', eta: '25 mins' }
      ]
    },
    {
      busNumber: '500D',
      route: 'Kempegowda Bus Station - Banashankari',
      currentStop: 'Jayanagar 4th Block',
      nextStop: 'JP Nagar',
      crowdLevel: 'Low',
      occupancyPercent: 35,
      currentPassengers: 21,
      maxCapacity: 60,
      seatsAvailable: 39,
      standingRoom: true,
      confidence: 0.92,
      eta: '5 mins',
      lastUpdated: '1 min ago',
      nextStopPrediction: {
        stop: 'JP Nagar',
        crowdLevel: 'Medium',
        occupancyPercent: 55,
        expectedBoarding: 15,
        expectedAlighting: 5
      },
      upcomingStops: [
        { name: 'JP Nagar', crowdLevel: 'Medium', eta: '5 mins' },
        { name: 'BTM Layout', crowdLevel: 'Low', eta: '12 mins' },
        { name: 'Banashankari', crowdLevel: 'Medium', eta: '20 mins' }
      ]
    }
  ];

  const handleSearch = async () => {
    if (!busNumber.trim()) {
      alert('Please enter a bus number');
      return;
    }

    setLoading(true);
    try {
      // Get current time and day
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const dayOfWeek = now.getDay();

      // Try ML API call for real prediction
      console.log('Calling ML API for crowd prediction...');
      
      // Sample BMTC stop coordinates (Bangalore city center area)
      const sampleStops = [
        { lat: 12.9716, lon: 77.5946, name: 'Majestic/Kempegowda Bus Station' },
        { lat: 13.0827, lon: 77.5877, name: 'Yelahanka' },
        { lat: 12.9698, lon: 77.7499, name: 'Whitefield' },
        { lat: 12.9352, lon: 77.6245, name: 'Jayanagar' },
        { lat: 12.8866, lon: 77.6033, name: 'Banashankari' }
      ];

      // Get predictions for sample stops
      const predictions = [];
      for (const stop of sampleStops) {
        try {
          const prediction = await mlApiService.predictCrowd({
            stop_lat: stop.lat,
            stop_lon: stop.lon,
            time: time,
            day_of_week: dayOfWeek
          });

          // Transform ML API response to frontend format
          const crowdLevelMap = {
            'Low': { level: 'Low', percent: 30, passengers: 18 },
            'Medium': { level: 'Medium', percent: 55, passengers: 33 },
            'High': { level: 'High', percent: 75, passengers: 45 },
            'Very High': { level: 'Very High', percent: 90, passengers: 54 }
          };

          const crowdData = crowdLevelMap[prediction.prediction.crowd_level] || crowdLevelMap['Medium'];

          predictions.push({
            busNumber: busNumber,
            route: `${stop.name} - BMTC Route`,
            currentStop: stop.name,
            nextStop: sampleStops[(sampleStops.indexOf(stop) + 1) % sampleStops.length].name,
            crowdLevel: prediction.prediction.crowd_level,
            occupancyPercent: crowdData.percent,
            currentPassengers: crowdData.passengers,
            maxCapacity: 60,
            seatsAvailable: 60 - crowdData.passengers,
            standingRoom: crowdData.passengers < 55,
            confidence: prediction.prediction.confidence || 0.85,
            eta: `${5 + Math.floor(Math.random() * 10)} mins`,
            lastUpdated: 'Just now',
            nextStopPrediction: {
              stop: sampleStops[(sampleStops.indexOf(stop) + 1) % sampleStops.length].name,
              crowdLevel: prediction.prediction.crowd_level,
              occupancyPercent: crowdData.percent - 10,
              expectedBoarding: Math.floor(Math.random() * 15) + 5,
              expectedAlighting: Math.floor(Math.random() * 20) + 5
            },
            upcomingStops: sampleStops.slice(0, 3).map((s, idx) => ({
              name: s.name,
              crowdLevel: ['Low', 'Medium', 'High'][idx % 3],
              eta: `${(idx + 1) * 7} mins`
            })),
            mlPrediction: true // Flag to show this is ML-powered
          });
        } catch (err) {
          console.error('Error getting prediction for stop:', stop.name, err);
        }
      }

      if (predictions.length > 0) {
        console.log('✓ Got ML predictions:', predictions.length, 'stops');
        setSearchResults(predictions.slice(0, 2)); // Show top 2 predictions
      } else {
        throw new Error('No ML predictions available');
      }

    } catch (error) {
      // Fallback to sample data
      console.log('Using sample crowd prediction data (ML API unavailable)');
      const filtered = sampleBuses.filter(bus => 
        bus.busNumber.toLowerCase().includes(busNumber.toLowerCase())
      );
      setSearchResults(filtered);
    } finally {
      setLoading(false);
    }
  };

  const getCrowdColor = (level) => {
    switch (level) {
      case 'Empty': return '#4caf50';
      case 'Low': return '#8bc34a';
      case 'Medium': return '#ff9800';
      case 'High': return '#ff5722';
      case 'Full': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getCrowdIcon = (level) => {
    switch (level) {
      case 'Empty': return 'fa-chair';
      case 'Low': return 'fa-users';
      case 'Medium': return 'fa-users';
      case 'High': return 'fa-users';
      case 'Full': return 'fa-user-friends';
      default: return 'fa-question';
    }
  };

  const viewDetails = (bus) => {
    setSelectedBus(bus);
    setShowDetails(true);
  };

  const t = {
    en: {
      title: 'Crowd Prediction',
      subtitle: 'Check bus crowd levels in real-time',
      searchPlaceholder: 'Enter bus number (e.g., 335E, 500D)',
      search: 'Predict Crowd',
      currentCrowd: 'Current Crowd Level',
      occupancy: 'Occupancy',
      passengers: 'Passengers',
      seatsAvailable: 'Seats Available',
      standingRoom: 'Standing Room',
      confidence: 'Prediction Confidence',
      nextStop: 'Next Stop Prediction',
      upcomingStops: 'Upcoming Stops',
      viewDetails: 'View Details',
      lastUpdated: 'Last Updated',
      empty: 'Empty',
      low: 'Low Crowd',
      medium: 'Medium Crowd',
      high: 'High Crowd',
      full: 'Bus Full',
      tips: 'Travel Tips',
      noBuses: 'No buses found',
      tryAgain: 'Try searching with a different bus number'
    },
    kn: {
      title: 'ಜನಸಂದಣಿ ಮುನ್ಸೂಚನೆ',
      subtitle: 'ನೈಜ ಸಮಯದಲ್ಲಿ ಬಸ್ ಜನಸಂದಣಿ ಮಟ್ಟವನ್ನು ಪರಿಶೀಲಿಸಿ',
      search: 'ಜನಸಂದಣಿ ಮುನ್ಸೂಚನೆ',
      currentCrowd: 'ಪ್ರಸ್ತುತ ಜನಸಂದಣಿ'
    },
    hi: {
      title: 'भीड़ पूर्वानुमान',
      subtitle: 'रीयल-टाइम में बस की भीड़ स्तर जांचें',
      search: 'भीड़ का अनुमान लगाएं',
      currentCrowd: 'वर्तमान भीड़ स्तर'
    }
  };

  const text = t[language];

  return (
    <div>
      {/* Header */}
      <header className="page-header">
        <div className="page-header-container">
          <div className="page-header-left">
            <img src="/assets/bmtc-logo.png" alt="BusFlow" className="header-logo" onClick={() => navigate('/')} onError={e => e.target.style.display='none'} />
            <h2>{text.title}</h2>
          </div>
          <div className="page-header-right">
            <button className="header-btn" onClick={() => navigate('/helpline')}>
              <i className="fas fa-phone"></i> Helpline
            </button>
            <button className="icon-btn" onClick={() => window.location.reload()}>
              <i className="fas fa-sync-alt"></i>
            </button>
            <button className="icon-btn" onClick={() => navigate('/')}>
              <i className="fas fa-home"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{padding:'30px 20px',background:'#f5f5f5',minHeight:'calc(100vh - 80px)'}}>
        <div className="container" style={{maxWidth:'1200px'}}>
          {/* Hero Section */}
          <div style={{textAlign:'center',marginBottom:'40px'}}>
            <div style={{fontSize:'4rem',marginBottom:'15px'}}>
              <i className="fas fa-chart-line" style={{color:'#2196f3'}}></i>
            </div>
            <h2 style={{color:'#333',marginBottom:'10px'}}>{text.subtitle}</h2>
            <p style={{color:'#666'}}>AI-powered predictions to help you plan your journey better</p>
          </div>

          {/* Search Box */}
          <div style={{background:'white',padding:'30px',borderRadius:'15px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',marginBottom:'30px'}}>
            <div style={{display:'flex',gap:'15px',maxWidth:'600px',margin:'0 auto'}}>
              <input
                type="text"
                className="form-control"
                placeholder={text.searchPlaceholder}
                value={busNumber}
                onChange={e => setBusNumber(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                style={{flex:1,fontSize:'1.1rem'}}
              />
              <button 
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={loading}
                style={{padding:'12px 30px',fontSize:'1.1rem'}}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Loading...</>
                ) : (
                  <><i className="fas fa-search"></i> {text.search}</>
                )}
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:'20px',marginBottom:'30px'}}>
            {[
              { icon: 'fa-chair', label: 'Empty', desc: '0-20% Full', color: '#4caf50' },
              { icon: 'fa-users', label: 'Low', desc: '20-40% Full', color: '#8bc34a' },
              { icon: 'fa-users', label: 'Medium', desc: '40-60% Full', color: '#ff9800' },
              { icon: 'fa-users', label: 'High', desc: '60-80% Full', color: '#ff5722' },
              { icon: 'fa-user-friends', label: 'Full', desc: '80-100% Full', color: '#f44336' }
            ].map((item, idx) => (
              <div key={idx} style={{background:'white',padding:'20px',borderRadius:'12px',textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderLeft:`4px solid ${item.color}`}}>
                <i className={`fas ${item.icon}`} style={{fontSize:'2.5rem',color:item.color,marginBottom:'10px'}}></i>
                <h4 style={{color:'#333',marginBottom:'5px'}}>{item.label}</h4>
                <p style={{color:'#999',fontSize:'0.9rem',margin:0}}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Results */}
          {searchResults.length > 0 ? (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(500px, 1fr))',gap:'20px'}}>
              {searchResults.map((bus, idx) => (
                <div key={idx} style={{background:'white',borderRadius:'15px',padding:'25px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',border:`3px solid ${getCrowdColor(bus.crowdLevel)}`}}>
                  {/* Bus Header */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                    <div>
                      <h2 style={{color:'#333',marginBottom:'5px'}}>
                        Bus {bus.busNumber}
                        {bus.mlPrediction && (
                          <span style={{
                            background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color:'white',
                            fontSize:'0.65rem',
                            padding:'4px 8px',
                            borderRadius:'12px',
                            marginLeft:'10px',
                            fontWeight:'600',
                            letterSpacing:'0.5px'
                          }}>
                            <i className="fas fa-brain" style={{marginRight:'4px'}}></i>
                            ML-POWERED
                          </span>
                        )}
                      </h2>
                      <p style={{color:'#666',fontSize:'0.9rem',margin:0}}>{bus.route}</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{background:getCrowdColor(bus.crowdLevel),color:'white',padding:'8px 15px',borderRadius:'20px',fontWeight:'600',fontSize:'0.9rem',marginBottom:'5px'}}>
                        <i className={`fas ${getCrowdIcon(bus.crowdLevel)}`} style={{marginRight:'5px'}}></i>
                        {bus.crowdLevel}
                      </div>
                      <p style={{color:'#999',fontSize:'0.8rem',margin:0}}>{bus.lastUpdated}</p>
                    </div>
                  </div>

                  {/* Crowd Meter */}
                  <div style={{marginBottom:'20px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                      <span style={{color:'#666',fontWeight:'500'}}>{text.occupancy}</span>
                      <span style={{color:'#333',fontWeight:'700',fontSize:'1.2rem'}}>{bus.occupancyPercent}%</span>
                    </div>
                    <div style={{background:'#e0e0e0',height:'20px',borderRadius:'10px',overflow:'hidden'}}>
                      <div style={{width:`${bus.occupancyPercent}%`,height:'100%',background:`linear-gradient(90deg, ${getCrowdColor(bus.crowdLevel)}, ${getCrowdColor(bus.crowdLevel)}dd)`,transition:'width 0.5s'}}></div>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px',fontSize:'0.85rem',color:'#999'}}>
                      <span>Empty</span>
                      <span>Full</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'15px',marginBottom:'20px'}}>
                    <div style={{background:'#f5f5f5',padding:'15px',borderRadius:'10px',textAlign:'center'}}>
                      <i className="fas fa-users" style={{fontSize:'1.5rem',color:'#2196f3',marginBottom:'8px'}}></i>
                      <p style={{color:'#999',fontSize:'0.85rem',margin:'0 0 5px 0'}}>{text.passengers}</p>
                      <p style={{color:'#333',fontWeight:'700',fontSize:'1.2rem',margin:0}}>{bus.currentPassengers}/{bus.maxCapacity}</p>
                    </div>
                    <div style={{background:'#f5f5f5',padding:'15px',borderRadius:'10px',textAlign:'center'}}>
                      <i className="fas fa-chair" style={{fontSize:'1.5rem',color:'#4caf50',marginBottom:'8px'}}></i>
                      <p style={{color:'#999',fontSize:'0.85rem',margin:'0 0 5px 0'}}>{text.seatsAvailable}</p>
                      <p style={{color:'#333',fontWeight:'700',fontSize:'1.2rem',margin:0}}>{bus.seatsAvailable}</p>
                    </div>
                  </div>

                  {/* Current Location */}
                  <div style={{background:'#e3f2fd',padding:'15px',borderRadius:'10px',marginBottom:'15px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <i className="fas fa-map-marker-alt" style={{fontSize:'1.5rem',color:'#2196f3'}}></i>
                      <div style={{flex:1}}>
                        <p style={{color:'#999',fontSize:'0.8rem',margin:0}}>Current Stop</p>
                        <p style={{color:'#333',fontWeight:'600',fontSize:'1.1rem',margin:0}}>{bus.currentStop}</p>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'10px',marginTop:'10px'}}>
                      <i className="fas fa-arrow-right" style={{fontSize:'1.2rem',color:'#ff9800'}}></i>
                      <div style={{flex:1}}>
                        <p style={{color:'#999',fontSize:'0.8rem',margin:0}}>Next Stop • ETA {bus.eta}</p>
                        <p style={{color:'#333',fontWeight:'600',margin:0}}>{bus.nextStop}</p>
                      </div>
                    </div>
                  </div>

                  {/* Next Stop Prediction */}
                  <div style={{background:'#fff3e0',padding:'15px',borderRadius:'10px',marginBottom:'15px'}}>
                    <h4 style={{color:'#333',marginBottom:'10px',display:'flex',alignItems:'center',gap:'8px'}}>
                      <i className="fas fa-chart-line" style={{color:'#ff9800'}}></i>
                      {text.nextStop}
                    </h4>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <p style={{margin:'0 0 5px 0',fontSize:'0.9rem',color:'#666'}}>Expected at {bus.nextStopPrediction.stop}</p>
                        <p style={{margin:0,fontSize:'1.1rem',fontWeight:'600',color:getCrowdColor(bus.nextStopPrediction.crowdLevel)}}>
                          {bus.nextStopPrediction.crowdLevel} ({bus.nextStopPrediction.occupancyPercent}%)
                        </p>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <p style={{margin:0,fontSize:'0.85rem',color:'#4caf50'}}>
                          <i className="fas fa-arrow-up"></i> {bus.nextStopPrediction.expectedBoarding} boarding
                        </p>
                        <p style={{margin:0,fontSize:'0.85rem',color:'#f44336'}}>
                          <i className="fas fa-arrow-down"></i> {bus.nextStopPrediction.expectedAlighting} alighting
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Badge */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'15px'}}>
                    <div>
                      <span style={{color:'#999',fontSize:'0.85rem'}}>{text.confidence}: </span>
                      <span style={{color:'#4caf50',fontWeight:'600'}}>{(bus.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      {bus.standingRoom ? (
                        <span style={{color:'#4caf50',fontSize:'0.85rem'}}>
                          <i className="fas fa-check-circle"></i> {text.standingRoom} Available
                        </span>
                      ) : (
                        <span style={{color:'#f44336',fontSize:'0.85rem'}}>
                          <i className="fas fa-times-circle"></i> No Standing Room
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button 
                    className="btn btn-primary btn-block"
                    onClick={() => viewDetails(bus)}
                  >
                    <i className="fas fa-info-circle"></i> {text.viewDetails}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            searchResults.length === 0 && !loading && busNumber && (
              <div style={{textAlign:'center',padding:'60px 20px',background:'white',borderRadius:'15px'}}>
                <i className="fas fa-search" style={{fontSize:'4rem',color:'#ddd',marginBottom:'20px'}}></i>
                <h3 style={{color:'#666',marginBottom:'10px'}}>{text.noBuses}</h3>
                <p style={{color:'#999'}}>{text.tryAgain}</p>
              </div>
            )
          )}

          {/* Tips Section */}
          {searchResults.length === 0 && !busNumber && (
            <div style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',borderRadius:'15px',padding:'40px',color:'white',textAlign:'center'}}>
              <i className="fas fa-lightbulb" style={{fontSize:'3rem',marginBottom:'15px'}}></i>
              <h3 style={{marginBottom:'20px'}}>Smart Travel Tips</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:'20px',textAlign:'left'}}>
                <div style={{background:'rgba(255,255,255,0.1)',padding:'20px',borderRadius:'10px'}}>
                  <h4 style={{marginBottom:'10px'}}>🕐 Avoid Peak Hours</h4>
                  <p style={{fontSize:'0.9rem',opacity:0.9}}>Travel between 10 AM - 4 PM for less crowded buses</p>
                </div>
                <div style={{background:'rgba(255,255,255,0.1)',padding:'20px',borderRadius:'10px'}}>
                  <h4 style={{marginBottom:'10px'}}>📍 Board Early Stops</h4>
                  <p style={{fontSize:'0.9rem',opacity:0.9}}>Board from origin or early stops to get seats</p>
                </div>
                <div style={{background:'rgba(255,255,255,0.1)',padding:'20px',borderRadius:'10px'}}>
                  <h4 style={{marginBottom:'10px'}}>🚌 Check Alternatives</h4>
                  <p style={{fontSize:'0.9rem',opacity:0.9}}>If one bus is full, check alternate routes</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {showDetails && selectedBus && (
        <div className="modal active" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'700px'}}>
            <button className="close-btn" onClick={() => setShowDetails(false)} style={{position:'absolute',top:'15px',right:'15px',background:'#f5f5f5',color:'#333',border:'none',width:'35px',height:'35px',borderRadius:'50%',cursor:'pointer'}}>
              <i className="fas fa-times"></i>
            </button>
            
            <h2 style={{marginBottom:'20px',color:'#333'}}>
              <i className="fas fa-bus" style={{color:'#2196f3',marginRight:'10px'}}></i>
              Bus {selectedBus.busNumber} - Detailed Prediction
            </h2>

            <div style={{marginBottom:'25px'}}>
              <h4 style={{color:'#666',marginBottom:'15px'}}>{text.upcomingStops}</h4>
              {selectedBus.upcomingStops.map((stop, idx) => (
                <div key={idx} style={{display:'flex',alignItems:'center',padding:'15px',background:'#f9f9f9',borderRadius:'10px',marginBottom:'10px',borderLeft:`4px solid ${getCrowdColor(stop.crowdLevel)}`}}>
                  <div style={{flex:1}}>
                    <h4 style={{color:'#333',marginBottom:'5px'}}>{stop.name}</h4>
                    <p style={{color:'#999',fontSize:'0.85rem',margin:0}}>ETA: {stop.eta}</p>
                  </div>
                  <div style={{background:getCrowdColor(stop.crowdLevel),color:'white',padding:'8px 15px',borderRadius:'20px',fontSize:'0.85rem',fontWeight:'600'}}>
                    {stop.crowdLevel}
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:'#e8f5e9',padding:'20px',borderRadius:'10px',textAlign:'center'}}>
              <i className="fas fa-info-circle" style={{fontSize:'2rem',color:'#4caf50',marginBottom:'10px'}}></i>
              <p style={{color:'#333',margin:0}}>
                Predictions are based on historical data and current conditions. 
                Actual crowd levels may vary.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrowdPrediction;
