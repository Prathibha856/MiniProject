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

const mockSchedules = [
  {
    id: '240B',
    route: 'Majestic → Electronic City',
    nextDeparture: '08:30 AM',
    frequency: 'Every 10 min',
    lastBus: '10:30 PM',
    status: 'On Time',
    statusColor: '#22C55E',
  },
  {
    id: '365',
    route: 'Shivaji Nagar → Silk Board',
    nextDeparture: '08:45 AM',
    frequency: 'Every 8 min',
    lastBus: '11:00 PM',
    status: 'Delayed',
    statusColor: '#F59E0B',
  },
  {
    id: '500A',
    route: 'Koramangala → Whitefield',
    nextDeparture: '09:00 AM',
    frequency: 'Every 15 min',
    lastBus: '10:45 PM',
    status: 'On Time',
    statusColor: '#22C55E',
  },
  {
    id: '201',
    route: 'City Market → Airport',
    nextDeparture: '08:15 AM',
    frequency: 'Every 20 min',
    lastBus: '11:30 PM',
    status: 'On Time',
    statusColor: '#22C55E',
  },
];

const timeSlots = [
  { time: '06:00 AM - 08:00 AM', label: 'Early Morning' },
  { time: '08:00 AM - 10:00 AM', label: 'Morning Rush' },
  { time: '10:00 AM - 12:00 PM', label: 'Late Morning' },
  { time: '12:00 PM - 02:00 PM', label: 'Afternoon' },
  { time: '02:00 PM - 04:00 PM', label: 'Early Afternoon' },
  { time: '04:00 PM - 06:00 PM', label: 'Evening Rush' },
  { time: '06:00 PM - 08:00 PM', label: 'Evening' },
  { time: '08:00 PM - 10:00 PM', label: 'Night' },
];

export default function ScheduleScreen() {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchedules = mockSchedules.filter(schedule =>
    schedule.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    schedule.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTimeSlot = (slot, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.timeSlot,
        selectedTimeSlot === index && styles.selectedTimeSlot,
      ]}
      onPress={() => setSelectedTimeSlot(index)}
    >
      <Text
        style={[
          styles.timeSlotText,
          selectedTimeSlot === index && styles.selectedTimeSlotText,
        ]}
      >
        {slot.time}
      </Text>
      <Text
        style={[
          styles.timeSlotLabel,
          selectedTimeSlot === index && styles.selectedTimeSlotLabel,
        ]}
      >
        {slot.label}
      </Text>
    </TouchableOpacity>
  );

  const renderScheduleCard = (schedule) => (
    <TouchableOpacity key={schedule.id} style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <View style={styles.busInfo}>
          <Text style={styles.busId}>{schedule.id}</Text>
          <Text style={styles.busRoute}>{schedule.route}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: schedule.statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: schedule.statusColor }]}>
            {schedule.status}
          </Text>
        </View>
      </View>

      <View style={styles.scheduleDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color="#6B7280" />
          <Text style={styles.detailLabel}>Next Departure:</Text>
          <Text style={styles.detailValue}>{schedule.nextDeparture}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="refresh" size={16} color="#6B7280" />
          <Text style={styles.detailLabel}>Frequency:</Text>
          <Text style={styles.detailValue}>{schedule.frequency}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="moon" size={16} color="#6B7280" />
          <Text style={styles.detailLabel}>Last Bus:</Text>
          <Text style={styles.detailValue}>{schedule.lastBus}</Text>
        </View>
      </View>

      <View style={styles.scheduleActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="notifications" size={16} color="#3B82F6" />
          <Text style={styles.actionText}>Set Alert</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share" size={16} color="#22C55E" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bus Schedule</Text>
        <Text style={styles.headerSubtitle}>Check departure times and plan your journey</Text>
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

      {/* Time Slots */}
      <View style={styles.timeSlotsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {timeSlots.map(renderTimeSlot)}
        </ScrollView>
      </View>

      {/* Schedules List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.schedulesList}>
          {filteredSchedules.map(renderScheduleCard)}
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
  timeSlotsContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    minWidth: 120,
  },
  selectedTimeSlot: {
    backgroundColor: '#3B82F6',
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  selectedTimeSlotText: {
    color: 'white',
  },
  timeSlotLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  selectedTimeSlotLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  schedulesList: {
    padding: 20,
  },
  scheduleCard: {
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
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  busInfo: {
    flex: 1,
  },
  busId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  busRoute: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  scheduleActions: {
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

