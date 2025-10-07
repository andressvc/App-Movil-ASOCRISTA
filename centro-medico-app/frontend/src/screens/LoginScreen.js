// screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Theme } from '../constants/Colors';
import { VALIDATION_RULES } from '../constants/Config';
import { Images } from '../constants/Images';

const LoginScreen = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showBiometricOption, setShowBiometricOption] = useState(false);
  const [biometricType, setBiometricType] = useState('biométrico');
  const [resetEmail, setResetEmail] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  // Limpiar errores cuando cambien los campos
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData]);

  // Verificar disponibilidad de autenticación biométrica
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const isAvailable = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const hasFace = types?.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
        const hasFingerprint = types?.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
        setBiometricType(hasFace ? 'FaceID' : hasFingerprint ? 'Huella' : 'biométrico');
        setShowBiometricOption(isAvailable && isEnrolled);
      } catch (error) {
        console.error('Error verificando autenticación biométrica:', error);
        setShowBiometricOption(false);
      }
    };

    checkBiometricAvailability();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!VALIDATION_RULES.EMAIL.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      newErrors.password = `La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password, rememberMe);
    
    if (!result.success) {
      Alert.alert('Error', result.message || 'Error al iniciar sesión');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticación biométrica',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar contraseña',
      });

      if (result.success) {
        // Aquí podrías implementar lógica para usar credenciales guardadas
        // Por ahora, simplemente mostrar un mensaje
        Alert.alert(
          'Autenticación Biométrica',
          'Autenticación biométrica exitosa. Funcionalidad completa pendiente de implementar.',
          [{ text: 'OK' }]
        );
      } else {
        console.log('Autenticación biométrica cancelada o fallida');
      }
    } catch (error) {
      console.error('Error en autenticación biométrica:', error);
      Alert.alert('Error', 'Error en la autenticación biométrica');
    }
  };

  const handleForgotPassword = () => {
    setResetEmail(formData.email || '');
    setShowResetModal(true);
  };

  const submitPasswordReset = async () => {
    if (!resetEmail || !VALIDATION_RULES.EMAIL.test(resetEmail)) {
      Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido');
      return;
    }
    setShowResetModal(false);
    Alert.alert(
      'Solicitud enviada',
      'Si el correo existe en el sistema, recibirás instrucciones para restablecer tu contraseña.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image 
                  source={Images.asoLogo} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>ASOCRISTA</Text>
              <Text style={styles.subtitle}>Centro de Rehabilitación</Text>
              <Text style={styles.description}>
                Inicia sesión para acceder al sistema
              </Text>
            </View>

            {/* Formulario */}
            <View style={styles.form}>
              {/* Email */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="correo electrónico o usuario"
                    placeholderTextColor={Colors.gray[400]}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Contraseña */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="contraseña"
                    placeholderTextColor={Colors.gray[400]}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={Colors.gray[400]}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>¿olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              {/* Botón de login */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                )}
              </TouchableOpacity>

              {/* Botón de autenticación biométrica */}
              {showBiometricOption && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  disabled={isLoading}
                >
                  <Ionicons 
                    name={biometricType === 'FaceID' ? 'scan-outline' : 'finger-print-outline'} 
                    size={24} 
                    color={Colors.primary} 
                  />
                  <Text style={styles.biometricButtonText}>
                    Usar {biometricType}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Error general */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={20} color={Colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Reset Password Modal (simple) */}
      {showResetModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Restablecer contraseña</Text>
            <Text style={styles.modalSubtitle}>Ingresa tu correo electrónico para recibir instrucciones</Text>
            <View style={[styles.inputWrapper, { marginTop: Theme.spacing.md }]}> 
              <Ionicons name="mail-outline" size={20} color={Colors.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="tu-correo@ejemplo.com"
                placeholderTextColor={Colors.gray[400]}
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={{ flexDirection: 'row', marginTop: Theme.spacing.lg, gap: Theme.spacing.md }}>
              <TouchableOpacity style={[styles.loginButton, { backgroundColor: Colors.gray[200], flex: 1 }]} onPress={() => setShowResetModal(false)}>
                <Text style={[styles.loginButtonText, { color: Colors.text.primary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.loginButton, { flex: 1 }]} onPress={submitPasswordReset}>
                <Text style={styles.loginButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.lg,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Colors.text.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Theme.typography.title3,
    color: Colors.text.secondary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...Theme.typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: Theme.spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    ...Theme.shadows.sm,
  },
  inputIcon: {
    marginRight: Theme.spacing.md,
  },
  input: {
    flex: 1,
    ...Theme.typography.body,
    color: Colors.text.primary,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
  },
  eyeIcon: {
    padding: Theme.spacing.xs,
  },
  errorText: {
    color: Colors.error,
    ...Theme.typography.footnote,
    marginTop: Theme.spacing.xs,
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  forgotPasswordText: {
    ...Theme.typography.callout,
    color: Colors.gray[500],
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.md,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    ...Theme.typography.button,
    color: Colors.white,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '10',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Theme.shadows.sm,
  },
  biometricButtonText: {
    ...Theme.typography.button,
    color: Colors.primary,
    marginLeft: Theme.spacing.sm,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    width: '100%',
    maxWidth: 420,
    padding: Theme.spacing.xl,
  },
  modalTitle: {
    ...Theme.typography.title2,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...Theme.typography.callout,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
});

export default LoginScreen;
