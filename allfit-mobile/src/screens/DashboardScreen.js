import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import COLORS from '../constants/colors';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await analyticsAPI.getDashboard(user._id);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user.firstName}!</Text>
        <Text style={styles.subGreeting}>Let's achieve your goals today</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Workouts"
            value={analytics?.workouts?.total || 0}
            subtitle={`${analytics?.workouts?.recentCount || 0} this month`}
            color={COLORS.primary}
          />
          
          <StatCard
            title="Completion Rate"
            value={`${analytics?.workouts?.completionRate || 0}%`}
            subtitle="Last 30 days"
            color={COLORS.success}
          />
          
          <StatCard
            title="Calories Burned"
            value={analytics?.workouts?.totalCaloriesBurned || 0}
            subtitle="Last 30 days"
            color={COLORS.warning}
          />
          
          <StatCard
            title="Training Time"
            value={`${analytics?.workouts?.totalDuration || 0} min`}
            subtitle="Last 30 days"
            color={COLORS.info}
          />
        </View>
      </View>

      {/* Latest Body Metrics */}
      {analytics?.bodyMetrics?.latest && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Measurements</Text>
          <View style={styles.metricsCard}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Weight</Text>
              <Text style={styles.metricValue}>
                {analytics.bodyMetrics.latest.weight} kg
              </Text>
            </View>
            {analytics.bodyMetrics.latest.bodyFat && (
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Body Fat</Text>
                <Text style={styles.metricValue}>
                  {analytics.bodyMetrics.latest.bodyFat}%
                </Text>
              </View>
            )}
            {analytics.bodyMetrics.latest.bmi && (
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>BMI</Text>
                <Text style={styles.metricValue}>
                  {analytics.bodyMetrics.latest.bmi}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Upcoming Appointments */}
      {analytics?.appointments?.upcoming?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          {analytics.appointments.upcoming.map((appointment) => (
            <TouchableOpacity
              key={appointment._id}
              style={styles.appointmentCard}
              onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appointment._id })}
            >
              <View style={styles.appointmentHeader}>
                <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                <Text style={styles.appointmentType}>{appointment.type}</Text>
              </View>
              <Text style={styles.appointmentDate}>
                {new Date(appointment.appointmentDate).toLocaleString()}
              </Text>
              <Text style={styles.appointmentCoach}>
                Coach: {appointment.coachId.firstName} {appointment.coachId.lastName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Workouts')}
        >
          <Text style={styles.actionButtonText}>View My Workouts</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
            Book Appointment
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 15,
  },
  statsGrid: {
    gap: 15,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: COLORS.text.light,
  },
  metricsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metricLabel: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  appointmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
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
  appointmentType: {
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: COLORS.accent + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  appointmentDate: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  appointmentCoach: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonTextSecondary: {
    color: COLORS.primary,
  },
});

export default DashboardScreen;
