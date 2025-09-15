// constants/Config.local.js - Configuración local para desarrollo
import { Platform } from 'react-native';

// Para desarrollo local, usa localhost en web y la IP de tu máquina en móvil
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  } else {
    // IMPORTANTE: Cambia esta IP por la IP de tu máquina
    // Para encontrar tu IP, ejecuta en cmd: ipconfig
    // Busca "Adaptador de LAN inalámbrica Wi-Fi" -> "Dirección IPv4"
    return 'http://192.168.1.100:3000/api'; // CAMBIA ESTA IP
  }
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 15000, // Aumentamos el timeout
  HEADERS: {
    'Content-Type': 'application/json',
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
