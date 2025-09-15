// components/BiometricAuth.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../contexts/ThemeContext';

const BiometricAuth = ({ 
  visible, 
  onSuccess, 
  onCancel, 
  title = "Autenticación Biométrica",
  subtitle = "Usa tu huella dactilar o Face ID para continuar"
}) => {
  const { theme } = useTheme();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setIsAvailable(compatible && enrolled);
      setBiometricType(types[0]);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  };

  const authenticate = async () => {
    if (!isAvailable) {
      Alert.alert('Error', 'La autenticación biométrica no está disponible');
      return;
    }

    try {
      setIsAuthenticating(true);
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: title,
        subPromptMessage: subtitle,
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
        disableDeviceFallback: false,
      });

      if (result.success) {
        onSuccess();
      } else {
        onCancel();
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Error en la autenticación biométrica');
      onCancel();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'finger-print-outline';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'scan-outline';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'eye-outline';
      default:
        return 'shield-checkmark-outline';
    }
  };

  const getBiometricName = () => {
    switch (biometricType) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'Huella Dactilar';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'Face ID';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Reconocimiento de Iris';
      default:
        return 'Biometría';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getBiometricIcon()} 
              size={64} 
              color={theme.primary} 
            />
          </View>
          
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {title}
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            {subtitle}
          </Text>

          {isAuthenticating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
                Autenticando...
              </Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.authButton, { backgroundColor: theme.primary }]}
                onPress={authenticate}
                disabled={!isAvailable}
              >
                <Ionicons name={getBiometricIcon()} size={24} color={theme.white} />
                <Text style={[styles.authButtonText, { color: theme.white }]}>
                  Usar {getBiometricName()}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={onCancel}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text.primary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!isAvailable && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning-outline" size={20} color={theme.warning} />
              <Text style={[styles.warningText, { color: theme.warning }]}>
                La autenticación biométrica no está configurada en este dispositivo
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});

export default BiometricAuth;
