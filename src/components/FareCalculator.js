import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import '../styles/common-page.css';

const FareCalculator = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [busType, setBusType] = useState('ordinary');
  const [passengerType, setPassengerType] = useState('adult');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fareDetails, setFareDetails] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // BMTC Stations
  const stations = [
    'Kempegowda Bus Station (Majestic)',
    'Shivajinagar',
    'MG Road',
    'Indiranagar',
    'Marathahalli',
    'Whitefield',
    'Electronic City',
    'Banashankari',
    'JP Nagar',
    'Jayanagar',
    'Koramangala',
    'BTM Layout',
    'Silk Board',
    'HSR Layout',
    'Bellandur',
    'Sarjapur Road',
    'KR Puram',
    'Hebbal',
    'Yeshwanthpur',
    'Rajajinagar',
    'Malleshwaram',
    'Peenya',
    'Nagawara',
    'Yelahanka',
    'Devanahalli',
    'Kadugodi',
    'Hoodi',
    'Varthur',
    'Domlur',
    'Kalyan Nagar'
  ];

  const calculateFare = (from, to, type, passenger) => {
    const distances = {
      'Kempegowda Bus Station (Majestic)-Electronic City': 22,
      'Kempegowda Bus Station (Majestic)-Whitefield': 20,
      'Kempegowda Bus Station (Majestic)-Banashankari': 12,
      'MG Road-Whitefield': 18,
      'MG Road-Electronic City': 20,
      'Indiranagar-Whitefield': 12,
      'Koramangala-Electronic City': 15
    };

    const key1 = `${from}-${to}`;
    const key2 = `${to}-${from}`;
    const distance = distances[key1] || distances[key2] || Math.floor(Math.random() * 15) + 5;

    const rates = { ordinary: 1.5, ac: 2.5, volvo: 3.0 };
    const baseFare = Math.ceil(distance * rates[type]);
    
    const discounts = { adult: 0, student: 50, seniorCitizen: 100 };
    const discount = discounts[passenger];
    const finalFare = Math.max(5, baseFare - (baseFare * discount / 100));

    return {
      distance,
      baseFare,
      discount: (baseFare * discount / 100),
      finalFare,
      gst: Math.ceil(finalFare * 0.05),
      totalFare: Math.ceil(finalFare + (finalFare * 0.05))
    };
  };

  useEffect(() => {
    const saved = localStorage.getItem('bmtc_fare_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const handleFromInput = (value) => {
    setFromStation(value);
    if (value.length > 0) {
      const filtered = stations.filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setFromSuggestions(filtered);
      setShowFromDropdown(true);
    } else {
      setShowFromDropdown(false);
    }
  };

  const handleToInput = (value) => {
    setToStation(value);
    if (value.length > 0) {
      const filtered = stations.filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setToSuggestions(filtered);
      setShowToDropdown(true);
    } else {
      setShowToDropdown(false);
    }
  };

  const swapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleCalculate = async () => {
    if (!fromStation || !toStation) {
      alert('Please select both From and To stations');
      return;
    }
    if (fromStation === toStation) {
      alert('From and To stations cannot be the same');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.calculateFare(fromStation, toStation, busType);
      setFareDetails(data);
    } catch (error) {
      console.log('Using local fare calculation');
      const details = calculateFare(fromStation, toStation, busType, passengerType);
      setFareDetails(details);
    } finally {
      setLoading(false);
      setShowResults(true);

      const search = { from: fromStation, to: toStation, busType, passengerType, timestamp: new Date().toISOString() };
      const updated = [search, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
      localStorage.setItem('bmtc_fare_searches', JSON.stringify(updated));
    }
  };

  const loadRecentSearch = (search) => {
    setFromStation(search.from);
    setToStation(search.to);
    setBusType(search.busType);
    setPassengerType(search.passengerType);
    setShowResults(false);
  };

  const t = {
    en: {
      title: 'Fare Calculator', subtitle: 'Calculate your journey fare',
      from: 'From Station', to: 'To Station', busType: 'Bus Type', passengerType: 'Passenger Type',
      ordinary: 'Ordinary', ac: 'AC', volvo: 'Volvo AC',
      adult: 'Adult', student: 'Student (50% off)', seniorCitizen: 'Senior Citizen (Free)',
      calculate: 'Calculate Fare', calculating: 'Calculating...', fareBreakdown: 'Fare Breakdown',
      distance: 'Distance', baseFare: 'Base Fare', discount: 'Discount', gst: 'GST (5%)', totalFare: 'Total Fare',
      recentSearches: 'Recent Searches', swap: 'Swap stations', helpline: 'Helpline'
    },
    kn: { title: 'ದರ ಕ್ಯಾಲ್ಕುಲೇಟರ್', from: 'ಇಂದ', to: 'ಗೆ', calculate: 'ದರ ಲೆಕ್ಕ ಹಾಕಿ', totalFare: 'ಒಟ್ಟು ದರ' },
    hi: { title: 'किराया कैलकुलेटर', from: 'से', to: 'तक', calculate: 'किराया गणना करें', totalFare: 'कुल किराया' }
  };

  const text = t[language];

  return (
    <div>
      <header className="page-header">
        <div className="page-header-container">
          <div className="page-header-left">
            <img src="/assets/bmtc-logo.png" alt="BMTC" className="header-logo" onClick={() => navigate('/')} onError={e => e.target.style.display='none'} />
            <h2>{text.title}</h2>
          </div>
          <div className="page-header-right">
            <button className="header-btn" onClick={() => navigate('/helpline')}>
              <i className="fas fa-phone"></i> {text.helpline}
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

      <main style={{padding:'30px 20px',background:'#f5f5f5',minHeight:'calc(100vh - 80px)'}}>
        <div className="container" style={{maxWidth:'1200px'}}>
          <div style={{textAlign:'center',marginBottom:'40px'}}>
            <div style={{fontSize:'4rem',marginBottom:'15px'}}>
              <i className="fas fa-calculator" style={{color:'#00bcd4'}}></i>
            </div>
            <h2 style={{color:'#333',marginBottom:'10px'}}>{text.subtitle}</h2>
            <p style={{color:'#666'}}>Quick and easy fare estimation for all bus types</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'30px',maxWidth:'900px',margin:'0 auto'}}>
            <div style={{background:'white',padding:'30px',borderRadius:'15px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
              <h3 style={{color:'#333',marginBottom:'25px',display:'flex',alignItems:'center',gap:'10px'}}>
                <i className="fas fa-calculator" style={{color:'#00bcd4'}}></i>
                Calculate Your Fare
              </h3>

              <div style={{marginBottom:'20px',position:'relative'}}>
                <label style={{display:'block',marginBottom:'8px',color:'#666',fontWeight:'500'}}>
                  <i className="fas fa-map-marker-alt" style={{color:'#4caf50',marginRight:'8px'}}></i>
                  {text.from}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter departure station"
                  value={fromStation}
                  onChange={e => handleFromInput(e.target.value)}
                  onFocus={() => fromStation && setShowFromDropdown(true)}
                  style={{fontSize:'1rem',padding:'12px'}}
                />
                {showFromDropdown && fromSuggestions.length > 0 && (
                  <div style={{position:'absolute',top:'100%',left:0,right:0,background:'white',border:'1px solid #ddd',borderRadius:'8px',marginTop:'5px',maxHeight:'200px',overflowY:'auto',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
                    {fromSuggestions.map((station, idx) => (
                      <div
                        key={idx}
                        onClick={() => { setFromStation(station); setShowFromDropdown(false); }}
                        style={{padding:'12px',cursor:'pointer',borderBottom:'1px solid #f0f0f0'}}
                        onMouseEnter={e => e.target.style.background='#f5f5f5'}
                        onMouseLeave={e => e.target.style.background='white'}
                      >
                        <i className="fas fa-map-pin" style={{color:'#999',marginRight:'8px',fontSize:'0.9rem'}}></i>
                        {station}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{textAlign:'center',margin:'10px 0'}}>
                <button
                  onClick={swapStations}
                  style={{background:'none',border:'2px solid #00bcd4',color:'#00bcd4',padding:'8px 20px',borderRadius:'20px',cursor:'pointer',fontWeight:'600'}}
                  onMouseEnter={e => {e.target.style.background='#00bcd4'; e.target.style.color='white';}}
                  onMouseLeave={e => {e.target.style.background='none'; e.target.style.color='#00bcd4';}}
                >
                  <i className="fas fa-exchange-alt"></i> {text.swap}
                </button>
              </div>

              <div style={{marginBottom:'20px',position:'relative'}}>
                <label style={{display:'block',marginBottom:'8px',color:'#666',fontWeight:'500'}}>
                  <i className="fas fa-map-marker-alt" style={{color:'#f44336',marginRight:'8px'}}></i>
                  {text.to}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter destination station"
                  value={toStation}
                  onChange={e => handleToInput(e.target.value)}
                  onFocus={() => toStation && setShowToDropdown(true)}
                  style={{fontSize:'1rem',padding:'12px'}}
                />
                {showToDropdown && toSuggestions.length > 0 && (
                  <div style={{position:'absolute',top:'100%',left:0,right:0,background:'white',border:'1px solid #ddd',borderRadius:'8px',marginTop:'5px',maxHeight:'200px',overflowY:'auto',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
                    {toSuggestions.map((station, idx) => (
                      <div
                        key={idx}
                        onClick={() => { setToStation(station); setShowToDropdown(false); }}
                        style={{padding:'12px',cursor:'pointer',borderBottom:'1px solid #f0f0f0'}}
                        onMouseEnter={e => e.target.style.background='#f5f5f5'}
                        onMouseLeave={e => e.target.style.background='white'}
                      >
                        <i className="fas fa-map-pin" style={{color:'#999',marginRight:'8px',fontSize:'0.9rem'}}></i>
                        {station}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block',marginBottom:'8px',color:'#666',fontWeight:'500'}}>
                  <i className="fas fa-bus" style={{color:'#2196f3',marginRight:'8px'}}></i>
                  {text.busType}
                </label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'10px'}}>
                  {['ordinary', 'ac', 'volvo'].map(type => (
                    <button
                      key={type}
                      onClick={() => setBusType(type)}
                      style={{
                        padding:'15px',
                        border:busType === type ? '2px solid #00bcd4' : '2px solid #e0e0e0',
                        background:busType === type ? '#e0f7fa' : 'white',
                        borderRadius:'10px',
                        cursor:'pointer',
                        fontWeight:busType === type ? '600' : '400',
                        color:busType === type ? '#00bcd4' : '#666',
                        textAlign:'center'
                      }}
                    >
                      <div style={{fontSize:'1.5rem',marginBottom:'5px'}}>
                        {type === 'ordinary' && '🚌'}
                        {type === 'ac' && '❄️'}
                        {type === 'volvo' && '⭐'}
                      </div>
                      {text[type]}
                      <div style={{fontSize:'0.8rem',marginTop:'5px',opacity:0.8}}>
                        {type === 'ordinary' && '₹1.5/km'}
                        {type === 'ac' && '₹2.5/km'}
                        {type === 'volvo' && '₹3.0/km'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:'25px'}}>
                <label style={{display:'block',marginBottom:'8px',color:'#666',fontWeight:'500'}}>
                  <i className="fas fa-user" style={{color:'#ff9800',marginRight:'8px'}}></i>
                  {text.passengerType}
                </label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'10px'}}>
                  {[
                    {type:'adult', icon:'👤', label:text.adult},
                    {type:'student', icon:'🎓', label:text.student},
                    {type:'seniorCitizen', icon:'👴', label:text.seniorCitizen}
                  ].map(item => (
                    <button
                      key={item.type}
                      onClick={() => setPassengerType(item.type)}
                      style={{
                        padding:'15px 10px',
                        border:passengerType === item.type ? '2px solid #ff9800' : '2px solid #e0e0e0',
                        background:passengerType === item.type ? '#fff3e0' : 'white',
                        borderRadius:'10px',
                        cursor:'pointer',
                        fontWeight:passengerType === item.type ? '600' : '400',
                        color:passengerType === item.type ? '#ff9800' : '#666',
                        textAlign:'center',
                        fontSize:'0.9rem'
                      }}
                    >
                      <div style={{fontSize:'1.5rem',marginBottom:'5px'}}>{item.icon}</div>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={loading}
                className="btn btn-primary btn-block"
                style={{fontSize:'1.1rem',padding:'15px',background:'linear-gradient(135deg, #00bcd4 0%, #00acc1 100%)',border:'none'}}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> {text.calculating}</>
                ) : (
                  <><i className="fas fa-calculator"></i> {text.calculate}</>
                )}
              </button>
            </div>

            {showResults && fareDetails && (
              <div style={{background:'white',padding:'30px',borderRadius:'15px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',border:'3px solid #4caf50'}}>
                <h3 style={{color:'#333',marginBottom:'20px',display:'flex',alignItems:'center',gap:'10px'}}>
                  <i className="fas fa-receipt" style={{color:'#4caf50'}}></i>
                  {text.fareBreakdown}
                </h3>

                <div style={{background:'#f5f5f5',padding:'20px',borderRadius:'10px',marginBottom:'20px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'15px',flexWrap:'wrap'}}>
                    <div style={{flex:'1',minWidth:'150px'}}>
                      <p style={{color:'#999',fontSize:'0.85rem',margin:'0 0 5px 0'}}>From</p>
                      <p style={{color:'#333',fontWeight:'600',margin:0,fontSize:'1.1rem'}}>
                        <i className="fas fa-map-marker-alt" style={{color:'#4caf50',marginRight:'8px'}}></i>
                        {fromStation}
                      </p>
                    </div>
                    <div style={{fontSize:'1.5rem',color:'#00bcd4'}}>
                      <i className="fas fa-arrow-right"></i>
                    </div>
                    <div style={{flex:'1',minWidth:'150px'}}>
                      <p style={{color:'#999',fontSize:'0.85rem',margin:'0 0 5px 0'}}>To</p>
                      <p style={{color:'#333',fontWeight:'600',margin:0,fontSize:'1.1rem'}}>
                        <i className="fas fa-map-marker-alt" style={{color:'#f44336',marginRight:'8px'}}></i>
                        {toStation}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'15px',marginBottom:'20px'}}>
                  <div style={{background:'#e3f2fd',padding:'15px',borderRadius:'10px',textAlign:'center'}}>
                    <i className="fas fa-road" style={{fontSize:'2rem',color:'#2196f3',marginBottom:'8px'}}></i>
                    <p style={{color:'#999',fontSize:'0.85rem',margin:'0 0 5px 0'}}>{text.distance}</p>
                    <p style={{color:'#333',fontWeight:'700',fontSize:'1.5rem',margin:0}}>{fareDetails.distance} km</p>
                  </div>
                  <div style={{background:'#f3e5f5',padding:'15px',borderRadius:'10px',textAlign:'center'}}>
                    <i className="fas fa-bus" style={{fontSize:'2rem',color:'#9c27b0',marginBottom:'8px'}}></i>
                    <p style={{color:'#999',fontSize:'0.85rem',margin:'0 0 5px 0'}}>Bus Type</p>
                    <p style={{color:'#333',fontWeight:'700',fontSize:'1.2rem',margin:0,textTransform:'capitalize'}}>{busType}</p>
                  </div>
                </div>

                <div style={{border:'1px solid #e0e0e0',borderRadius:'10px',overflow:'hidden',marginBottom:'20px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',padding:'15px',borderBottom:'1px solid #e0e0e0'}}>
                    <span style={{color:'#666'}}>{text.baseFare}</span>
                    <span style={{color:'#333',fontWeight:'600'}}>₹{fareDetails.baseFare}</span>
                  </div>
                  {fareDetails.discount > 0 && (
                    <div style={{display:'flex',justifyContent:'space-between',padding:'15px',borderBottom:'1px solid #e0e0e0',background:'#e8f5e9'}}>
                      <span style={{color:'#4caf50',fontWeight:'500'}}>{text.discount}</span>
                      <span style={{color:'#4caf50',fontWeight:'600'}}>- ₹{fareDetails.discount}</span>
                    </div>
                  )}
                  <div style={{display:'flex',justifyContent:'space-between',padding:'15px',borderBottom:'1px solid #e0e0e0'}}>
                    <span style={{color:'#666'}}>{text.gst}</span>
                    <span style={{color:'#333',fontWeight:'600'}}>₹{fareDetails.gst}</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',padding:'20px',background:'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',color:'white'}}>
                    <span style={{fontSize:'1.2rem',fontWeight:'700'}}>{text.totalFare}</span>
                    <span style={{fontSize:'1.8rem',fontWeight:'700'}}>₹{fareDetails.totalFare}</span>
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'10px'}}>
                  <div style={{background:'#fff3e0',padding:'12px',borderRadius:'8px',textAlign:'center'}}>
                    <p style={{color:'#ff9800',fontSize:'0.85rem',margin:'0 0 5px 0',fontWeight:'600'}}>Per KM</p>
                    <p style={{color:'#333',fontWeight:'700',margin:0}}>₹{(fareDetails.totalFare / fareDetails.distance).toFixed(2)}</p>
                  </div>
                  <div style={{background:'#e8f5e9',padding:'12px',borderRadius:'8px',textAlign:'center'}}>
                    <p style={{color:'#4caf50',fontSize:'0.85rem',margin:'0 0 5px 0',fontWeight:'600'}}>Passenger</p>
                    <p style={{color:'#333',fontWeight:'700',margin:0,fontSize:'0.9rem'}}>{passengerType === 'seniorCitizen' ? 'Senior' : passengerType}</p>
                  </div>
                  <div style={{background:'#fce4ec',padding:'12px',borderRadius:'8px',textAlign:'center'}}>
                    <p style={{color:'#e91e63',fontSize:'0.85rem',margin:'0 0 5px 0',fontWeight:'600'}}>Saved</p>
                    <p style={{color:'#333',fontWeight:'700',margin:0}}>₹{fareDetails.discount}</p>
                  </div>
                </div>
              </div>
            )}

            {recentSearches.length > 0 && (
              <div style={{background:'white',padding:'25px',borderRadius:'15px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
                <h4 style={{color:'#333',marginBottom:'15px',display:'flex',alignItems:'center',gap:'8px'}}>
                  <i className="fas fa-history" style={{color:'#ff9800'}}></i>
                  {text.recentSearches}
                </h4>
                {recentSearches.map((search, idx) => (
                  <div
                    key={idx}
                    onClick={() => loadRecentSearch(search)}
                    style={{padding:'12px',background:'#f9f9f9',borderRadius:'8px',marginBottom:'10px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',border:'1px solid #e0e0e0'}}
                    onMouseEnter={e => e.target.style.background='#e3f2fd'}
                    onMouseLeave={e => e.target.style.background='#f9f9f9'}
                  >
                    <div style={{flex:1}}>
                      <p style={{margin:0,color:'#333',fontSize:'0.9rem'}}>
                        <span style={{fontWeight:'600'}}>{search.from}</span>
                        <i className="fas fa-arrow-right" style={{margin:'0 8px',color:'#999',fontSize:'0.8rem'}}></i>
                        <span style={{fontWeight:'600'}}>{search.to}</span>
                      </p>
                      <p style={{margin:'5px 0 0 0',color:'#999',fontSize:'0.8rem'}}>
                        {search.busType} • {search.passengerType}
                      </p>
                    </div>
                    <i className="fas fa-chevron-right" style={{color:'#999'}}></i>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FareCalculator;
