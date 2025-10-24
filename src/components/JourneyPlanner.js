import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { getAllStopNames, getStopCoordinates, searchStops } from '../data/busStops';
import '../styles/journey-planner.css';

const JourneyPlanner = () => {
  const navigate = useNavigate();
  const { language, addFavorite } = useApp();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('list');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    departTime: '',
    serviceType: 'all',
    sortBy: 'duration'
  });
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Real BMTC bus stops data
  const [stations, setStations] = useState([]);
  
  // Load bus stops on component mount
  useEffect(() => {
    const stopNames = getAllStopNames();
    setStations(stopNames);
  }, []);

  // Sample routes data (will be replaced with API call)
  const sampleRoutes = [
    {
      id: 1,
      type: 'direct',
      buses: ['335E', '500D'],
      duration: '45 mins',
      fare: '₹25',
      from: origin,
      to: destination,
      departTime: '09:30 AM',
      arriveTime: '10:15 AM',
      stops: [origin, 'Intermediate Stop 1', 'Intermediate Stop 2', destination],
      serviceType: 'Ordinary'
    },
    {
      id: 2,
      type: 'connecting',
      segments: [
        { bus: '201', from: origin, to: 'KR Puram', stops: [origin, 'Stop 1', 'KR Puram'] },
        { bus: '500D', from: 'KR Puram', to: destination, stops: ['KR Puram', 'Stop 2', destination] }
      ],
      duration: '1 hr 10 mins',
      fare: '₹30',
      from: origin,
      to: destination,
      departTime: '09:45 AM',
      arriveTime: '10:55 AM',
      serviceType: 'AC'
    }
  ];

  useEffect(() => {
    // Load recent searches
    const saved = JSON.parse(localStorage.getItem('bmtc_recent_journeys') || '[]');
    setRecentSearches(saved);
  }, []);

  useEffect(() => {
    // Initialize map when switching to map view
    if (viewType === 'map' && window.google && mapRef.current && !mapInstance.current) {
      setTimeout(() => {
        initMap();
      }, 100);
    }
  }, [viewType]);

  useEffect(() => {
    // Update map when routes change and map view is active
    if (viewType === 'map' && mapInstance.current && routes.length > 0) {
      setTimeout(() => {
        displayAllRoutesOnMap();
      }, 200);
    }
  }, [routes, viewType]);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: { lat: 12.9716, lng: 77.5946 },
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });

    // Display routes if available
    if (routes.length > 0) {
      displayAllRoutesOnMap();
    }
  };

  const handleOriginChange = (value) => {
    setOrigin(value);
    if (value.length >= 2) {
      const suggestions = searchStops(value);
      setOriginSuggestions(suggestions.slice(0, 8));
      setShowOriginSuggestions(suggestions.length > 0);
    } else {
      setShowOriginSuggestions(false);
    }
  };

  const handleDestChange = (value) => {
    setDestination(value);
    if (value.length >= 2) {
      const suggestions = searchStops(value);
      setDestSuggestions(suggestions.slice(0, 8));
      setShowDestSuggestions(suggestions.length > 0);
    } else {
      setShowDestSuggestions(false);
    }
  };

  const selectOrigin = (station) => {
    setOrigin(station);
    setShowOriginSuggestions(false);
  };

  const selectDestination = (station) => {
    setDestination(station);
    setShowDestSuggestions(false);
  };

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const searchRoutes = async () => {
    if (!origin || !destination) {
      alert('Please select both origin and destination');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.planJourney(origin, destination, filters.departTime);
      console.log('API Response:', response); // Debug log
      
      if (response && Array.isArray(response)) {
        const formattedRoutes = response.map(route => ({
          id: route.route.routeId,
          type: 'direct',
          buses: [route.route.routeShortName],
          duration: `${route.metrics.estimatedTimeMinutes} mins`,
          fare: '₹25', // TODO: Implement fare calculation
          from: origin,
          to: destination,
          departTime: route.departureTime || '09:00 AM', // Default time if not provided
          arriveTime: route.arrivalTime || '10:00 AM', // Default time if not provided
          stops: route.stops.map(stop => stop.stopName),
          serviceType: route.route.routeType === 3 ? 'Ordinary' : 'AC',
          shapes: route.shapes || [],
          stopCoordinates: route.stops.map(stop => ({
            lat: parseFloat(stop.stopLat),
            lng: parseFloat(stop.stopLon),
            name: stop.stopName
          }))
        }));

        console.log('Formatted Routes:', formattedRoutes); // Debug log

        // Apply filters
        let filteredRoutes = formattedRoutes;
        if (filters.serviceType !== 'all') {
          filteredRoutes = filteredRoutes.filter(route => route.serviceType === filters.serviceType);
        }
        
        // Sort routes
        if (filters.sortBy === 'duration') {
          filteredRoutes.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
        } else if (filters.sortBy === 'fare') {
          filteredRoutes.sort((a, b) => parseInt(a.fare.replace('₹', '')) - parseInt(b.fare.replace('₹', '')));
        }
        
        setRoutes(filteredRoutes);
        
        // If map view is active, update the map
        if (viewType === 'map' && mapInstance.current) {
          setTimeout(() => displayAllRoutesOnMap(), 500);
        }
      }
      
      // Save to recent searches
      saveRecentSearch(origin, destination);
    } catch (error) {
      console.error('Error fetching routes:', error);
      alert('Error finding routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveRecentSearch = (from, to) => {
    const search = { from, to, timestamp: Date.now() };
    const updated = [search, ...recentSearches.filter(s => 
      !(s.from === from && s.to === to)
    )].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('bmtc_recent_journeys', JSON.stringify(updated));
  };

  const loadRecentSearch = (search) => {
    setOrigin(search.from);
    setDestination(search.to);
  };

  const viewRouteDetails = (route) => {
    setSelectedRoute(route);
    setShowRouteDetails(true);
    if (viewType === 'map' && mapInstance.current) {
      displayRouteOnMap(route);
    }
  };

  const displayAllRoutesOnMap = () => {
    if (!mapInstance.current || !window.google) return;
    console.log('Displaying routes on map:', routes); // Debug log
    
    // Clear existing markers and polylines
    if (mapInstance.current.markers) {
      mapInstance.current.markers.forEach(marker => marker.setMap(null));
    }
    if (mapInstance.current.polylines) {
      mapInstance.current.polylines.forEach(line => line.setMap(null));
    }
    mapInstance.current.markers = [];
    mapInstance.current.polylines = [];

    const bounds = new window.google.maps.LatLngBounds();
    
    routes.forEach((route, routeIndex) => {
      console.log('Processing route:', route); // Debug log
      
      // Draw route shapes if available
      if (route.shapes && route.shapes.length > 0) {
        console.log('Drawing shapes for route:', route.id); // Debug log
        const shapePath = route.shapes.map(point => ({
          lat: parseFloat(point.shapePtLat),
          lng: parseFloat(point.shapePtLon)
        })).filter(point => !isNaN(point.lat) && !isNaN(point.lng));

        if (shapePath.length > 0) {
          const routeLine = new window.google.maps.Polyline({
            path: shapePath,
            geodesic: true,
            strokeColor: routeIndex === 0 ? '#2196f3' : '#666',
            strokeOpacity: routeIndex === 0 ? 1 : 0.6,
            strokeWeight: routeIndex === 0 ? 4 : 3,
            map: mapInstance.current
          });
          
          mapInstance.current.polylines.push(routeLine);
          
          // Extend bounds with shape points
          shapePath.forEach(point => bounds.extend(point));
        }
      } else {
        console.log('No shapes available for route:', route.id); // Debug log
      }

      // Add stop markers
      if (route.stopCoordinates && route.stopCoordinates.length > 0) {
        console.log('Adding stop markers for route:', route.id); // Debug log
        route.stopCoordinates.forEach((stop, idx) => {
          if (!stop.lat || !stop.lng || isNaN(stop.lat) || isNaN(stop.lng)) {
            console.log('Invalid stop coordinates:', stop);
            return;
          }

          const isOrigin = idx === 0;
          const isDestination = idx === route.stopCoordinates.length - 1;
          
          const marker = new window.google.maps.Marker({
            position: { lat: stop.lat, lng: stop.lng },
            map: mapInstance.current,
            title: stop.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: isOrigin || isDestination ? 10 : 6,
              fillColor: isOrigin ? '#4caf50' : isDestination ? '#d32f2f' : '#666',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2
            },
            label: isOrigin ? 'A' : isDestination ? 'B' : ''
          });

          // Add click listener to show stop info
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h4 style="margin: 0 0 8px 0;">${stop.name}</h4>
                <div style="margin: 5px 0;">
                  <strong>${isOrigin ? 'Origin Stop' : isDestination ? 'Destination Stop' : 'Via Stop'}</strong>
                </div>
                <div>
                  <strong>Bus:</strong> ${route.buses ? route.buses.join(', ') : 'N/A'}
                </div>
                ${!isOrigin && !isDestination ? `
                <div style="margin-top: 5px;">
                  <strong>Expected Time:</strong> ${route.departTime || 'N/A'}
                </div>` : ''}
              </div>
            `
          });

          marker.addListener('click', () => {
            mapInstance.current.infoWindow?.close();
            infoWindow.open(mapInstance.current, marker);
            mapInstance.current.infoWindow = infoWindow;
          });

          mapInstance.current.markers.push(marker);
          bounds.extend(stop);
        });
      } else {
        console.log('No stop coordinates available for route:', route.id); // Debug log
      }
    });

    // Fit map to show all markers and shapes
    if (!bounds.isEmpty()) {
      mapInstance.current.fitBounds(bounds);
      // Add some padding to the bounds
      mapInstance.current.setZoom(mapInstance.current.getZoom() - 1);
    } else {
      console.log('No valid bounds to fit map to'); // Debug log
      // Center on Bangalore if no bounds
      mapInstance.current.setCenter({ lat: 12.9716, lng: 77.5946 });
      mapInstance.current.setZoom(12);
    }
  };

  const displayRouteOnMap = (route) => {
    if (!mapInstance.current || !window.google) return;
    
    // Clear existing markers and polylines
    mapInstance.current.markers?.forEach(marker => marker.setMap(null));
    mapInstance.current.polylines?.forEach(line => line.setMap(null));
    mapInstance.current.markers = [];
    mapInstance.current.polylines = [];

    const bounds = new window.google.maps.LatLngBounds();

    // Draw route shape
    if (route.shapes && route.shapes.length > 0) {
      const shapePath = route.shapes.map(point => ({
        lat: parseFloat(point.shapePtLat),
        lng: parseFloat(point.shapePtLon)
      }));

      const routeLine = new window.google.maps.Polyline({
        path: shapePath,
        geodesic: true,
        strokeColor: '#2196f3',
        strokeOpacity: 1,
        strokeWeight: 4,
        map: mapInstance.current
      });
      
      mapInstance.current.polylines.push(routeLine);
      
      // Extend bounds with shape points
      shapePath.forEach(point => bounds.extend(point));
    }

    // Add stop markers
    if (route.stopCoordinates) {
      route.stopCoordinates.forEach((stop, idx) => {
        const isOrigin = idx === 0;
        const isDestination = idx === route.stopCoordinates.length - 1;
        
        const marker = new window.google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map: mapInstance.current,
          title: stop.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: isOrigin || isDestination ? 10 : 6,
            fillColor: isOrigin ? '#4caf50' : isDestination ? '#d32f2f' : '#666',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2
          },
          label: isOrigin ? 'A' : isDestination ? 'B' : ''
        });

        // Add click listener to show stop info
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 8px 0;">${stop.name}</h4>
              ${isOrigin ? 'Origin Stop' : isDestination ? 'Destination Stop' : 'Via Stop'}
              <br>
              <strong>Bus:</strong> ${route.buses.join(', ')}
              ${!isOrigin && !isDestination ? `<br><strong>Time:</strong> ${route.departTime}` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          mapInstance.current.infoWindow?.close();
          infoWindow.open(mapInstance.current, marker);
          mapInstance.current.infoWindow = infoWindow;
        });

        mapInstance.current.markers.push(marker);
        bounds.extend(stop);
      });
    }

    // Fit map to show all markers and shapes
    mapInstance.current.fitBounds(bounds);
  };

  const applyFilters = () => {
    setShowFilters(false);
    searchRoutes();
  };

  const clearFilters = () => {
    setFilters({
      departTime: '',
      serviceType: 'all',
      sortBy: 'duration'
    });
  };

  const t = {
    en: { 
      title: 'Journey Planner', origin: 'Origin', destination: 'Destination', 
      swap: 'Swap', searchRoutes: 'Search Routes', recentSearches: 'Recent Searches',
      filters: 'Filters', departTime: 'Depart Time', serviceType: 'Service Type',
      sortBy: 'Sort By', apply: 'Apply', clear: 'Clear', listView: 'List View',
      mapView: 'Map View', direct: 'Direct', connecting: 'Connecting', 
      routeDetails: 'Route Details', close: 'Close', selectOrigin: 'Select origin to begin'
    },
    kn: {
      title: 'ಪ್ರಯಾಣ ಯೋಜಕ', origin: 'ಮೂಲ', destination: 'ಗಮ್ಯಸ್ಥಾನ',
      swap: 'ಬದಲಾಯಿಸಿ', searchRoutes: 'ಮಾರ್ಗಗಳನ್ನು ಹುಡುಕಿ', recentSearches: 'ಇತ್ತೀಚಿನ ಹುಡುಕಾಟಗಳು'
    },
    hi: {
      title: 'यात्रा योजनाकार', origin: 'प्रारंभ', destination: 'गंतव्य',
      swap: 'बदलें', searchRoutes: 'मार्ग खोजें', recentSearches: 'हाल की खोजें'
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
      <main className="journey-planner-main">
        <div className="container">
          <div className="planner-layout">
            {/* Search Panel */}
            <div className="search-panel">
              <div className="search-card">
                <h3>Plan Your Journey</h3>
                
                {/* Origin Input */}
                <div className="form-group">
                  <label>{text.origin}</label>
                  <div className="input-with-icon">
                    <i className="fas fa-circle origin-icon"></i>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter origin station"
                      value={origin}
                      onChange={e => handleOriginChange(e.target.value)}
                      onFocus={() => origin && setShowOriginSuggestions(true)}
                    />
                    {showOriginSuggestions && originSuggestions.length > 0 && (
                      <div className="suggestions-dropdown active">
                        {originSuggestions.map((station, idx) => (
                          <div key={idx} className="suggestion-item" onClick={() => selectOrigin(station)}>
                            <i className="fas fa-map-marker-alt"></i>
                            {station}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Swap Button */}
                <div className="swap-btn-container">
                  <button className="swap-btn" onClick={swapLocations}>
                    <i className="fas fa-exchange-alt"></i>
                  </button>
                </div>

                {/* Destination Input */}
                <div className="form-group">
                  <label>{text.destination}</label>
                  <div className="input-with-icon">
                    <i className="fas fa-map-marker-alt destination-icon"></i>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter destination station"
                      value={destination}
                      onChange={e => handleDestChange(e.target.value)}
                      onFocus={() => destination && setShowDestSuggestions(true)}
                    />
                    {showDestSuggestions && destSuggestions.length > 0 && (
                      <div className="suggestions-dropdown active">
                        {destSuggestions.map((station, idx) => (
                          <div key={idx} className="suggestion-item" onClick={() => selectDestination(station)}>
                            <i className="fas fa-map-marker-alt"></i>
                            {station}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Button */}
                <button 
                  className="btn btn-primary btn-block" 
                  onClick={searchRoutes}
                  disabled={loading}
                >
                  <i className="fas fa-search"></i> {loading ? 'Searching...' : text.searchRoutes}
                </button>

                {/* Filter Button */}
                <button 
                  className="btn btn-outline btn-block" 
                  onClick={() => setShowFilters(!showFilters)}
                  style={{marginTop:'10px'}}
                >
                  <i className="fas fa-filter"></i> {text.filters}
                </button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="filter-panel">
                  <h4><i className="fas fa-sliders-h"></i> {text.filters}</h4>
                  
                  <div className="form-group">
                    <label>{text.departTime}</label>
                    <input
                      type="time"
                      className="form-control"
                      value={filters.departTime}
                      onChange={e => setFilters({...filters, departTime: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>{text.serviceType}</label>
                    <select
                      className="form-control"
                      value={filters.serviceType}
                      onChange={e => setFilters({...filters, serviceType: e.target.value})}
                    >
                      <option value="all">All Types</option>
                      <option value="Ordinary">Ordinary</option>
                      <option value="AC">AC</option>
                      <option value="Volvo">Volvo</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{text.sortBy}</label>
                    <select
                      className="form-control"
                      value={filters.sortBy}
                      onChange={e => setFilters({...filters, sortBy: e.target.value})}
                    >
                      <option value="duration">Duration</option>
                      <option value="fare">Fare</option>
                      <option value="departure">Departure Time</option>
                    </select>
                  </div>

                  <div className="filter-actions">
                    <button className="btn btn-outline" onClick={clearFilters}>
                      {text.clear}
                    </button>
                    <button className="btn btn-primary" onClick={applyFilters}>
                      {text.apply}
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && !routes.length && (
                <div className="search-card">
                  <h4><i className="fas fa-history"></i> {text.recentSearches}</h4>
                  <div className="recent-searches">
                    {recentSearches.map((search, idx) => (
                      <div key={idx} className="recent-item" onClick={() => loadRecentSearch(search)}>
                        <div className="recent-item-text">
                          <div className="recent-item-from">{search.from}</div>
                          <div className="recent-item-to">→ {search.to}</div>
                        </div>
                        <i className="fas fa-arrow-right"></i>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results Panel */}
            <div className="results-panel">
              <div className="results-header">
                <h3>{routes.length} {routes.length === 1 ? 'Route' : 'Routes'} Found</h3>
                <div className="view-toggle">
                  <button 
                    className={`toggle-btn ${viewType === 'list' ? 'active' : ''}`}
                    onClick={() => setViewType('list')}
                  >
                    <i className="fas fa-list"></i> {text.listView}
                  </button>
                  <button 
                    className={`toggle-btn ${viewType === 'map' ? 'active' : ''}`}
                    onClick={() => setViewType('map')}
                  >
                    <i className="fas fa-map"></i> {text.mapView}
                  </button>
                </div>
              </div>

              {viewType === 'list' ? (
                <div className="list-view">
                  {routes.length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-route"></i>
                      <h3>{text.selectOrigin}</h3>
                      <p>Enter origin and destination to find routes</p>
                    </div>
                  ) : (
                    routes.map(route => (
                      <div key={route.id} className="route-card" onClick={() => viewRouteDetails(route)}>
                        <div className="route-header">
                          <span className={`route-type ${route.type}`}>
                            {route.type === 'direct' ? text.direct : text.connecting}
                          </span>
                          <span className="route-duration">{route.duration}</span>
                        </div>

                        <div className="route-path">
                          <div className="route-point">
                            <div className="route-point-label">From</div>
                            <div className="route-point-name">{route.from}</div>
                          </div>
                          <i className="fas fa-arrow-right route-arrow"></i>
                          <div className="route-point">
                            <div className="route-point-label">To</div>
                            <div className="route-point-name">{route.to}</div>
                          </div>
                        </div>

                        <div className="route-info">
                          <div className="route-buses">
                            {route.buses ? route.buses.map((bus, idx) => (
                              <span key={idx} className="bus-badge">{bus}</span>
                            )) : route.segments && route.segments.map((seg, idx) => (
                              <span key={idx} className="bus-badge">{seg.bus}</span>
                            ))}
                          </div>
                          <span className="route-fare">{route.fare}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="map-view">
                  {routes.length === 0 ? (
                    <div className="empty-state">
                      <i className="fas fa-map-marked-alt"></i>
                      <h3>No Routes to Display</h3>
                      <p>Search for routes to view them on the map</p>
                    </div>
                  ) : (
                    <div ref={mapRef} id="map" style={{width:'100%',height:'500px',borderRadius:'12px'}}></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Route Details Modal */}
      {showRouteDetails && selectedRoute && (
        <div className="modal active" onClick={() => setShowRouteDetails(false)}>
          <div className="modal-content route-details-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowRouteDetails(false)}>
              <i className="fas fa-times"></i>
            </button>
            
            <div className="route-details-header">
              <h2>{text.routeDetails}</h2>
              <p>{selectedRoute.from} → {selectedRoute.to}</p>
              <p style={{fontSize:'1.2rem',marginTop:'10px'}}>
                <strong>{selectedRoute.duration}</strong> • {selectedRoute.fare}
              </p>
            </div>

            {selectedRoute.type === 'direct' ? (
              <div className="route-segment">
                <div className="segment-header">
                  <span className="segment-bus">
                    Bus {selectedRoute.buses.join(', ')}
                  </span>
                  <span className="segment-type">{selectedRoute.serviceType}</span>
                </div>
                <div className="segment-stops">
                  {selectedRoute.stops.map((stop, idx) => (
                    <div key={idx} className="stop-item">
                      <span className="stop-name">{stop}</span>
                      <span className="stop-time">
                        {idx === 0 ? selectedRoute.departTime : idx === selectedRoute.stops.length - 1 ? selectedRoute.arriveTime : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              selectedRoute.segments.map((segment, idx) => (
                <div key={idx} className="route-segment">
                  <div className="segment-header">
                    <span className="segment-bus">Bus {segment.bus}</span>
                    <span className="segment-type">{selectedRoute.serviceType}</span>
                  </div>
                  <div className="segment-stops">
                    {segment.stops.map((stop, stopIdx) => (
                      <div key={stopIdx} className="stop-item">
                        <span className="stop-name">{stop}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyPlanner;
