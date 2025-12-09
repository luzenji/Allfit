import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // Navigate to login screen (handle in navigation)
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  getMe: () => 
    api.get('/auth/me'),
  
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Users API
export const usersAPI = {
  getUsers: (params) => 
    api.get('/users', { params }),
  
  getUser: (userId) => 
    api.get(`/users/${userId}`),
  
  createUser: (userData) => 
    api.post('/users', userData),
  
  updateUser: (userId, userData) => 
    api.put(`/users/${userId}`, userData),
  
  deleteUser: (userId) => 
    api.delete(`/users/${userId}`),
};

// Workouts API
export const workoutsAPI = {
  getWorkouts: (params) => 
    api.get('/workouts', { params }),
  
  getWorkout: (workoutId) => 
    api.get(`/workouts/${workoutId}`),
  
  createWorkout: (workoutData) => 
    api.post('/workouts', workoutData),
  
  updateWorkout: (workoutId, workoutData) => 
    api.put(`/workouts/${workoutId}`, workoutData),
  
  deleteWorkout: (workoutId) => 
    api.delete(`/workouts/${workoutId}`),
};

// Appointments API
export const appointmentsAPI = {
  getAppointments: (params) => 
    api.get('/appointments', { params }),
  
  getAppointment: (appointmentId) => 
    api.get(`/appointments/${appointmentId}`),
  
  createAppointment: (appointmentData) => 
    api.post('/appointments', appointmentData),
  
  updateAppointment: (appointmentId, appointmentData) => 
    api.put(`/appointments/${appointmentId}`, appointmentData),
  
  deleteAppointment: (appointmentId) => 
    api.delete(`/appointments/${appointmentId}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (userId) => 
    api.get(`/analytics/dashboard/${userId}`),
  
  getProgress: (userId, params) => 
    api.get(`/analytics/progress/${userId}`, { params }),
  
  addBodyMetrics: (metricsData) => 
    api.post('/analytics/body-metrics', metricsData),
  
  getBodyMetrics: (userId, params) => 
    api.get(`/analytics/body-metrics/${userId}`, { params }),
};

export default api;
