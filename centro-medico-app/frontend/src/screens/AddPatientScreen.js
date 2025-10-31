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
  Modal,
} from 'react-native';
import FreeTextInput from '../components/FreeTextInput';
import SimpleDatePicker from '../components/SimpleDatePicker';
import { Ionicons } from '@expo/vector-icons';
import { patientService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';
import { ValidationRules, validateForm, cleanText, formatName, dateToLocalString } from '../utils/validations';

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
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

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
      contacto_emergencia: ValidationRules.name,
      // Solo validar edad si no se calculó automáticamente
      ...(formData.fecha_nacimiento ? {} : { edad: ValidationRules.age }),
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

    // MOSTRAR ALERTA EN CENTRO DE PANTALLA
    setShowSuccessAlert(true);

    // Limpiar campos INMEDIATAMENTE
    if (!isEditing) {
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
    }

    setLoading(true);

    try {
      const patientData = {
        ...formData,
        nombre: formatName(cleanText(formData.nombre)),
        apellido: formatName(cleanText(formData.apellido)),
        telefono: formData.telefono ? formData.telefono.replace(/\D/g, '') : null,
        telefono_emergencia: formData.telefono_emergencia ? formData.telefono_emergencia.replace(/\D/g, '') : null,
        edad: formData.edad ? parseInt(formData.edad) : null,
        direccion: cleanText(formData.direccion),
        historial_medico: cleanText(formData.historial_medico),
        fecha_nacimiento: formData.fecha_nacimiento ? dateToLocalString(formData.fecha_nacimiento) : null,
      };

      if (isEditing) {
        await patientService.updatePatient(patientId, patientData);
      } else {
        await patientService.createPatient(patientData);
      }
    } catch (error) {
      console.error('Error saving patient:', error);
    }

    setLoading(false);
  };

  // Función para calcular la edad basada en la fecha de nacimiento
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Si aún no ha cumplido años este año, restar 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 0 ? age.toString() : '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Si se cambia la fecha de nacimiento, calcular automáticamente la edad
    if (field === 'fecha_nacimiento' && value) {
      const calculatedAge = calculateAge(value);
      setFormData(prev => ({ 
        ...prev, 
        [field]: value, 
        edad: calculatedAge 
      }));
    }
    
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
                <FreeTextInput
                  label="Nombre *"
                  placeholder="Nombre del paciente"
                  value={formData.nombre}
                  onChangeText={(value) => handleInputChange('nombre', value)}
                  error={errors.nombre}
                />
              </View>
              <View style={styles.halfWidth}>
                <FreeTextInput
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
                <SimpleDatePicker
                  label="Fecha de Nacimiento"
                  placeholder="Seleccionar fecha"
                  value={formData.fecha_nacimiento}
                  onChange={(date) => handleInputChange('fecha_nacimiento', date)}
                  error={errors.fecha_nacimiento}
                />
              </View>
              <View style={styles.halfWidth}>
                <View style={styles.ageContainer}>
                  <FreeTextInput
                    label="Edad"
                    placeholder={formData.fecha_nacimiento ? "Se calcula automáticamente" : "Edad en años"}
                    keyboardType="numeric"
                    value={formData.edad}
                    onChangeText={(value) => handleInputChange('edad', value)}
                    error={errors.edad}
                    editable={!formData.fecha_nacimiento}
                    style={formData.fecha_nacimiento ? styles.autoCalculatedField : null}
                  />
                  {formData.fecha_nacimiento && (
                    <TouchableOpacity
                      style={styles.clearDateButton}
                      onPress={() => {
                        setFormData(prev => ({ 
                          ...prev, 
                          fecha_nacimiento: null, 
                          edad: '' 
                        }));
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color={Colors.gray[500]} />
                    </TouchableOpacity>
                  )}
                </View>
                {formData.fecha_nacimiento && (
                  <Text style={styles.autoCalculatedText}>
                    Calculado automáticamente - Toca la X para editar manualmente
                  </Text>
                )}
              </View>
            </View>

            <FreeTextInput
              label="Teléfono"
              placeholder="Número de teléfono"
              keyboardType="phone-pad"
              value={formData.telefono}
              onChangeText={(value) => handleInputChange('telefono', value)}
              error={errors.telefono}
            />

            <FreeTextInput
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
            
            <FreeTextInput
              label="Nombre del Contacto"
              placeholder="Nombre del contacto de emergencia"
              value={formData.contacto_emergencia}
              onChangeText={(value) => handleInputChange('contacto_emergencia', value)}
              error={errors.contacto_emergencia}
            />

            <FreeTextInput
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
            
            <FreeTextInput
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

      {/* Modal de Éxito en Centro de Pantalla */}
      <Modal
        visible={showSuccessAlert}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successModalTitle}>Guardado Exitosamente</Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={() => {
                setShowSuccessAlert(false);
                if (isEditing) {
                  navigation.goBack();
                }
              }}
            >
              <Text style={styles.successModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  autoCalculatedField: {
    backgroundColor: Colors.gray[100],
    opacity: 0.8,
  },
  autoCalculatedText: {
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 4,
    fontStyle: 'italic',
  },
  ageContainer: {
    position: 'relative',
  },
  clearDateButton: {
    position: 'absolute',
    right: 10,
    top: 30,
    zIndex: 1,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    minWidth: 250,
    ...Theme.shadows.lg,
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
    marginBottom: 20,
    textAlign: 'center',
  },
  successModalButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  successModalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddPatientScreen;