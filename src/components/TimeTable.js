import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import '../styles/common-page.css';

const TimeTable = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [busTypeFilter, setBusTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
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
    'Malleshwalam',
    'Peenya',
    'Nagawara',
    'Yelahanka',
    'Devanahalli'
  ];

  // Sample schedule generator
  const generateSchedules = (from, to, date) => {
    const schedules = [];
    const busTypes = ['Ordinary', 'AC', 'Volvo AC', 'Vayu Vajra'];
    const busNumbers = ['335E', '500D', '201A', 'G-4', 'KBS-1', 'V-365', 'AS-3'];
    
    // Generate 15 schedules
    for (let i = 0; i < 15; i++) {
      const hour = 6 + Math.floor(i * 0.8);
      const minute = (i * 15) % 60;
      const departTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      const duration = 30 + Math.floor(Math.random() * 60);
      const arriveHour = hour + Math.floor((minute + duration) / 60);
      const arriveMinute = (minute + duration) % 60;
      const arriveTime = `${arriveHour.toString().padStart(2, '0')}:${arriveMinute.toString().padStart(2, '0')}`;
      
      const busType = busTypes[Math.floor(Math.random() * busTypes.length)];
      const frequency = ['10 mins', '15 mins', '20 mins', '30 mins'][Math.floor(Math.random() * 4)];
      const fare = busType === 'Ordinary' ? 25 : busType === 'AC' ? 40 : busType === 'Volvo AC' ? 50 : 60;
      
      schedules.push({
        busNumber: busNumbers[Math.floor(Math.random() * busNumbers.length)],
        busType,
        departTime: `${departTime} ${hour < 12 ? 'AM' : 'PM'}`,
        arriveTime: `${arriveTime} ${arriveHour < 12 ? 'AM' : 'PM'}`,
        duration: `${duration} mins`,
        frequency,
        fare: `₹${fare}`,
        stops: Math.floor(Math.random() * 15) + 5,
        via: ['MG Road', 'Indiranagar', 'Marathahalli', 'Whitefield'][Math.floor(Math.random() * 4)],
        available: Math.random() > 0.3
      });
    }
    
    return schedules.sort((a, b) => a.departTime.localeCompare(b.departTime));
  };

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

  const handleSearch = async () => {
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
      const data = await apiService.getTimeTableByStations(fromStation, toStation, selectedDate);
      setSchedules(data);
    } catch (error) {
      console.log('Using sample schedule data');
      const data = generateSchedules(fromStation, toStation, selectedDate);
      setSchedules(data);
    } finally {
      setLoading(false);
      setShowResults(true);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (busTypeFilter !== 'all' && schedule.busType.toLowerCase() !== busTypeFilter.toLowerCase()) {
      return false;
    }
    
    if (timeFilter !== 'all') {
      const hour = parseInt(schedule.departTime.split(':')[0]);
      if (timeFilter === 'morning' && (hour < 6 || hour >= 12)) return false;
      if (timeFilter === 'afternoon' && (hour < 12 || hour >= 17)) return false;
      if (timeFilter === 'evening' && (hour < 17 || hour >= 21)) return false;
      if (timeFilter === 'night' && (hour < 21 || hour >= 6)) return false;
    }
    
    return true;
  });

  const t = {
    en: {
      title: 'Time Table',
      subtitle: 'View bus schedules and timings',
      from: 'From Station',
      to: 'To Station',
      date: 'Journey Date',
      busType: 'Bus Type',
      timeOfDay: 'Time of Day',
      all: 'All',
      ordinary: 'Ordinary',
      ac: 'AC',
      volvo: 'Volvo',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      night: 'Night',
      search: 'Search Schedules',
      searching: 'Searching...',
      busNumber: 'Bus No.',
      departs: 'Departs',
      arrives: 'Arrives',
      duration: 'Duration',
      frequency: 'Frequency',
      fare: 'Fare',
      stops: 'Stops',
      via: 'Via',
      available: 'Available',
      notAvailable: 'Not Available',
      swap: 'Swap',
      helpline: 'Helpline',
      schedulesFound: 'schedules found',
      noSchedules: 'No schedules found',
      tryDifferent: 'Try different filters or stations'
    },
    kn: {
      title: 'ಸಮಯ ಕೋಷ್ಟಕ',
      from: 'ಇಂದ',
      to: 'ಗೆ',
      search: 'ವೇಳಾಪಟ್ಟಿ ಹುಡುಕಿ'
    },
    hi: {
      title: 'समय सारणी',
      from: 'से',
      to: 'तक',
      search: 'शेड्यूल खोजें'
    }
  };

  const text = t[language];

  const getBusTypeColor = (type) => {
    if (type.includes('Ordinary')) return '#4caf50';
    if (type.includes('AC')) return '#2196f3';
    if (type.includes('Volvo')) return '#9c27b0';
    if (type.includes('Vayu')) return '#ff5722';
    return '#607d8b';
  };

  return (
    <div>
      <header className="page-header">
        <div className="page-header-container">
          <div className="page-header-left">
            <img src="/assets/bmtc-logo.png" alt="BusFlow" className="header-logo" onClick={() => navigate('/')} onError={e => e.target.style.display='none'} />
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
        <div className="container" style={{maxWidth:'1400px'}}>
          {/* Hero */}
          <div style={{textAlign:'center',marginBottom:'40px'}}>
            <div style={{fontSize:'4rem',marginBottom:'15px'}}>
              <i className="fas fa-clock" style={{color:'#9c27b0'}}></i>
            </div>
            <h2 style={{color:'#333',marginBottom:'10px'}}>{text.subtitle}</h2>
            <p style={{color:'#666'}}>Find accurate bus timings for your journey</p>
          </div>

          {/* Search Card */}
          <div style={{background:'white',padding:'30px',borderRadius:'15px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',marginBottom:'30px'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:'20px',marginBottom:'20px'}}>
              {/* From */}
              <div style={{position:'relative'}}>
                <label style={{display:'block',marginBottom:'8px',color:'#666',fontWeight:'500'}}>
                  <i className="fas fa-map-marker-alt" style={{color:'#4caf50',marginRight:'8px'}}></i>
                  {text.from}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter departure"
                  value={fromStation}
                  onChange={e => handleFromInput(e.target.value)}
                  onFocus={() => fromStation && setShowFromDropdown(true)}
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

              {/* Swap */}
              <div style={{display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
                <button
                  onClick={swapStations}
                  style={{background:'none',border:'2px solid #9c27b0',color:'#9c27b0',padding:'10px 20px',borderRadius:'20px',cursor:'pointer',fontWeight:'600'}}
                  onMouseEnter={e => {e.target.style.background='#9c27b0'; e.target.style.color='white';}}
                  onMouseLeave={e => {e.target.style.background='none'; e.target.style.color='#9c27b0';}}
                >
                  <i className="fas fa-exchange-alt"></i> {text.swap}
                </button>
              </div>

              {/* To */}
              <div style={{position:'relative'}}>
                <label style={{display:'block',marginBottom:'8px',color:'#666',fontWeight:'500'}}>
                  <i className="fas fa-map-marker-alt" style={{color:'#f44336',marginRight:'8px'}}></i>
                  {text.to}
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter destination"
                  value={toStation}
                  onChange={e => handleToInput(e.target.value)}
                  onFocus={() => toStation && setShowToDropdown(true)}
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

              {/* Date */}
              <div>
                <label style={{display:'block',marginBottom:'8px',color:'#666',fontWeight:'500'}}>
                  <i className="fas fa-calendar-alt" style={{color:'#ff9800',marginRight:'8px'}}></i>
                  {text.date}
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn btn-primary btn-block"
              style={{fontSize:'1.1rem',padding:'15px',background:'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',border:'none'}}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> {text.searching}</>
              ) : (
                <><i className="fas fa-search"></i> {text.search}</>
              )}
            </button>
          </div>

          {/* Filters */}
          {showResults && (
            <div style={{background:'white',padding:'20px',borderRadius:'15px',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',marginBottom:'30px'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:'20px'}}>
                {/* Bus Type Filter */}
                <div>
                  <label style={{display:'block',marginBottom:'10px',color:'#666',fontWeight:'500'}}>
                    <i className="fas fa-bus" style={{color:'#2196f3',marginRight:'8px'}}></i>
                    {text.busType}
                  </label>
                  <select
                    className="form-control"
                    value={busTypeFilter}
                    onChange={e => setBusTypeFilter(e.target.value)}
                  >
                    <option value="all">{text.all}</option>
                    <option value="ordinary">{text.ordinary}</option>
                    <option value="ac">{text.ac}</option>
                    <option value="volvo">{text.volvo}</option>
                  </select>
                </div>

                {/* Time Filter */}
                <div>
                  <label style={{display:'block',marginBottom:'10px',color:'#666',fontWeight:'500'}}>
                    <i className="fas fa-clock" style={{color:'#ff9800',marginRight:'8px'}}></i>
                    {text.timeOfDay}
                  </label>
                  <select
                    className="form-control"
                    value={timeFilter}
                    onChange={e => setTimeFilter(e.target.value)}
                  >
                    <option value="all">{text.all}</option>
                    <option value="morning">🌅 {text.morning} (6AM-12PM)</option>
                    <option value="afternoon">☀️ {text.afternoon} (12PM-5PM)</option>
                    <option value="evening">🌆 {text.evening} (5PM-9PM)</option>
                    <option value="night">🌙 {text.night} (9PM-6AM)</option>
                  </select>
                </div>

                {/* Results Count */}
                <div style={{display:'flex',alignItems:'flex-end'}}>
                  <div style={{background:'#e3f2fd',padding:'15px',borderRadius:'10px',width:'100%',textAlign:'center'}}>
                    <p style={{margin:0,color:'#2196f3',fontWeight:'700',fontSize:'1.5rem'}}>{filteredSchedules.length}</p>
                    <p style={{margin:'5px 0 0 0',color:'#666',fontSize:'0.9rem'}}>{text.schedulesFound}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && (
            filteredSchedules.length > 0 ? (
              <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'15px'}}>
                {filteredSchedules.map((schedule, idx) => (
                  <div
                    key={idx}
                    style={{
                      background:'white',
                      padding:'20px',
                      borderRadius:'12px',
                      boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
                      borderLeft:`5px solid ${getBusTypeColor(schedule.busType)}`,
                      display:'grid',
                      gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))',
                      gap:'15px',
                      alignItems:'center'
                    }}
                  >
                    {/* Bus Number */}
                    <div>
                      <p style={{color:'#999',fontSize:'0.75rem',margin:'0 0 5px 0'}}>{text.busNumber}</p>
                      <p style={{color:'#333',fontWeight:'700',fontSize:'1.3rem',margin:0}}>{schedule.busNumber}</p>
                      <span style={{
                        display:'inline-block',
                        background:getBusTypeColor(schedule.busType),
                        color:'white',
                        padding:'3px 8px',
                        borderRadius:'12px',
                        fontSize:'0.7rem',
                        fontWeight:'600',
                        marginTop:'5px'
                      }}>
                        {schedule.busType}
                      </span>
                    </div>

                    {/* Departure */}
                    <div>
                      <p style={{color:'#999',fontSize:'0.75rem',margin:'0 0 5px 0'}}>{text.departs}</p>
                      <p style={{color:'#4caf50',fontWeight:'700',fontSize:'1.2rem',margin:0}}>
                        <i className="fas fa-clock" style={{marginRight:'5px',fontSize:'0.9rem'}}></i>
                        {schedule.departTime}
                      </p>
                    </div>

                    {/* Arrival */}
                    <div>
                      <p style={{color:'#999',fontSize:'0.75rem',margin:'0 0 5px 0'}}>{text.arrives}</p>
                      <p style={{color:'#f44336',fontWeight:'700',fontSize:'1.2rem',margin:0}}>
                        <i className="fas fa-clock" style={{marginRight:'5px',fontSize:'0.9rem'}}></i>
                        {schedule.arriveTime}
                      </p>
                    </div>

                    {/* Duration */}
                    <div>
                      <p style={{color:'#999',fontSize:'0.75rem',margin:'0 0 5px 0'}}>{text.duration}</p>
                      <p style={{color:'#333',fontWeight:'600',fontSize:'1rem',margin:0}}>
                        <i className="fas fa-hourglass-half" style={{marginRight:'5px',color:'#ff9800'}}></i>
                        {schedule.duration}
                      </p>
                    </div>

                    {/* Frequency */}
                    <div>
                      <p style={{color:'#999',fontSize:'0.75rem',margin:'0 0 5px 0'}}>{text.frequency}</p>
                      <p style={{color:'#333',fontWeight:'600',fontSize:'1rem',margin:0}}>
                        <i className="fas fa-repeat" style={{marginRight:'5px',color:'#2196f3'}}></i>
                        {schedule.frequency}
                      </p>
                    </div>

                    {/* Stops */}
                    <div>
                      <p style={{color:'#999',fontSize:'0.75rem',margin:'0 0 5px 0'}}>{text.stops}</p>
                      <p style={{color:'#333',fontWeight:'600',fontSize:'1rem',margin:0}}>
                        <i className="fas fa-map-signs" style={{marginRight:'5px',color:'#9c27b0'}}></i>
                        {schedule.stops}
                      </p>
                      <p style={{color:'#666',fontSize:'0.75rem',margin:'5px 0 0 0'}}>{text.via} {schedule.via}</p>
                    </div>

                    {/* Fare */}
                    <div>
                      <p style={{color:'#999',fontSize:'0.75rem',margin:'0 0 5px 0'}}>{text.fare}</p>
                      <p style={{color:'#4caf50',fontWeight:'700',fontSize:'1.3rem',margin:0}}>{schedule.fare}</p>
                    </div>

                    {/* Availability */}
                    <div style={{textAlign:'center'}}>
                      {schedule.available ? (
                        <div style={{background:'#e8f5e9',padding:'10px',borderRadius:'8px'}}>
                          <i className="fas fa-check-circle" style={{color:'#4caf50',fontSize:'1.5rem',marginBottom:'5px'}}></i>
                          <p style={{color:'#4caf50',fontWeight:'600',fontSize:'0.85rem',margin:0}}>{text.available}</p>
                        </div>
                      ) : (
                        <div style={{background:'#ffebee',padding:'10px',borderRadius:'8px'}}>
                          <i className="fas fa-times-circle" style={{color:'#f44336',fontSize:'1.5rem',marginBottom:'5px'}}></i>
                          <p style={{color:'#f44336',fontWeight:'600',fontSize:'0.85rem',margin:0}}>{text.notAvailable}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{textAlign:'center',padding:'60px 20px',background:'white',borderRadius:'15px'}}>
                <i className="fas fa-calendar-times" style={{fontSize:'4rem',color:'#ddd',marginBottom:'20px'}}></i>
                <h3 style={{color:'#666',marginBottom:'10px'}}>{text.noSchedules}</h3>
                <p style={{color:'#999'}}>{text.tryDifferent}</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default TimeTable;
