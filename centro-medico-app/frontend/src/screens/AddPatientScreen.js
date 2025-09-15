// screens/AddPatientScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import SimpleTextInput from '../components/SimpleTextInput';
import CustomDateTimePicker from '../components/DateTimePicker';
import { Ionicons } from '@expo/vector-icons';
import { patientService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';
import { ValidationRules, validateForm, cleanText, formatName } from '../utils/validations';

const AddPatientScreen = ({ navigation, route }) => {
  const { patientId } = route.params || {};
  const isEditing = !!patientId;

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: null,
    edad: '',
    telefono: '',
    direccion: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    historial_medico: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadPatient();
    }
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const response = await patientService.getPatient(patientId);
      if (response.success) {
        const patient = response.data.paciente;
        setFormData({
          nombre: patient.nombre || '',
          apellido: patient.apellido || '',
          fecha_nacimiento: patient.fecha_nacimiento ? new Date(patient.fecha_nacimiento) : null,
          edad: patient.edad?.toString() || '',
          telefono: patient.telefono || '',
          direccion: patient.direccion || '',
          contacto_emergencia: patient.contacto_emergencia || '',
          telefono_emergencia: patient.telefono_emergencia || '',
          historial_medico: patient.historial_medico || '',
        });
      }
    } catch (error) {
      console.error('Error loading patient:', error);
      Alert.alert('Error', 'No se pudo cargar la información del paciente');
    } finally {
      setLoading(false);
    }
  };

  const validateFormData = () => {
    const rules = {
      nombre: ValidationRules.name,
      apellido: ValidationRules.name,
      telefono: ValidationRules.phone,
      telefono_emergencia: ValidationRules.phone,
      edad: ValidationRules.age,
      direccion: ValidationRules.address,
      historial_medico: ValidationRules.medicalHistory,
    };

    return validateForm(formData, rules);
  };

  const handleSave = async () => {
    const validation = validateFormData();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);

      const patientData = {
        ...formData,
        nombre: formatName(cleanText(formData.nombre)),
        apellido: formatName(cleanText(formData.apellido)),
        telefono: formData.telefono ? formData.telefono.replace(/\D/g, '') : null,
        telefono_emergencia: formData.telefono_emergencia ? formData.telefono_emergencia.replace(/\D/g, '') : null,
        edad: formData.edad ? parseInt(formData.edad) : null,
        direccion: cleanText(formData.direccion),
        historial_medico: cleanText(formData.historial_medico),
        fecha_nacimiento: formData.fecha_nacimiento ? formData.fecha_nacimiento.toISOString().split('T')[0] : null,
      };

      let response;
      if (isEditing) {
        response = await patientService.updatePatient(patientId, patientData);
      } else {
        response = await patientService.createPatient(patientData);
      }

      if (response.success) {
        if (isEditing) {
          Alert.alert(
            'Éxito',
            'Paciente actualizado correctamente',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        } else {
          // Limpiar campos después de crear exitosamente
        setFormData({
          nombre: '',
          apellido: '',
          fecha_nacimiento: null,
          edad: '',
          telefono: '',
          direccion: '',
          contacto_emergencia: '',
          telefono_emergencia: '',
          historial_medico: '',
        });
          setErrors({});
          
          Alert.alert(
            'Éxito',
            'Paciente creado correctamente',
            [
              {
                text: 'Crear otro',
                onPress: () => {}, // No hacer nada, quedarse en la pantalla
              },
              {
                text: 'Ver lista',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } else {
        Alert.alert('Error', response.message || 'Error al guardar el paciente');
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      Alert.alert('Error', 'No se pudo guardar el paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
          </Text>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Información Personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <SimpleTextInput
                  label="Nombre *"
                  placeholder="Nombre del paciente"
                  value={formData.nombre}
                  onChangeText={(value) => handleInputChange('nombre', value)}
                  error={errors.nombre}
                />
              </View>
              <View style={styles.halfWidth}>
                <SimpleTextInput
                  label="Apellido *"
                  placeholder="Apellido del paciente"
                  value={formData.apellido}
                  onChangeText={(value) => handleInputChange('apellido', value)}
                  error={errors.apellido}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <SimpleTextInput
                  label="Fecha de Nacimiento"
                  placeholder="YYYY-MM-DD"
                  value={formData.fecha_nacimiento ? formData.fecha_nacimiento.toISOString().split('T')[0] : ''}
                  onChangeText={(value) => {
                    if (value) {
                      handleInputChange('fecha_nacimiento', new Date(value));
                    } else {
                      handleInputChange('fecha_nacimiento', null);
                    }
                  }}
                  error={errors.fecha_nacimiento}
                />
              </View>
              <View style={styles.halfWidth}>
                <SimpleTextInput
                  label="Edad"
                  placeholder="Edad en años"
                  keyboardType="numeric"
                  value={formData.edad}
                  onChangeText={(value) => handleInputChange('edad', value)}
                  error={errors.edad}
                />
              </View>
            </View>

            <SimpleTextInput
              label="Teléfono"
              placeholder="Número de teléfono"
              keyboardType="phone-pad"
              value={formData.telefono}
              onChangeText={(value) => handleInputChange('telefono', value)}
              error={errors.telefono}
            />

            <SimpleTextInput
              label="Dirección"
              placeholder="Dirección completa"
              multiline
              value={formData.direccion}
              onChangeText={(value) => handleInputChange('direccion', value)}
              error={errors.direccion}
            />
          </View>

          {/* Contacto de Emergencia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contacto de Emergencia</Text>
            
            <SimpleTextInput
              label="Nombre del Contacto"
              placeholder="Nombre del contacto de emergencia"
              value={formData.contacto_emergencia}
              onChangeText={(value) => handleInputChange('contacto_emergencia', value)}
            />

            <SimpleTextInput
              label="Teléfono de Emergencia"
              placeholder="Teléfono del contacto de emergencia"
              keyboardType="phone-pad"
              value={formData.telefono_emergencia}
              onChangeText={(value) => handleInputChange('telefono_emergencia', value)}
              error={errors.telefono_emergencia}
            />
          </View>

          {/* Historial Médico */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial Médico</Text>
            
            <SimpleTextInput
              label="Historial Médico"
              placeholder="Información médica relevante, alergias, medicamentos, etc."
              multiline
              value={formData.historial_medico}
              onChangeText={(value) => handleInputChange('historial_medico', value)}
              error={errors.historial_medico}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    ...Theme.shadows.sm,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
});

export default AddPatientScreen;