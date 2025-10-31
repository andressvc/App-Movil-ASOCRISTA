// screens/ChangePasswordScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors, Theme } from '../constants/Colors';
import FreeTextInput from '../components/FreeTextInput';

const ChangePasswordScreen = ({ navigation }) => {
  const { changePassword } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos un número';
    }
    return null;
  };

  const handleSave = async () => {
    // Validaciones
    if (!formData.currentPassword.trim()) {
      Alert.alert('Error', 'La contraseña actual es requerida');
      return;
    }

    if (!formData.newPassword.trim()) {
      Alert.alert('Error', 'La nueva contraseña es requerida');
      return;
    }

    if (!formData.confirmPassword.trim()) {
      Alert.alert('Error', 'Confirma tu nueva contraseña');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
      return;
    }

    // Validar fortaleza de la contraseña
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      Alert.alert('Error', passwordError);
      return;
    }

    try {
      setLoading(true);
      const result = await changePassword(formData.currentPassword, formData.newPassword);
      
      if (result.success) {
        Alert.alert('Éxito', 'Contraseña actualizada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.message || 'No se pudo cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Cambiar Contraseña
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form */}
      <View style={[styles.form, { backgroundColor: theme.surface }]}>
        {/* Contraseña Actual */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Contraseña Actual *
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.currentPassword}
              onChangeText={(text) => handleInputChange('currentPassword', text)}
              placeholder="Ingresa tu contraseña actual"
              placeholderTextColor={Colors.gray[400]}
              secureTextEntry={!showPasswords.current}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              textContentType="none"
              keyboardType="default"
              importantForAutofill="no"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => togglePasswordVisibility('current')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showPasswords.current ? "eye-off" : "eye"} 
                size={20} 
                color={theme.text.secondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nueva Contraseña */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Nueva Contraseña *
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.newPassword}
              onChangeText={(text) => handleInputChange('newPassword', text)}
              placeholder="Ingresa tu nueva contraseña"
              placeholderTextColor={Colors.gray[400]}
              secureTextEntry={!showPasswords.new}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              textContentType="none"
              keyboardType="default"
              importantForAutofill="no"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => togglePasswordVisibility('new')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showPasswords.new ? "eye-off" : "eye"} 
                size={20} 
                color={theme.text.secondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmar Nueva Contraseña */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Confirmar Nueva Contraseña *
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              placeholder="Confirma tu nueva contraseña"
              placeholderTextColor={Colors.gray[400]}
              secureTextEntry={!showPasswords.confirm}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              textContentType="none"
              keyboardType="default"
              importantForAutofill="no"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => togglePasswordVisibility('confirm')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showPasswords.confirm ? "eye-off" : "eye"} 
                size={20} 
                color={theme.text.secondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Password Requirements */}
      <View style={[styles.requirementsContainer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.requirementsTitle, { color: theme.text.primary }]}>
          Requisitos de la contraseña:
        </Text>
        <View style={styles.requirementsList}>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={formData.newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={formData.newPassword.length >= 6 ? theme.success : theme.text.secondary} 
            />
            <Text style={[
              styles.requirementText,
              { color: formData.newPassword.length >= 6 ? theme.success : theme.text.secondary }
            ]}>
              Al menos 6 caracteres
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={/(?=.*[a-z])/.test(formData.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={/(?=.*[a-z])/.test(formData.newPassword) ? theme.success : theme.text.secondary} 
            />
            <Text style={[
              styles.requirementText,
              { color: /(?=.*[a-z])/.test(formData.newPassword) ? theme.success : theme.text.secondary }
            ]}>
              Una letra minúscula
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={/(?=.*[A-Z])/.test(formData.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={/(?=.*[A-Z])/.test(formData.newPassword) ? theme.success : theme.text.secondary} 
            />
            <Text style={[
              styles.requirementText,
              { color: /(?=.*[A-Z])/.test(formData.newPassword) ? theme.success : theme.text.secondary }
            ]}>
              Una letra mayúscula
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={/(?=.*\d)/.test(formData.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={/(?=.*\d)/.test(formData.newPassword) ? theme.success : theme.text.secondary} 
            />
            <Text style={[
              styles.requirementText,
              { color: /(?=.*\d)/.test(formData.newPassword) ? theme.success : theme.text.secondary }
            ]}>
              Un número
            </Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.primary },
            loading && styles.disabledButton
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.white} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={20} color={theme.white} />
              <Text style={[styles.saveButtonText, { color: theme.white }]}>
                Cambiar Contraseña
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Security Info */}
      <View style={[styles.securityInfo, { backgroundColor: theme.surface }]}>
        <Ionicons name="shield-checkmark" size={20} color={theme.success} />
        <Text style={[styles.securityText, { color: theme.text.secondary }]}>
          Tu contraseña se encripta de forma segura y nunca se almacena en texto plano.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...Theme.shadows.sm,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  form: {
    margin: 20,
    padding: 20,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
    ...Theme.shadows.sm,
  },
  passwordInput: {
    flex: 1,
    ...Theme.typography.body,
    color: Colors.text.primary,
    padding: 0,
    margin: 0,
  },
  eyeButton: {
    padding: Theme.spacing.xs,
    marginLeft: Theme.spacing.xs,
  },
  requirementsContainer: {
    margin: 20,
    padding: 20,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementText: {
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.md,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 20,
    padding: 16,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  securityText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default ChangePasswordScreen;
