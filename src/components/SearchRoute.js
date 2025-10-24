import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import '../styles/search-route.css';

const SearchRoute = () => {
  const navigate = useNavigate();
  const { language, addFavorite } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [runningBuses, setRunningBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('list');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const polylines = useRef([]);
  const refreshInterval = useRef(null);

  // Demo data fallback
  const demoRoutes = [
    { 
      routeNumber: '335E', 
      routeName: 'Majestic - Whitefield', 
      origin: 'Majestic', 
      destination: 'Whitefield',
      distance: '28 km',
      frequency: '15-20 mins',
      operatingHours: '6:00 AM - 11:00 PM',
      serviceType: 'Ordinary',
      stops: ['Majestic', 'Shivaji Nagar', 'MG Road', 'Indiranagar', 'Marathahalli', 'Whitefield']
    },
    { 
      routeNumber: '500D', 
      routeName: 'Shivaji Nagar - Electronic City', 
      origin: 'Shivaji Nagar', 
      destination: 'Electronic City',
      distance: '35 km',
      frequency: '20-25 mins',
      operatingHours: '5:30 AM - 11:30 PM',
      serviceType: 'AC',
      stops: ['Shivaji Nagar', 'Jayanagar', 'BTM Layout', 'Silk Board', 'Electronic City']
    },
    { 
      routeNumber: '201', 
      routeName: 'KR Puram - Hebbal', 
      origin: 'KR Puram', 
      destination: 'Hebbal',
      distance: '22 km',
      frequency: '10-15 mins',
      operatingHours: '6:00 AM - 10:30 PM',
      serviceType: 'Ordinary',
      stops: ['KR Puram', 'Marathahalli', 'HAL', 'Yemalur', 'Hebbal']
    },
    { 
      routeNumber: '356', 
      routeName: 'Banashankari - Koramangala', 
      origin: 'Banashankari', 
      destination: 'Koramangala',
      distance: '18 km',
      frequency: '12-18 mins',
      operatingHours: '6:30 AM - 10:00 PM',
      serviceType: 'Volvo',
      stops: ['Banashankari', 'JP Nagar', 'BTM Layout', 'HSR Layout', 'Koramangala']
    },
    { 
      routeNumber: 'G4', 
      routeName: 'Yeshwanthpur - Electronic City (Express)', 
      origin: 'Yeshwanthpur', 
      destination: 'Electronic City',
      distance: '32 km',
      frequency: '25-30 mins',
      operatingHours: '7:00 AM - 9:00 PM',
      serviceType: 'AC',
      stops: ['Yeshwanthpur', 'Rajajinagar', 'Majestic', 'Jayanagar', 'Electronic City']
    },
    { 
      routeNumber: 'KBS-1', 
      routeName: 'Kempegowda Bus Station - Whitefield', 
      origin: 'KBS', 
      destination: 'Whitefield',
      distance: '30 km',
      frequency: '15-20 mins',
      operatingHours: '5:00 AM - 12:00 AM',
      serviceType: 'Vayu Vajra',
      stops: ['KBS', 'MG Road', 'Indiranagar', 'Marathahalli', 'Whitefield']
    }
  ];

  const demoBusesForRoute = {
    '335E': [
      { busId: 'KA-01-AB-1234', lat: 12.9716, lng: 77.5946, speed: 35, nextStop: 'Indiranagar', eta: '5 mins', direction: 'Whitefield' },
      { busId: 'KA-01-AB-5678', lat: 12.9850, lng: 77.6100, speed: 40, nextStop: 'Marathahalli', eta: '3 mins', direction: 'Whitefield' }
    ],
    '500D': [
      { busId: 'KA-01-AC-2345', lat: 12.9867, lng: 77.5960, speed: 38, nextStop: 'Jayanagar', eta: '7 mins', direction: 'Electronic City' }
    ],
    '201': [
      { busId: 'KA-01-AD-3456', lat: 12.9950, lng: 77.6200, speed: 42, nextStop: 'Marathahalli', eta: '4 mins', direction: 'Hebbal' }
    ],
    '356': [
      { busId: 'KA-01-AE-4567', lat: 12.9280, lng: 77.5937, speed: 30, nextStop: 'JP Nagar', eta: '6 mins', direction: 'Koramangala' }
    ],
    'G4': [
      { busId: 'KA-01-AF-5678', lat: 12.9716, lng: 77.5946, speed: 45, nextStop: 'Majestic', eta: '8 mins', direction: 'Electronic City' }
    ]
  };

  useEffect(() => {
    loadAllRoutes();
    loadFavorites();
    if (window.google && mapRef.current && !mapInstance.current) {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (selectedRoute && autoRefresh) {
      loadRunningBuses(selectedRoute.routeNumber);
      refreshInterval.current = setInterval(() => {
        loadRunningBuses(selectedRoute.routeNumber);
      }, 10000); // Refresh every 10 seconds
      
      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [selectedRoute, autoRefresh]);

  const loadAllRoutes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllRoutes();
      setRoutes(data);
      setFilteredRoutes(data);
    } catch (error) {
      console.log('Using demo data');
      setRoutes(demoRoutes);
      setFilteredRoutes(demoRoutes);
    } finally {
      setLoading(false);
    }
  };

  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 12.9716, lng: 77.5946 },
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });
  };

  const loadFavorites = () => {
    const saved = JSON.parse(localStorage.getItem('bmtc_favorite_routes') || '[]');
    setFavorites(saved);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    applyFiltersAndSearch(value, serviceTypeFilter);
  };

  const applyFiltersAndSearch = (searchValue = searchQuery, serviceFilter = serviceTypeFilter) => {
    let filtered = routes;

    // Apply search filter
    if (searchValue.length > 0) {
      filtered = filtered.filter(route =>
        route.routeNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
        route.routeName.toLowerCase().includes(searchValue.toLowerCase()) ||
        route.origin.toLowerCase().includes(searchValue.toLowerCase()) ||
        route.destination.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Apply service type filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(route => route.serviceType === serviceFilter);
    }

    setFilteredRoutes(filtered);
  };

  const handleServiceTypeChange = (type) => {
    setServiceTypeFilter(type);
    applyFiltersAndSearch(searchQuery, type);
  };

  const applyFilters = () => {
    applyFiltersAndSearch();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setServiceTypeFilter('all');
    applyFiltersAndSearch(searchQuery, 'all');
    setShowFilters(false);
  };

  const toggleFavorite = (route) => {
    const isFavorite = favorites.some(fav => fav.routeNumber === route.routeNumber);
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favorites.filter(fav => fav.routeNumber !== route.routeNumber);
    } else {
      updatedFavorites = [...favorites, route];
    }
    
    setFavorites(updatedFavorites);
    localStorage.setItem('bmtc_favorite_routes', JSON.stringify(updatedFavorites));
  };

  const isFavorite = (routeNumber) => {
    return favorites.some(fav => fav.routeNumber === routeNumber);
  };

  const selectRoute = async (route) => {
    setSelectedRoute(route);
    setSearchQuery(route.routeNumber);
    setFilteredRoutes([]);
    await loadRouteDetails(route.routeNumber);
    await loadRunningBuses(route.routeNumber);
  };

  const loadRouteDetails = async (routeNumber) => {
    try {
      const data = await apiService.getRouteDetails(routeNumber);
      setRouteDetails(data);
    } catch (error) {
      const demo = demoRoutes.find(r => r.routeNumber === routeNumber);
      setRouteDetails(demo);
    }
  };

  const loadRunningBuses = async (routeNumber) => {
    try {
      const data = await apiService.getRunningBusesOnRoute(routeNumber);
      setRunningBuses(data);
      if (viewType === 'map' && mapInstance.current) {
        displayBusesOnMap(data, routeNumber);
      }
    } catch (error) {
      console.log('Using demo bus data');
      const demoBuses = demoBusesForRoute[routeNumber] || [];
      setRunningBuses(demoBuses);
      if (viewType === 'map' && mapInstance.current) {
        displayBusesOnMap(demoBuses, routeNumber);
      }
    }
  };

  const displayBusesOnMap = (buses, routeNumber) => {
    if (!mapInstance.current || !window.google) return;

    // Clear existing markers
    markers.current.forEach(m => m.setMap(null));
    markers.current = [];
    polylines.current.forEach(p => p.setMap(null));
    polylines.current = [];

    if (buses.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    // Add markers for each bus
    buses.forEach((bus, idx) => {
      const marker = new window.google.maps.Marker({
        position: { lat: bus.lat, lng: bus.lng },
        map: mapInstance.current,
        title: bus.busId,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#d32f2f',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        label: {
          text: String(idx + 1),
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding:10px;min-width:200px">
            <h3 style="color:#d32f2f;margin:0 0 10px 0">Bus ${bus.busId}</h3>
            <p style="margin:5px 0"><strong>Route:</strong> ${routeNumber}</p>
            <p style="margin:5px 0"><strong>Speed:</strong> ${bus.speed} km/h</p>
            <p style="margin:5px 0"><strong>Next Stop:</strong> ${bus.nextStop}</p>
            <p style="margin:5px 0"><strong>ETA:</strong> ${bus.eta}</p>
            <p style="margin:5px 0"><strong>Direction:</strong> ${bus.direction}</p>
          </div>
        `
      });

      marker.addListener('click', () => infoWindow.open(mapInstance.current, marker));
      markers.current.push(marker);
      bounds.extend(marker.getPosition());
    });

    // Draw route path if we have route details
    if (routeDetails && routeDetails.stops) {
      drawRoutePath(routeDetails.stops);
    }

    // Fit map to show all buses
    if (markers.current.length > 0) {
      mapInstance.current.fitBounds(bounds);
    }
  };

  const drawRoutePath = (stops) => {
    // In a real implementation, you would geocode stops or use predefined coordinates
    // For demo, we'll draw a simple path
    const pathCoordinates = stops.map((stop, idx) => ({
      lat: 12.9716 + (idx * 0.01),
      lng: 77.5946 + (idx * 0.01)
    }));

    const routePath = new window.google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#1976D2',
      strokeOpacity: 0.7,
      strokeWeight: 4
    });

    routePath.setMap(mapInstance.current);
    polylines.current.push(routePath);
  };

  const toggleView = (type) => {
    setViewType(type);
    if (type === 'map' && selectedRoute && mapInstance.current) {
      setTimeout(() => {
        window.google.maps.event.trigger(mapInstance.current, 'resize');
        displayBusesOnMap(runningBuses, selectedRoute.routeNumber);
      }, 100);
    }
  };

  const refreshData = () => {
    if (selectedRoute) {
      loadRunningBuses(selectedRoute.routeNumber);
    } else {
      loadAllRoutes();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedRoute(null);
    setRouteDetails(null);
    setRunningBuses([]);
    setFilteredRoutes(routes);
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }
  };

  const t = {
    en: { 
      title: 'Search by Route', 
      search: 'Search', 
      searchPlaceholder: 'Enter route number or name',
      allRoutes: 'All Routes',
      routeDetails: 'Route Details',
      runningBuses: 'Running Buses',
      noRoutes: 'No routes found',
      selectRoute: 'Select a route to view details',
      origin: 'Origin',
      destination: 'Destination',
      distance: 'Distance',
      frequency: 'Frequency',
      operatingHours: 'Operating Hours',
      serviceType: 'Service Type',
      stops: 'Stops',
      listView: 'List View',
      mapView: 'Map View',
      refresh: 'Refresh',
      autoRefresh: 'Auto Refresh',
      clear: 'Clear',
      noBuses: 'No buses running on this route',
      addFavorite: 'Add to Favorites',
      removeFavorite: 'Remove from Favorites',
      filters: 'Filters',
      apply: 'Apply',
      clearFilters: 'Clear Filters',
      favorites: 'My Favorites',
      noFavorites: 'No favorite routes yet',
      allTypes: 'All Types'
    },
    kn: { 
      title: 'ಮಾರ್ಗದ ಮೂಲಕ ಹುಡುಕಿ', 
      search: 'ಹುಡುಕಿ',
      searchPlaceholder: 'ಮಾರ್ಗ ಸಂಖ್ಯೆ ಅಥವಾ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
      allRoutes: 'ಎಲ್ಲಾ ಮಾರ್ಗಗಳು',
      routeDetails: 'ಮಾರ್ಗ ವಿವರಗಳು',
      runningBuses: 'ಚಾಲನೆಯಲ್ಲಿರುವ ಬಸ್‌ಗಳು',
      filters: 'ಫಿಲ್ಟರ್‌ಗಳು',
      favorites: 'ನನ್ನ ಮೆಚ್ಚಿನವುಗಳು'
    },
    hi: { 
      title: 'मार्ग द्वारा खोजें', 
      search: 'खोजें',
      searchPlaceholder: 'मार्ग संख्या या नाम दर्ज करें',
      allRoutes: 'सभी मार्ग',
      routeDetails: 'मार्ग विवरण',
      runningBuses: 'चल रही बसें',
      filters: 'फ़िल्टर',
      favorites: 'मेरे पसंदीदा'
    }
  };

  const text = t[language];

  return (
    <div>
      {/* Header */}
      <header className="page-header">
        <div className="page-header-container">
          <div className="page-header-left">
            <img 
              src="/assets/bmtc-logo.png" 
              alt="BusFlow" 
              className="header-logo" 
              onClick={() => navigate('/')} 
              onError={e => e.target.style.display='none'} 
            />
            <h2>{text.title}</h2>
          </div>
          <div className="page-header-right">
            <button className="icon-btn" onClick={refreshData} title={text.refresh}>
              <i className="fas fa-sync-alt"></i>
            </button>
            <button className="icon-btn" onClick={() => navigate('/')}>
              <i className="fas fa-home"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="search-route-main">
        <div className="container">
          <div className="search-route-layout">
            {/* Search Panel */}
            <div className="search-panel">
              <div className="search-card">
                <h3>{text.search} {text.title}</h3>
                <div className="form-group">
                  <div className="input-with-icon">
                    <i className="fas fa-route"></i>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={text.searchPlaceholder}
                      value={searchQuery}
                      onChange={e => handleSearch(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="clear-input-btn" onClick={clearSearch}>
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                  {filteredRoutes.length > 0 && !selectedRoute && (
                    <div className="suggestions-dropdown active">
                      {filteredRoutes.slice(0, 10).map(route => (
                        <div 
                          key={route.routeNumber} 
                          className="suggestion-item" 
                          onClick={() => selectRoute(route)}
                        >
                          <i className="fas fa-bus"></i>
                          <div>
                            <strong>{route.routeNumber}</strong>
                            <div style={{fontSize:'0.85rem',color:'#666'}}>
                              {route.routeName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filter Button */}
                <button 
                  className="btn btn-outline btn-block"
                  onClick={() => setShowFilters(!showFilters)}
                  style={{marginTop:'15px'}}
                >
                  <i className="fas fa-filter"></i> {text.filters}
                </button>

                {/* Auto Refresh Toggle */}
                {selectedRoute && (
                  <div className="auto-refresh-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={e => setAutoRefresh(e.target.checked)}
                      />
                      <span>{text.autoRefresh} (10s)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="filter-panel">
                  <h4><i className="fas fa-sliders-h"></i> {text.filters}</h4>
                  
                  <div className="form-group">
                    <label>{text.serviceType}</label>
                    <select
                      className="form-control"
                      value={serviceTypeFilter}
                      onChange={e => handleServiceTypeChange(e.target.value)}
                    >
                      <option value="all">{text.allTypes}</option>
                      <option value="Ordinary">Ordinary</option>
                      <option value="AC">AC</option>
                      <option value="Volvo">Volvo</option>
                      <option value="Vayu Vajra">Vayu Vajra</option>
                    </select>
                  </div>

                  <div className="filter-actions">
                    <button className="btn btn-outline" onClick={clearFilters}>
                      {text.clearFilters}
                    </button>
                    <button className="btn btn-primary" onClick={applyFilters}>
                      {text.apply}
                    </button>
                  </div>
                </div>
              )}

              {/* Favorites Section */}
              {favorites.length > 0 && !selectedRoute && (
                <div className="favorites-card">
                  <h4><i className="fas fa-star"></i> {text.favorites}</h4>
                  <div className="favorites-list">
                    {favorites.map(fav => (
                      <div 
                        key={fav.routeNumber} 
                        className="favorite-item"
                        onClick={() => selectRoute(fav)}
                      >
                        <div className="favorite-item-info">
                          <div className="favorite-route-number">{fav.routeNumber}</div>
                          <div className="favorite-route-name">{fav.routeName}</div>
                        </div>
                        <button 
                          className="remove-favorite-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(fav);
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Route Details Card */}
              {routeDetails && (
                <div className="route-details-card">
                  <div className="route-details-header">
                    <h3>
                      <i className="fas fa-info-circle"></i> {text.routeDetails}
                    </h3>
                    <button 
                      className={`favorite-btn ${isFavorite(routeDetails.routeNumber) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(routeDetails)}
                      title={isFavorite(routeDetails.routeNumber) ? text.removeFavorite : text.addFavorite}
                    >
                      <i className={isFavorite(routeDetails.routeNumber) ? 'fas fa-star' : 'far fa-star'}></i>
                    </button>
                  </div>
                  <div className="route-info">
                    <div className="route-number">{routeDetails.routeNumber}</div>
                    <div className="route-name">{routeDetails.routeName}</div>
                    <div className="route-info-grid">
                      <div className="info-item">
                        <span className="info-label">{text.origin}</span>
                        <span className="info-value">{routeDetails.origin}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">{text.destination}</span>
                        <span className="info-value">{routeDetails.destination}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">{text.distance}</span>
                        <span className="info-value">{routeDetails.distance}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">{text.frequency}</span>
                        <span className="info-value">{routeDetails.frequency}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">{text.serviceType}</span>
                        <span className="info-value service-type-badge">{routeDetails.serviceType}</span>
                      </div>
                      <div className="info-item full-width">
                        <span className="info-label">{text.operatingHours}</span>
                        <span className="info-value">{routeDetails.operatingHours}</span>
                      </div>
                    </div>
                    
                    {/* Stops List */}
                    {routeDetails.stops && (
                      <div className="stops-section">
                        <h4>{text.stops} ({routeDetails.stops.length})</h4>
                        <div className="stops-list">
                          {routeDetails.stops.map((stop, idx) => (
                            <div key={idx} className="stop-item">
                              <span className="stop-number">{idx + 1}</span>
                              <span className="stop-name">{stop}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Running Buses List */}
              {selectedRoute && (
                <div className="running-buses-card">
                  <h4>
                    <i className="fas fa-bus"></i> {text.runningBuses} ({runningBuses.length})
                  </h4>
                  {runningBuses.length > 0 ? (
                    <div className="buses-list">
                      {runningBuses.map((bus, idx) => (
                        <div key={bus.busId} className="bus-item">
                          <div className="bus-item-header">
                            <div className="bus-id">
                              <span className="bus-number">{idx + 1}</span>
                              {bus.busId}
                            </div>
                            <div className="bus-speed">{bus.speed} km/h</div>
                          </div>
                          <div className="bus-item-body">
                            <div className="bus-info-item">
                              <i className="fas fa-map-marker-alt"></i>
                              <span>{bus.nextStop}</span>
                            </div>
                            <div className="bus-info-item">
                              <i className="fas fa-clock"></i>
                              <span>{bus.eta}</span>
                            </div>
                            <div className="bus-info-item">
                              <i className="fas fa-arrow-right"></i>
                              <span>{bus.direction}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-small">
                      <i className="fas fa-bus-alt"></i>
                      <p>{text.noBuses}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Map & List Panel */}
            <div className="content-panel">
              {selectedRoute ? (
                <>
                  <div className="view-toggle-bar">
                    <button 
                      className={`toggle-btn ${viewType === 'list' ? 'active' : ''}`}
                      onClick={() => toggleView('list')}
                    >
                      <i className="fas fa-list"></i> {text.listView}
                    </button>
                    <button 
                      className={`toggle-btn ${viewType === 'map' ? 'active' : ''}`}
                      onClick={() => toggleView('map')}
                    >
                      <i className="fas fa-map"></i> {text.mapView}
                    </button>
                  </div>

                  {viewType === 'map' ? (
                    <div className="map-view">
                      <div ref={mapRef} id="route-map" style={{width:'100%',height:'600px'}}></div>
                      {runningBuses.length > 0 && (
                        <div className="map-legend">
                          <h4>Live Bus Locations</h4>
                          <p><i className="fas fa-circle" style={{color:'#d32f2f'}}></i> Bus Location</p>
                          <p><i className="fas fa-minus" style={{color:'#1976D2'}}></i> Route Path</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="list-view-panel">
                      <h3>{text.allRoutes}</h3>
                      <div className="routes-grid">
                        {routes.map(route => (
                          <div 
                            key={route.routeNumber} 
                            className={`route-card ${selectedRoute?.routeNumber === route.routeNumber ? 'active' : ''}`}
                            onClick={() => selectRoute(route)}
                          >
                            <div className="route-card-header">
                              <span className="route-badge">{route.routeNumber}</span>
                            </div>
                            <div className="route-card-body">
                              <div className="route-card-name">{route.routeName}</div>
                              <div className="route-card-path">
                                <i className="fas fa-circle"></i>
                                <span>{route.origin}</span>
                              </div>
                              <div className="route-card-path">
                                <i className="fas fa-map-marker-alt"></i>
                                <span>{route.destination}</span>
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
                  <i className="fas fa-search-location"></i>
                  <h3>{text.selectRoute}</h3>
                  <p>Search for a route number or name to view details and running buses</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchRoute;
