import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import '../styles/track-bus.css';

const TrackBus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useApp();
  const [busNumber, setBusNumber] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);
  const [runningBuses, setRunningBuses] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('map');
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Demo data fallback - 50 Real BMTC bus routes from GTFS and Kaggle datasets
  const demoBuses = [
    { number: '215-NE', route: '11th Block Anjanapura ⇔ Vidhana Soudha', trips: [{ id: 'T215-1', lat: 12.9716, lng: 77.5946, speed: 35, nextStop: 'Vidhana Soudha', eta: '5 mins' }]},
    { number: '285-MC', route: '5th Phase Yelahanka ⇔ Doddaballapura', trips: [{ id: 'T285-1', lat: 13.1057, lng: 77.5725, speed: 40, nextStop: 'Yelahanka', eta: '8 mins' }]},
    { number: '507-D', route: 'Yelahanka New Town ⇔ KR Pura Hospital', trips: [{ id: 'T507-1', lat: 13.0234, lng: 77.6406, speed: 38, nextStop: 'Banaswadi', eta: '10 mins' }]},
    { number: '402-B', route: 'Yelahanka ⇔ Shivajinagara Bus Station', trips: [{ id: 'T402-1', lat: 13.0053, lng: 77.5877, speed: 42, nextStop: 'Hebbal', eta: '12 mins' }]},
    { number: 'G-9', route: 'Shivajinagara ⇔ Yelahanka New Town', trips: [{ id: 'TG9-1', lat: 12.9867, lng: 77.5960, speed: 36, nextStop: 'Mekhri Circle', eta: '7 mins' }]},
    { number: '302', route: 'Kalyananagara ⇔ Shivajinagara Bus Station', trips: [{ id: 'T302-1', lat: 13.0256, lng: 77.6406, speed: 33, nextStop: 'Kalyananagara', eta: '6 mins' }]},
    { number: '250-DD', route: '8th Mile Dasarahalli Circular', trips: [{ id: 'T250-1', lat: 13.0456, lng: 77.5073, speed: 30, nextStop: 'Dasarahalli', eta: '4 mins' }]},
    { number: '60-A', route: 'Jayanagara ⇔ Chandra Layout', trips: [{ id: 'T60-1', lat: 12.9197, lng: 77.5925, speed: 28, nextStop: 'Jayanagar', eta: '5 mins' }]},
    { number: '347-K', route: 'AECS Singasandra ⇔ KR Market', trips: [{ id: 'T347-1', lat: 12.8831, lng: 77.6499, speed: 32, nextStop: 'Silk Board', eta: '15 mins' }]},
    { number: '347-N', route: 'AECS Singasandra ⇔ Kempegowda Bus Station', trips: [{ id: 'T347N-1', lat: 12.9100, lng: 77.6300, speed: 34, nextStop: 'Madiwala', eta: '18 mins' }]},
    { number: '45-G', route: 'AGS Layout Cross ⇔ Kempegowda Bus Station', trips: [{ id: 'T45-1', lat: 12.9135, lng: 77.5409, speed: 31, nextStop: 'AGS Layout', eta: '9 mins' }]},
    { number: '258-N', route: 'Adarshanagara ⇔ Kempegowda Bus Station', trips: [{ id: 'T258-1', lat: 13.0747, lng: 77.4205, speed: 37, nextStop: 'Yeshwanthpur', eta: '20 mins' }]},
    { number: '284-E', route: 'Allalasandra ⇔ Kempegowda Bus Station', trips: [{ id: 'T284-1', lat: 13.0350, lng: 77.5650, speed: 39, nextStop: 'Jalahalli', eta: '22 mins' }]},
    { number: '378-E', route: 'Anjanapura ⇔ Electronic City', trips: [{ id: 'T378-1', lat: 12.8522, lng: 77.5723, speed: 35, nextStop: 'Bannerghatta', eta: '25 mins' }]},
    { number: '500-D', route: 'BEL Factory ⇔ Central Silk Board', trips: [{ id: 'T500-1', lat: 13.0350, lng: 77.6150, speed: 41, nextStop: 'BEL Circle', eta: '30 mins' }]},
    { number: '600-F', route: 'Banashankari ⇔ Attibele Bus Stand', trips: [{ id: 'T600-1', lat: 12.9250, lng: 77.5550, speed: 45, nextStop: 'Banashankari', eta: '45 mins' }]},
    { number: 'G-6', route: 'BEML Layout ⇔ Shanthinagara Bus Station', trips: [{ id: 'TG6-1', lat: 12.9350, lng: 77.5850, speed: 33, nextStop: 'BEML', eta: '12 mins' }]},
    { number: '225-C', route: 'BEML Layout ⇔ Kempegowda Bus Station', trips: [{ id: 'T225-1', lat: 12.9400, lng: 77.5600, speed: 36, nextStop: 'JP Nagar', eta: '28 mins' }]},
    { number: 'KIA-5D', route: 'Art of Living ⇔ Airport', trips: [{ id: 'TKIA-1', lat: 13.1850, lng: 77.7080, speed: 60, nextStop: 'Devanahalli', eta: '35 mins' }]},
    { number: 'V-500BC', route: 'BEL Circle ⇔ Silk Board (Vayu Vajra)', trips: [{ id: 'TV500-1', lat: 13.0256, lng: 77.6300, speed: 50, nextStop: 'Marathahalli', eta: '20 mins' }]},
    { number: '280-F', route: 'Yelahanka ⇔ Hosakote Bus Stand', trips: [{ id: 'T280-1', lat: 13.0850, lng: 77.5900, speed: 42, nextStop: 'Yelahanka', eta: '15 mins' }]},
    { number: '401', route: 'Adishwara Bombay Dying ⇔ Yelahanka', trips: [{ id: 'T401-1', lat: 13.0213, lng: 77.5561, speed: 38, nextStop: 'Hebbal', eta: '10 mins' }]},
    { number: 'BC-7C', route: '8th Mile Dasarahalli Circular', trips: [{ id: 'TBC7-1', lat: 13.0462, lng: 77.5075, speed: 29, nextStop: 'Dasarahalli', eta: '5 mins' }]},
    { number: 'MF-25', route: '8th Mile Dasarahalli ⇔ Thippennahalli', trips: [{ id: 'TMF25-1', lat: 13.0400, lng: 77.5100, speed: 31, nextStop: 'Jalahalli', eta: '8 mins' }]},
    { number: '300-E', route: 'ADMC Quarters ⇔ KR Pura Hospital', trips: [{ id: 'T300-1', lat: 13.0053, lng: 77.6412, speed: 35, nextStop: 'Banaswadi', eta: '12 mins' }]},
    { number: 'V-250SB', route: 'Acharya Institute ⇔ KR Market', trips: [{ id: 'TV250-1', lat: 13.0835, lng: 77.4841, speed: 44, nextStop: 'Yeshwanthpur', eta: '25 mins' }]},
    { number: '401-AK', route: 'Abbigere ⇔ Peenya 2nd Stage', trips: [{ id: 'T401A-1', lat: 13.0770, lng: 77.5259, speed: 36, nextStop: 'Abbigere', eta: '7 mins' }]},
    { number: '399', route: 'Aspire School ⇔ Kadugodi Bus Station', trips: [{ id: 'T399-1', lat: 12.9850, lng: 77.7550, speed: 40, nextStop: 'Whitefield', eta: '18 mins' }]},
    { number: '600-CA', route: 'Anekal ⇔ Central Silk Board', trips: [{ id: 'T600C-1', lat: 12.7150, lng: 77.6950, speed: 47, nextStop: 'Bommanahalli', eta: '30 mins' }]},
    { number: '328-H', route: 'Attibele ⇔ Kadugodi Bus Station', trips: [{ id: 'T328-1', lat: 12.7850, lng: 77.7450, speed: 43, nextStop: 'Sarjapur', eta: '35 mins' }]},
    { number: '63', route: 'BCC Layout ⇔ Shivajinagara Bus Station', trips: [{ id: 'T63-1', lat: 12.9450, lng: 77.6050, speed: 32, nextStop: 'Koramangala', eta: '15 mins' }]},
    { number: '356-CW', route: 'HSR Layout ⇔ Electronic City Wipro Gate', trips: [{ id: 'T356-1', lat: 12.9150, lng: 77.6450, speed: 38, nextStop: 'HSR Layout', eta: '20 mins' }]},
    { number: 'KIA-7A', route: 'HSR Layout ⇔ Airport', trips: [{ id: 'TKIA7-1', lat: 12.9150, lng: 77.6400, speed: 65, nextStop: 'Hebbal', eta: '50 mins' }]},
    { number: '276', route: 'BEL Factory ⇔ Kempegowda Bus Station', trips: [{ id: 'T276-1', lat: 13.0300, lng: 77.6100, speed: 39, nextStop: 'BEL Circle', eta: '25 mins' }]},
    { number: '333', route: 'BEML Factory ⇔ Kempegowda Bus Station', trips: [{ id: 'T333-1', lat: 12.9550, lng: 77.5150, speed: 37, nextStop: 'RR Nagar', eta: '30 mins' }]},
    { number: '314', route: 'BEML Factory ⇔ Yelahanka Old Town', trips: [{ id: 'T314-1', lat: 12.9600, lng: 77.5200, speed: 36, nextStop: 'Nandini Layout', eta: '22 mins' }]},
    { number: '303', route: 'BEML Gate ⇔ Banasawadi', trips: [{ id: 'T303-1', lat: 13.0150, lng: 77.6450, speed: 34, nextStop: 'Banaswadi', eta: '15 mins' }]},
    { number: '201-G', route: 'BEML Gate ⇔ Electronic City', trips: [{ id: 'T201-1', lat: 12.9900, lng: 77.5800, speed: 40, nextStop: 'Silk Board', eta: '35 mins' }]},
    { number: '27', route: 'BTM Water Tank ⇔ Shivajinagara', trips: [{ id: 'T27-1', lat: 12.9170, lng: 77.6100, speed: 31, nextStop: 'BTM Layout', eta: '18 mins' }]},
    { number: '293-Y', route: 'Bagalur ⇔ KR Pura Hospital', trips: [{ id: 'T293-1', lat: 13.1550, lng: 77.6850, speed: 41, nextStop: 'Bagalur', eta: '25 mins' }]},
    { number: '500-BC', route: 'Banashankari ⇔ BEL Circle', trips: [{ id: 'T500B-1', lat: 12.9300, lng: 77.5500, speed: 38, nextStop: 'Girinagar', eta: '40 mins' }]},
    { number: '510', route: 'Banashankari Circular', trips: [{ id: 'T510-1', lat: 12.9250, lng: 77.5600, speed: 27, nextStop: 'Banashankari', eta: '8 mins' }]},
    { number: '375-D', route: 'Banashankari ⇔ Chikkanahalli', trips: [{ id: 'T375-1', lat: 12.9200, lng: 77.5450, speed: 33, nextStop: 'JP Nagar', eta: '15 mins' }]},
    { number: '295A', route: 'Kempegowda Bus Station ⇔ Dodda Gubbi', trips: [{ id: 'T295-1', lat: 12.9800, lng: 77.5700, speed: 39, nextStop: 'Sadashivnagar', eta: '20 mins' }]},
    { number: 'BR1645', route: 'KR Market ⇔ Kamanahalli', trips: [{ id: 'TBR1645-1', lat: 12.9850, lng: 77.6400, speed: 34, nextStop: 'Indiranagar', eta: '16 mins' }]},
    { number: 'BR1646', route: 'Kempegowda Bus Station ⇔ Sarjapura', trips: [{ id: 'TBR1646-1', lat: 12.9150, lng: 77.6900, speed: 42, nextStop: 'Silk Board', eta: '32 mins' }]},
    { number: '52E', route: 'Raghavendra Colony ⇔ Yeshwanthpura', trips: [{ id: 'T52-1', lat: 13.0250, lng: 77.5500, speed: 35, nextStop: 'Yeshwanthpur', eta: '10 mins' }]},
    { number: 'MBS-12', route: 'Annapoorneshwarinagara ⇔ KBS', trips: [{ id: 'TMBS12-1', lat: 12.9780, lng: 77.5040, speed: 36, nextStop: 'Rajajinagar', eta: '18 mins' }]},
    { number: '25-B', route: 'Anugraha Badavane ⇔ Vidhana Soudha', trips: [{ id: 'T25-1', lat: 12.9100, lng: 77.6250, speed: 30, nextStop: 'Richmond Circle', eta: '22 mins' }]},
    { number: '360-K', route: 'Attibele ⇔ KSR Railway Station', trips: [{ id: 'T360-1', lat: 12.7800, lng: 77.7400, speed: 46, nextStop: 'Sarjapur', eta: '40 mins' }]}
  ];

  useEffect(() => {
    loadBuses();
    loadGoogleMaps();
    
    // Check if bus number was passed via navigation state (from SearchRoute)
    if (location.state?.busNumber) {
      const prefillBusNumber = location.state.busNumber;
      setBusNumber(prefillBusNumber);
      // Auto-search after buses are loaded
      setTimeout(() => {
        handleSearch(prefillBusNumber);
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (viewType === 'map' && selectedBus && mapLoaded && mapRef.current) {
      if (!mapInstance.current) {
        initMap();
      }
      if (mapInstance.current) {
        displayBusOnMap(selectedBus);
      }
    }
  }, [viewType, selectedBus, mapLoaded]);

  const loadGoogleMaps = () => {
    if (window.google) {
      setMapLoaded(true);
      return;
    }
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY || 'AIzaSyAzFqc6mTdT5nPwBYbJ_NBuSUs_m12Ryqk';
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  };

  const loadBuses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllRunningBuses();
      setRunningBuses(data);
    } catch (error) {
      console.log('Using demo data');
      setRunningBuses(demoBuses);
    } finally {
      setLoading(false);
    }
  };

  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 12.9716, lng: 77.5946 }
    });
  };

  const handleSearch = (value) => {
    setBusNumber(value);
    if (value.length > 0) {
      const filtered = runningBuses.filter(bus =>
        bus.number.toLowerCase().includes(value.toLowerCase()) ||
        bus.route.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const trackBus = async (num) => {
    const busNum = num || busNumber;
    if (!busNum) {
      alert('Please enter a bus number');
      return;
    }

    try {
      setLoading(true);
      let busData;
      try {
        busData = await apiService.getBusLocation(busNum);
      } catch {
        busData = runningBuses.find(b => b.number.toLowerCase() === busNum.toLowerCase());
      }

      if (!busData) {
        alert(`Bus ${busNum} not found`);
        return;
      }

      setSelectedBus(busData);
      setSuggestions([]);
      if (viewType === 'map') {
        if (!mapInstance.current && window.google && mapRef.current) {
          initMap();
        }
        if (mapInstance.current) displayBusOnMap(busData);
      }
    } catch (error) {
      alert('Error tracking bus');
    } finally {
      setLoading(false);
    }
  };

  const displayBusOnMap = (bus) => {
    if (!mapInstance.current || !window.google) return;

    markers.current.forEach(m => m.setMap(null));
    markers.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    bus.trips.forEach(trip => {
      const marker = new window.google.maps.Marker({
        position: { lat: trip.lat, lng: trip.lng },
        map: mapInstance.current,
        title: `Bus ${bus.number} - ${trip.id}`,
        icon: { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="padding:10px"><h3 style="color:#d32f2f">Bus ${bus.number}</h3>
          <p><strong>Speed:</strong> ${trip.speed} km/h</p>
          <p><strong>Next Stop:</strong> ${trip.nextStop}</p>
          <p><strong>ETA:</strong> ${trip.eta}</p></div>`
      });

      marker.addListener('click', () => infoWindow.open(mapInstance.current, marker));
      markers.current.push(marker);
      bounds.extend(marker.getPosition());
    });

    if (markers.current.length > 0) mapInstance.current.fitBounds(bounds);
  };

  const t = {
    en: { title: 'Track a Bus', search: 'Search', available: 'Available Buses', active: 'Active', vehicleDetails: 'Vehicle Details', mapView: 'Map View', listView: 'List View' },
    kn: { title: 'ಬಸ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ', search: 'ಹುಡುಕಿ', available: 'ಲಭ್ಯವಿರುವ ಬಸ್‌ಗಳು', active: 'ಸಕ್ರಿಯ', vehicleDetails: 'ವಾಹನ ವಿವರಗಳು', mapView: 'ನಕ್ಷೆ ನೋಟ', listView: 'ಪಟ್ಟಿ ನೋಟ' },
    hi: { title: 'बस ट्रैक करें', search: 'खोजें', available: 'उपलब्ध बसें', active: 'सक्रिय', vehicleDetails: 'वाहन विवरण', mapView: 'मानचित्र दृश्य', listView: 'सूची दृश्य' }
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
            <button className="icon-btn" onClick={() => navigate('/')}><i className="fas fa-home"></i></button>
          </div>
        </div>
      </header>

      <main className="track-bus-main">
        <div className="container">
          <div className="track-layout">
            {/* Search Panel */}
            <div className="search-panel">
              <div className="search-card">
                <h3>Select Bus Number</h3>
                <div className="form-group">
                  <div className="input-with-icon">
                    <i className="fas fa-bus"></i>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter bus number (e.g., 101)"
                      value={busNumber}
                      onChange={e => handleSearch(e.target.value)}
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="suggestions-dropdown active">
                      {suggestions.map(bus => (
                        <div key={bus.number} className="suggestion-item" onClick={() => { setBusNumber(bus.number); trackBus(bus.number); }}>
                          <i className="fas fa-bus"></i>
                          <div>
                            <strong>Bus {bus.number}</strong>
                            <div style={{fontSize:'0.85rem',color:'#666'}}>{bus.route}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button className="btn btn-primary btn-block" onClick={() => trackBus()}>
                  <i className="fas fa-search"></i> {text.search}
                </button>
              </div>

              {/* Bus List */}
              <div className="bus-list-card">
                <h4><i className="fas fa-list"></i> {text.available}</h4>
                <div className="bus-list">
                  {runningBuses.map(bus => (
                    <div key={bus.number} className={`bus-item ${selectedBus?.number === bus.number ? 'active' : ''}`} onClick={() => trackBus(bus.number)}>
                      <div className="bus-item-header">
                        <div className="bus-number">Bus {bus.number}</div>
                        <div className="bus-status"><span className="status-dot"></span>{bus.trips.length} {text.active}</div>
                      </div>
                      <div className="bus-route-name">{bus.route}</div>
                      <div className="bus-trips"><i className="fas fa-map-marker-alt"></i> {bus.trips.length} trip(s)</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Details */}
              {selectedBus && (
                <div className="vehicle-details-card">
                  <h4>{text.vehicleDetails}</h4>
                  <div className="vehicle-details">
                    <div className="detail-row">
                      <span className="detail-label">Bus Number</span>
                      <span className="detail-value">{selectedBus.number}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Route</span>
                      <span className="detail-value">{selectedBus.route}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Active Trips</span>
                      <span className="detail-value">{selectedBus.trips.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map & List Panel */}
            <div className="content-panel">
              {selectedBus ? (
                <>
                  <div className="view-toggle-bar">
                    <button className={`toggle-btn ${viewType === 'map' ? 'active' : ''}`} onClick={() => setViewType('map')}>
                      <i className="fas fa-map"></i> {text.mapView}
                    </button>
                    <button className={`toggle-btn ${viewType === 'list' ? 'active' : ''}`} onClick={() => setViewType('list')}>
                      <i className="fas fa-list"></i> {text.listView}
                    </button>
                  </div>

                  {viewType === 'map' ? (
                    <div className="map-view">
                      {!mapLoaded ? (
                        <div style={{width:'100%',height:'500px',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f5'}}>
                          <div style={{textAlign:'center'}}>
                            <i className="fas fa-spinner fa-spin" style={{fontSize:'2rem',color:'#d32f2f',marginBottom:'1rem'}}></i>
                            <p>Loading map...</p>
                          </div>
                        </div>
                      ) : (
                        <div ref={mapRef} id="map" style={{width:'100%',height:'500px'}}></div>
                      )}
                    </div>
                  ) : (
                    <div className="list-view-panel">
                      <h4>Running Trips</h4>
                      <div className="running-trips">
                        {selectedBus.trips.map(trip => (
                          <div key={trip.id} className="trip-card">
                            <div className="trip-header">
                              <div className="trip-id">{trip.id}</div>
                              <div className="trip-status">Running</div>
                            </div>
                            <div className="trip-info">
                              <div className="trip-info-item">
                                <span className="trip-info-label">Speed</span>
                                <span className="trip-info-value">{trip.speed} km/h</span>
                              </div>
                              <div className="trip-info-item">
                                <span className="trip-info-label">Next Stop</span>
                                <span className="trip-info-value">{trip.nextStop}</span>
                              </div>
                              <div className="trip-info-item">
                                <span className="trip-info-label">ETA</span>
                                <span className="trip-info-value">{trip.eta}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-bus"></i>
                  <h3>Select Bus Number</h3>
                  <p>Enter a bus number to track its live location</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackBus;
