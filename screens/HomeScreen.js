import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapComponent from '../components/MapComponent';

const { width, height } = Dimensions.get('window');

// Mock data for buses
const mockBuses = [
  {
    id: '240B',
    route: 'Majestic → ECity',
    eta: '5 min',
    occupancy: 'Medium',
    occupancyColor: '#F59E0B',
    occupancyIcon: '🟡',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    id: '365',
    route: 'ShivajiNagar → SilkBoard',
    eta: '8 min',
    occupancy: 'Low',
    occupancyColor: '#22C55E',
    occupancyIcon: '🟢',
    latitude: 12.9718,
    longitude: 77.5950,
  },
  {
    id: '500A',
    route: 'Koramangala → Whitefield',
    eta: '12 min',
    occupancy: 'High',
    occupancyColor: '#EF4444',
    occupancyIcon: '🔴',
    latitude: 12.9714,
    longitude: 77.5942,
  },
];

const mockUserLocation = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(mockUserLocation);
  const [nearestStop, setNearestStop] = useState('BTM Layout Bus Stop');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location access to see nearby buses.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };


  const renderBusListItem = (bus) => (
    <TouchableOpacity key={bus.id} style={styles.busListItem}>
      <View style={styles.busInfo}>
        <Text style={styles.busId}>{bus.id}</Text>
        <Text style={styles.busRoute}>{bus.route}</Text>
      </View>
      <View style={styles.busDetails}>
        <Text style={styles.busEta}>{bus.eta}</Text>
        <View style={[styles.occupancyBadge, { backgroundColor: bus.occupancyColor + '20' }]}>
          <Text style={[styles.occupancyText, { color: bus.occupancyColor }]}>
            {bus.occupancyIcon} {bus.occupancy}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter your destination or bus number"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={20} color="#3B82F6" />
            <Text style={styles.locationTitle}>Current Location</Text>
          </View>
          <Text style={styles.locationText}>You are near {nearestStop}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={getCurrentLocation}>
            <Ionicons name="refresh" size={16} color="#3B82F6" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Map View */}
        <View style={styles.mapContainer}>
          <Text style={styles.sectionTitle}>Live Bus Tracking</Text>
          <MapComponent 
            buses={mockBuses} 
            userLocation={userLocation}
            onBusPress={(bus) => Alert.alert(
              `Bus ${bus.id}`,
              `Route: ${bus.route}\nETA: ${bus.eta}\nOccupancy: ${bus.occupancy}`,
              [{ text: 'OK' }]
            )}
          />
        </View>

        {/* Bus List */}
        <View style={styles.busListContainer}>
          <Text style={styles.sectionTitle}>Nearby Buses</Text>
          <View style={styles.busListHeader}>
            <Text style={styles.busListHeaderText}>Bus</Text>
            <Text style={styles.busListHeaderText}>Route</Text>
            <Text style={styles.busListHeaderText}>ETA</Text>
            <Text style={styles.busListHeaderText}>Occupancy</Text>
          </View>
          {mockBuses.map(renderBusListItem)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  refreshText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 4,
    fontWeight: '500',
  },
  mapContainer: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  map: {
    height: 200,
    borderRadius: 16,
  },
  busListContainer: {
    margin: 20,
    marginTop: 0,
  },
  busListHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  busListHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  busListItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  busInfo: {
    flex: 2,
  },
  busId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  busRoute: {
    fontSize: 14,
    color: '#6B7280',
  },
  busDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  busEta: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginBottom: 4,
  },
  occupancyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  occupancyText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
