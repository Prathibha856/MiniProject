import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockRoutes = [
  {
    id: '240B',
    name: 'Majestic to Electronic City',
    stops: 15,
    duration: '45 min',
    frequency: 'Every 10 min',
    fare: '₹25',
    color: '#3B82F6',
  },
  {
    id: '365',
    name: 'Shivaji Nagar to Silk Board',
    stops: 12,
    duration: '35 min',
    frequency: 'Every 8 min',
    fare: '₹20',
    color: '#22C55E',
  },
  {
    id: '500A',
    name: 'Koramangala to Whitefield',
    stops: 18,
    duration: '55 min',
    frequency: 'Every 15 min',
    fare: '₹30',
    color: '#F59E0B',
  },
  {
    id: '201',
    name: 'City Market to Airport',
    stops: 8,
    duration: '25 min',
    frequency: 'Every 20 min',
    fare: '₹40',
    color: '#EF4444',
  },
];

export default function RoutesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutes = mockRoutes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRouteCard = (route) => (
    <TouchableOpacity key={route.id} style={styles.routeCard}>
      <View style={styles.routeHeader}>
        <View style={[styles.routeIcon, { backgroundColor: route.color }]}>
          <Text style={styles.routeIconText}>{route.id}</Text>
        </View>
        <View style={styles.routeInfo}>
          <Text style={styles.routeName}>{route.name}</Text>
          <Text style={styles.routeDetails}>
            {route.stops} stops • {route.duration} • {route.frequency}
          </Text>
        </View>
        <View style={styles.routeFare}>
          <Text style={styles.fareText}>{route.fare}</Text>
        </View>
      </View>
      
      <View style={styles.routeActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="map" size={16} color="#3B82F6" />
          <Text style={styles.actionText}>View Route</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="time" size={16} color="#22C55E" />
          <Text style={styles.actionText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bus Routes</Text>
        <Text style={styles.headerSubtitle}>Find and explore all available routes</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search routes or bus numbers"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Routes List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.routesList}>
          {filteredRoutes.map(renderRouteCard)}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
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
  routesList: {
    padding: 20,
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  routeIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  routeDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  routeFare: {
    alignItems: 'flex-end',
  },
  fareText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  routeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
});

