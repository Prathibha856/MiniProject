import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MapComponent = ({ buses, userLocation, onBusPress }) => {
  const handleBusPress = (bus) => {
    if (onBusPress) {
      onBusPress(bus);
    } else {
      Alert.alert(
        `Bus ${bus.id}`,
        `Route: ${bus.route}\nETA: ${bus.eta}\nOccupancy: ${bus.occupancy}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.mapPlaceholder}>
      <Ionicons name="map" size={48} color="#3B82F6" />
      <Text style={styles.mapPlaceholderText}>Interactive Map</Text>
      <Text style={styles.mapPlaceholderSubtext}>
        {buses.length} buses nearby
      </Text>
      <View style={styles.busMarkersContainer}>
        {buses.map((bus, index) => (
          <TouchableOpacity
            key={bus.id}
            style={[styles.busMarkerButton, { backgroundColor: bus.occupancyColor }]}
            onPress={() => handleBusPress(bus)}
          >
            <Text style={styles.busMarkerButtonText}>{bus.id}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapPlaceholder: {
    height: 200,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 12,
    marginBottom: 4,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  busMarkersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  busMarkerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  busMarkerButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MapComponent;
