import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI } from '../services/api';
import COLORS from '../constants/colors';

const CalendarScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentsAPI.getAppointments();
      setAppointments(response.data.appointments);
      markAppointmentDates(response.data.appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAppointmentDates = (appointmentsList) => {
    const marked = {};
    appointmentsList.forEach((appointment) => {
      const date = new Date(appointment.appointmentDate).toISOString().split('T')[0];
      marked[date] = {
        marked: true,
        dotColor: COLORS.primary,
      };
    });
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: COLORS.primary,
    };
    setMarkedDates(marked);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAppointments();
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    const marked = { ...markedDates };
    Object.keys(marked).forEach((key) => {
      marked[key] = { ...marked[key], selected: false };
    });
    marked[day.dateString] = {
      ...marked[day.dateString],
      selected: true,
      selectedColor: COLORS.primary,
    };
    setMarkedDates(marked);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate).toISOString().split('T')[0];
    return appointmentDate === selectedDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return COLORS.info;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.text.light;
    }
  };

  const renderAppointmentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item._id })}
    >
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.appointmentTime}>
        {new Date(item.appointmentDate).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
      
      <Text style={styles.appointmentType}>{item.type}</Text>
      
      {item.coachId && (
        <Text style={styles.appointmentCoach}>
          Coach: {item.coachId.firstName} {item.coachId.lastName}
        </Text>
      )}
      
      {item.duration && (
        <Text style={styles.appointmentDuration}>
          Duration: {item.duration} minutes
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={onDayPress}
        theme={{
          selectedDayBackgroundColor: COLORS.primary,
          todayTextColor: COLORS.primary,
          dotColor: COLORS.primary,
          arrowColor: COLORS.primary,
        }}
        style={styles.calendar}
      />

      <View style={styles.appointmentsSection}>
        <Text style={styles.sectionTitle}>
          Appointments for {new Date(selectedDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </Text>

        <FlatList
          data={filteredAppointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No appointments on this day</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appointmentsSection: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 15,
  },
  listContent: {
    flexGrow: 1,
  },
  appointmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  appointmentCoach: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  appointmentDuration: {
    fontSize: 14,
    color: COLORS.text.light,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
});

export default CalendarScreen;
