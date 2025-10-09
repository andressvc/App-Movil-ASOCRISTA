// constants/Config.js
import { Platform } from 'react-native';

// Función para obtener la URL base según la plataforma
const getBaseURL = () => {
  // Siempre usar la URL de producción de Render
  return 'https://asocrista.onrender.com/api';
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 30000, // 30 segundos para conexiones móviles
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
  },
};

export const APP_CONFIG = {
  NAME: 'ASOCRISTA',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de Gestión del Centro Médico ASOCRISTA',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REMEMBER_ME: 'remember_me',
  THEME: 'theme',
  BIOMETRIC_CREDENTIALS: 'biometric_credentials',
};

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
};

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME: 'DD/MM/YYYY HH:mm',
  TIME: 'HH:mm',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};
