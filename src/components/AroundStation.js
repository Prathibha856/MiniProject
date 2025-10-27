import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import '../styles/around-station.css';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '600px'
};

const defaultCenter = {
  lat: 12.9716,  // Bangalore default
  lng: 77.5946
};

const AMENITY_TYPES = [
  { type: 'restaurant', label: 'Restaurants', icon: 'fa-utensils', color: '#FF6B6B' },
  { type: 'atm', label: 'ATMs', icon: 'fa-money-bill-wave', color: '#4ECDC4' },
  { type: 'hospital', label: 'Hospitals', icon: 'fa-hospital', color: '#45B7D1' },
  { type: 'pharmacy', label: 'Pharmacies', icon: 'fa-pills', color: '#96CEB4' },
  { type: 'gas_station', label: 'Gas Stations', icon: 'fa-gas-pump', color: '#FFEAA7' },
  { type: 'cafe', label: 'Cafes', icon: 'fa-coffee', color: '#DFE6E9' },
  { type: 'shopping_mall', label: 'Shopping', icon: 'fa-shopping-bag', color: '#A29BFE' },
  { type: 'parking', label: 'Parking', icon: 'fa-parking', color: '#FD79A8' }
];

const AroundStation = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(1000);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not get your location. Using default location (Bangalore).');
          setUserLocation(defaultCenter);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setUserLocation(defaultCenter);
    }
  }, []);

  // Search for nearby places using Fetch API
  const searchNearbyPlaces = useCallback(async (amenityType) => {
    if (!userLocation) {
      setError('Location not available');
      return;
    }

    setLoading(true);
    setSelectedAmenity(amenityType);
    setPlaces([]);
    setSelectedPlace(null);
    setError(null);

    console.log('Searching for:', amenityType.label);
    console.log('Location:', userLocation);
    console.log('Radius:', searchRadius);

    try {
      // Use Google Places API via HTTP
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.lat},${userLocation.lng}&radius=${searchRadius}&type=${amenityType.type}&key=${GOOGLE_MAPS_API_KEY}`;
      
      // Note: Direct fetch won't work due to CORS, so we need to use a proxy or the JS library
      // Let's try using the JS library with a div element
      if (!map) {
        setLoading(false);
        setError('Map not ready');
        return;
      }

      // Create a temporary service
      const service = new window.google.maps.places.PlacesService(map);
      const request = {
        location: new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
        radius: searchRadius,
        type: amenityType.type
      };

      console.log('Making Places API request:', request);

      service.nearbySearch(request, (results, status) => {
        setLoading(false);
        console.log('Search status:', status);
        console.log('Results:', results);
        
        if (status === 'OK' && results) {
          console.log('Found', results.length, 'places');
          setPlaces(results);
          if (results.length === 0) {
            setError(`No ${amenityType.label.toLowerCase()} found nearby. Try increasing search radius.`);
          }
        } else if (status === 'ZERO_RESULTS') {
          setError(`No ${amenityType.label.toLowerCase()} found nearby. Try increasing search radius.`);
        } else if (status === 'REQUEST_DENIED') {
          setError('API request denied. Check API key and billing in Google Cloud Console.');
          console.error('REQUEST_DENIED - Check: 1) Billing enabled 2) Places API enabled 3) API key valid');
        } else if (status === 'OVER_QUERY_LIMIT') {
          setError('API quota exceeded.');
        } else if (status === 'INVALID_REQUEST') {
          setError('Invalid request.');
          console.error('INVALID_REQUEST:', request);
        } else {
          setError(`Search failed: ${status}`);
          console.error('Status:', status);
        }
      });
    } catch (err) {
      console.error('Error in searchNearbyPlaces:', err);
      setLoading(false);
      setError('Error: ' + err.message);
    }
  }, [map, userLocation, searchRadius]);

  const calculateDistance = (place) => {
    if (!userLocation) return null;
    
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    
    // Handle both old and new API formats
    let lat2, lon2;
    if (typeof place.geometry.location.lat === 'function') {
      lat2 = place.geometry.location.lat();
      lon2 = place.geometry.location.lng();
    } else {
      lat2 = place.geometry.location.lat;
      lon2 = place.geometry.location.lng;
    }
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;
  };

  const onMapLoad = useCallback((map) => {
    console.log('Google Maps loaded successfully');
    console.log('Places library available:', !!window.google?.maps?.places?.PlacesService);
    setMap(map);
  }, []);

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    if (map) {
      map.panTo(place.geometry.location);
      map.setZoom(16);
    }
  };


  const getDirections = (place) => {
    let lat, lng;
    if (typeof place.geometry.location.lat === 'function') {
      lat = place.geometry.location.lat();
      lng = place.geometry.location.lng();
    } else {
      lat = place.geometry.location.lat;
      lng = place.geometry.location.lng;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="around-station-page">
      <header className="page-header">
        <div className="page-header-container">
          <div className="page-header-left">
            <h2>Around Bus Station</h2>
          </div>
          <div className="page-header-right">
            <button className="icon-btn" onClick={() => navigate('/')}>
              <i className="fas fa-home"></i>
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="around-station-layout">
          {/* Side Panel */}
          <div className="side-panel">
            {/* Location Info */}
            <div className="panel-card">
              <h3>
                <i className="fas fa-map-marker-alt" style={{ marginRight: '10px', color: '#f44336' }}></i>
                Your Location
              </h3>
              {error && (
                <div className="alert-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  {error}
                </div>
              )}
              {userLocation ? (
                <div className="location-info">
                  <p><strong>Latitude:</strong> {userLocation.lat.toFixed(6)}</p>
                  <p><strong>Longitude:</strong> {userLocation.lng.toFixed(6)}</p>
                </div>
              ) : (
                <div className="loading-location">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Getting your location...</p>
                </div>
              )}
            </div>

            {/* Search Radius */}
            <div className="panel-card">
              <h3>
                <i className="fas fa-search-location" style={{ marginRight: '10px', color: '#2196F3' }}></i>
                Search Radius
              </h3>
              <div className="radius-control">
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="500"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="radius-slider"
                />
                <div className="radius-value">{(searchRadius / 1000).toFixed(1)} km</div>
              </div>
            </div>

            {/* Amenity Selector */}
            <div className="panel-card">
              <h3>
                <i className="fas fa-filter" style={{ marginRight: '10px', color: '#4CAF50' }}></i>
                Find Nearby
              </h3>
              <div className="amenity-buttons">
                {AMENITY_TYPES.map((amenity) => (
                  <button
                    key={amenity.type}
                    className={`amenity-btn ${selectedAmenity?.type === amenity.type ? 'active' : ''}`}
                    onClick={() => searchNearbyPlaces(amenity)}
                    disabled={!userLocation || loading}
                    style={{
                      borderColor: selectedAmenity?.type === amenity.type ? amenity.color : 'transparent'
                    }}
                  >
                    <i className={`fas ${amenity.icon}`} style={{ color: amenity.color }}></i>
                    <span>{amenity.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Places List */}
            {places.length > 0 && (
              <div className="panel-card places-list-card">
                <h3>
                  <i className="fas fa-list" style={{ marginRight: '10px', color: '#FF9800' }}></i>
                  Found Places
                </h3>
                <div className="places-count">
                  {places.length} {selectedAmenity?.label.toLowerCase()} found nearby
                </div>
                <div className="places-list">
                  {places.map((place, index) => (
                    <div
                      key={place.place_id}
                      className="place-item"
                      onClick={() => handlePlaceClick(place)}
                    >
                      <div 
                        className="place-icon"
                        style={{ backgroundColor: selectedAmenity?.color }}
                      >
                        <i className={`fas ${selectedAmenity?.icon}`}></i>
                      </div>
                      <div className="place-info">
                        <div className="place-name">{place.name}</div>
                        <div className="place-details">
                          <span>
                            <i className="fas fa-map-marker-alt"></i>
                            {calculateDistance(place)}
                          </span>
                          {place.rating && (
                            <span>
                              <i className="fas fa-star" style={{ color: '#FFD700' }}></i>
                              {place.rating}
                            </span>
                          )}
                        </div>
                        {place.vicinity && (
                          <div className="place-address">{place.vicinity}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map Panel */}
          <div className="map-panel-full">
            {loading && (
              <div className="map-loading-overlay">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Searching for {selectedAmenity?.label.toLowerCase()}...</p>
              </div>
            )}
            
            {!GOOGLE_MAPS_API_KEY ? (
              <div className="map-error">
                <i className="fas fa-exclamation-circle"></i>
                <h3>Google Maps API Key Missing</h3>
                <p>Please add your Google Maps API key to the .env file</p>
              </div>
            ) : (
              <LoadScript
                googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                libraries={['places']}
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={userLocation || defaultCenter}
                  zoom={14}
                  onLoad={onMapLoad}
                  options={{
                    zoomControl: true,
                    streetViewControl: true,
                    mapTypeControl: true,
                    fullscreenControl: true,
                  }}
                >
                  {/* User Location Marker */}
                  {userLocation && (
                    <Marker
                      position={userLocation}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#4285F4',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3
                      }}
                      title="You are here"
                    />
                  )}

                  {/* Place Markers */}
                  {places.map((place) => (
                    <Marker
                      key={place.place_id}
                      position={place.geometry.location}
                      title={place.name}
                      onClick={() => setSelectedPlace(place)}
                      icon={{
                        url: `https://maps.google.com/mapfiles/ms/icons/${selectedAmenity?.type === 'hospital' ? 'blue' : selectedAmenity?.type === 'restaurant' ? 'red' : selectedAmenity?.type === 'atm' ? 'green' : 'yellow'}-dot.png`
                      }}
                    />
                  ))}

                  {/* Info Window */}
                  {selectedPlace && (
                    <InfoWindow
                      position={selectedPlace.geometry.location}
                      onCloseClick={() => setSelectedPlace(null)}
                    >
                      <div className="info-window-content">
                        <h4>{selectedPlace.name}</h4>
                        {selectedPlace.rating && (
                          <div className="info-rating">
                            <i className="fas fa-star" style={{ color: '#FFD700' }}></i>
                            <span>{selectedPlace.rating}</span>
                            {selectedPlace.user_ratings_total && (
                              <span className="rating-count">({selectedPlace.user_ratings_total})</span>
                            )}
                          </div>
                        )}
                        <p>{selectedPlace.vicinity}</p>
                        <div className="info-distance">
                          <i className="fas fa-map-marker-alt"></i>
                          {calculateDistance(selectedPlace)} away
                        </div>
                        {selectedPlace.opening_hours && (
                          <div className={`info-status ${selectedPlace.opening_hours.open_now ? 'open' : 'closed'}`}>
                            <i className={`fas fa-circle`}></i>
                            {selectedPlace.opening_hours.open_now ? 'Open Now' : 'Closed'}
                          </div>
                        )}
                        <button
                          className="directions-btn"
                          onClick={() => getDirections(selectedPlace)}
                        >
                          <i className="fas fa-directions"></i>
                          Get Directions
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AroundStation;
