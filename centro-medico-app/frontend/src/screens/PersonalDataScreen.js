// screens/PersonalDataScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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

const PersonalDataScreen = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'El email es requerido');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'El formato del email no es válido');
      return;
    }

    try {
      setLoading(true);
      const result = await updateProfile(formData);
      
      if (result.success) {
        Alert.alert('Éxito', 'Datos personales actualizados correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.message || 'No se pudieron actualizar los datos');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Error al actualizar los datos personales');
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
          Datos Personales
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form */}
      <View style={[styles.form, { backgroundColor: theme.surface }]}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Nombre Completo *
          </Text>
          <FreeTextInput
            value={formData.nombre}
            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            placeholder="Ingresa tu nombre completo"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Correo Electrónico *
          </Text>
          <FreeTextInput
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Ingresa tu correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text.primary }]}>
            Rol
          </Text>
          <View style={[styles.roleContainer, { backgroundColor: theme.gray[100] }]}>
            <Text style={[styles.roleText, { color: theme.text.secondary }]}>
              {user?.rol === 'admin' ? 'Administrador' : 
               user?.rol === 'coordinador' ? 'Coordinador' : 'Asistente'}
            </Text>
            <Ionicons name="lock-closed" size={16} color={theme.text.secondary} />
          </View>
          <Text style={[styles.roleNote, { color: theme.text.secondary }]}>
            El rol no puede ser modificado
          </Text>
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
              <Ionicons name="checkmark" size={20} color={theme.white} />
              <Text style={[styles.saveButtonText, { color: theme.white }]}>
                Guardar Cambios
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={[styles.infoContainer, { backgroundColor: theme.surface }]}>
        <Ionicons name="information-circle" size={20} color={theme.info} />
        <Text style={[styles.infoText, { color: theme.text.secondary }]}>
          Los cambios se aplicarán inmediatamente y se sincronizarán con el servidor.
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
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: Theme.borderRadius.md,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  roleNote: {
    fontSize: 14,
    fontStyle: 'italic',
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    margin: 20,
    padding: 16,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default PersonalDataScreen;
