// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../constants/Config';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Manejar errores de conexión
    if (!error.response) {
      console.error('API: Error de conexión - Backend no disponible');
      console.error('API: Verifica que el backend esté ejecutándose en:', API_CONFIG.BASE_URL);
      console.error('API: Error completo:', error.message);
      console.error('API: Código de error:', error.code);
      
      // Crear un error personalizado para errores de conexión
      const connectionError = new Error(`Error de conexión. Verifica que el backend esté ejecutándose en ${API_CONFIG.BASE_URL}`);
      connectionError.code = 'CONNECTION_ERROR';
      connectionError.originalError = error;
      return Promise.reject(connectionError);
    }
    
    if (error.response?.status === 401) {
      // Token expirado o inválido - limpiar todos los datos de autenticación
      console.log('API: Token expirado, limpiando datos de autenticación...');
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
        console.log('API: Datos de autenticación limpiados');
      } catch (cleanupError) {
        console.error('API: Error limpiando datos de autenticación:', cleanupError);
      }
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Error de conexión. Verifica que el backend esté ejecutándose.');
      }
      throw error;
    }
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/perfil');
    return response.data;
  },
  
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/cambiar-password', {
      passwordActual: currentPassword,
      passwordNueva: newPassword
    });
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/perfil', profileData);
    return response.data;
  },
};

// Servicios de pacientes
export const patientService = {
  getPatients: async (params = {}) => {
    const response = await api.get('/pacientes', { params });
    return response.data;
  },
  
  getPatient: async (id) => {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  },
  
  createPatient: async (patientData) => {
    const response = await api.post('/pacientes', patientData);
    return response.data;
  },
  
  updatePatient: async (id, patientData) => {
    const response = await api.put(`/pacientes/${id}`, patientData);
    return response.data;
  },
  
  deletePatient: async (id) => {
    const response = await api.delete(`/pacientes/${id}`);
    return response.data;
  },
  
  searchPatients: async (query) => {
    const response = await api.get('/pacientes/buscar', { params: { q: query } });
    return response.data;
  },
};

// Servicios de citas
export const appointmentService = {
  getAppointments: async (params = {}) => {
    const response = await api.get('/citas', { params });
    return response.data;
  },
  
  getAppointment: async (id) => {
    const response = await api.get(`/citas/${id}`);
    return response.data;
  },
  
  createAppointment: async (appointmentData) => {
    const response = await api.post('/citas', appointmentData);
    return response.data;
  },
  
  updateAppointment: async (id, appointmentData) => {
    const response = await api.put(`/citas/${id}`, appointmentData);
    return response.data;
  },
  
  deleteAppointment: async (id) => {
    const response = await api.delete(`/citas/${id}`);
    return response.data;
  },
  
  changeAppointmentStatus: async (id, status, notes) => {
    const response = await api.patch(`/citas/${id}/estado`, { estado: status, notas: notes });
    return response.data;
  },
  
  getAppointmentsByDate: async (date) => {
    const response = await api.get(`/citas/dia/${date}`);
    return response.data;
  },
  
  updateAppointmentStatus: async (id, status) => {
    const response = await api.patch(`/citas/${id}/estado`, { estado: status });
    return response.data;
  },
};

// Servicios de movimientos financieros
export const financialService = {
  getMovements: async (params = {}) => {
    const response = await api.get('/movimientos', { params });
    return response.data;
  },
  
  getMovement: async (id) => {
    const response = await api.get(`/movimientos/${id}`);
    return response.data;
  },
  
  createMovement: async (movementData) => {
    const response = await api.post('/movimientos', movementData);
    return response.data;
  },
  
  updateMovement: async (id, movementData) => {
    const response = await api.put(`/movimientos/${id}`, movementData);
    return response.data;
  },
  
  deleteMovement: async (id) => {
    const response = await api.delete(`/movimientos/${id}`);
    return response.data;
  },
  
  getDailyBalance: async (date) => {
    const response = await api.get(`/movimientos/balance/${date}`);
    return response.data;
  },
  
  getFinancialHistory: async (params = {}) => {
    const response = await api.get('/movimientos/historial', { params });
    return response.data;
  },
};

// Servicios de reportes
export const reportService = {
  generateDailyReport: async (date) => {
    const response = await api.post(`/reportes/generar/${date}`);
    return response.data;
  },
  
  getReports: async (params = {}) => {
    const response = await api.get('/reportes', { params });
    return response.data;
  },
  
  getReport: async (id) => {
    const response = await api.get(`/reportes/${id}`);
    return response.data;
  },
};

// Servicios de dashboard
export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/resumen');
    return response.data;
  },
  
  getStatistics: async (period) => {
    const response = await api.get('/dashboard/estadisticas', { params: { periodo: period } });
    return response.data;
  },
};

export default api;
