// contexts/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import { STORAGE_KEYS } from '../constants/Config';

const AuthContext = createContext();

const initialState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar si hay un token guardado al iniciar la app
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('AuthContext: Verificando estado de autenticación...');
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      console.log('AuthContext: Token encontrado:', !!token);
      console.log('AuthContext: Datos de usuario encontrados:', !!userData);
      
      if (token && userData) {
        // Si hay token y datos de usuario, asumir que está autenticado
        // La verificación del token se hará en el interceptor de axios
        console.log('AuthContext: Usuario autenticado encontrado');
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token,
            user: JSON.parse(userData),
          },
        });
      } else {
        console.log('AuthContext: No hay datos de autenticación, usuario no autenticado');
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('AuthContext: Error checking auth state:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };


  const login = async (email, password, rememberMe = false) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        const { token, usuario } = response.data;
        
        // Guardar datos en AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(usuario));
        
        if (rememberMe) {
          await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        }
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token,
            user: usuario,
          },
        });
        
        return { success: true };
      } else {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: response.message || 'Error al iniciar sesión',
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error de conexión';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Iniciando logout...');
      
      // Limpiar AsyncStorage de forma individual para mayor seguridad
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      
      console.log('AuthContext: Datos eliminados de AsyncStorage');
      
      // Actualizar el estado de autenticación
      dispatch({ type: 'LOGOUT' });
      
      console.log('AuthContext: Logout completado exitosamente');
    } catch (error) {
      console.error('AuthContext: Error during logout:', error);
      // Aún así, forzar el logout en caso de error
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      return { success: false, message: errorMessage };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success) {
        // Actualizar el usuario en el estado local
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            ...state,
            user: { ...state.user, ...response.data.usuario },
          },
        });
        // Actualizar también en AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({ ...state.user, ...response.data.usuario }));
      }
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar perfil';
      return { success: false, message: errorMessage };
    }
  };


  const value = {
    ...state,
    login,
    logout,
    clearError,
    changePassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
