import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import '../styles/track-bus.css';

const TrackBus = () => {
  const navigate = useNavigate();
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

  // Demo data fallback
  const demoBuses = [
    { number: '101', route: 'Majestic - Whitefield', trips: [
      { id: 'T101-1', lat: 12.9716, lng: 77.5946, speed: 35, nextStop: 'Indiranagar', eta: '5 mins', direction: 'Whitefield' }
    ]},
    { number: '202', route: 'Shivaji Nagar - Electronic City', trips: [
      { id: 'T202-1', lat: 12.9867, lng: 77.5960, speed: 38, nextStop: 'Jayanagar', eta: '10 mins', direction: 'Electronic City' }
    ]}
  ];

  useEffect(() => {
    loadBuses();
    if (window.google && mapRef.current) initMap();
  }, []);

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
    if (!busNum) return;

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
      if (mapInstance.current) displayBusOnMap(busData);
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
                      <div ref={mapRef} id="map" style={{width:'100%',height:'500px'}}></div>
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
