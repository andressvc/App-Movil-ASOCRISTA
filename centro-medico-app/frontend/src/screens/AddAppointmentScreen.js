// screens/AddAppointmentScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  FlatList,
  TextInput,
} from 'react-native';
import SimpleTextInput from '../components/SimpleTextInput';
import CustomDateTimePicker from '../components/DateTimePicker';
import { Ionicons } from '@expo/vector-icons';
import { appointmentService, patientService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';
import { ValidationRules, validateForm, cleanText, formatName } from '../utils/validations';

const AddAppointmentScreen = ({ navigation, route }) => {
  const { appointmentId } = route.params || {};
  const isEditing = !!appointmentId;


  const [formData, setFormData] = useState({
    paciente_id: '',
    tipo: 'terapia_individual',
    titulo: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    hora_fin: '',
    notas: '',
  });

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const appointmentTypes = [
    { value: 'terapia_individual', label: 'Terapia Individual' },
    { value: 'terapia_grupal', label: 'Terapia Grupal' },
    { value: 'evento_especial', label: 'Evento Especial' },
    { value: 'consulta', label: 'Consulta' },
  ];

  useEffect(() => {
    loadPatients();
    if (isEditing) {
      loadAppointment();
    }
  }, []);

  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients({ limit: 100 });
      if (response.success) {
        setPatients(response.data.pacientes);
        setFilteredPatients(response.data.pacientes);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadAppointment = async () => {
    try {
      const response = await appointmentService.getAppointment(appointmentId);
      if (response.success) {
        const appointment = response.data.cita;
        setFormData({
          paciente_id: appointment.paciente_id,
          tipo: appointment.tipo,
          titulo: appointment.titulo,
          descripcion: appointment.descripcion || '',
          fecha: appointment.fecha,
          hora_inicio: appointment.hora_inicio,
          hora_fin: appointment.hora_fin,
          notas: appointment.notas || '',
        });
        setSelectedPatient(appointment.paciente);
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la cita');
    }
  };

  const handlePatientSearch = (query) => {
    setPatientSearch(query);
    if (query.trim().length === 0) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        `${patient.nombre} ${patient.apellido}`.toLowerCase().includes(query.toLowerCase()) ||
        patient.codigo.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({ ...prev, paciente_id: patient.id }));
    setShowPatientModal(false);
    setPatientSearch('');
  };

  const validateFormData = () => {
    const rules = {
      paciente_id: (value) => !value ? 'Debe seleccionar un paciente' : null,
      titulo: ValidationRules.title,
      descripcion: ValidationRules.description,
      fecha: ValidationRules.futureDate,
      hora_inicio: ValidationRules.time,
      hora_fin: (value) => {
        const timeError = ValidationRules.time(value);
        if (timeError) return timeError;
        
        if (formData.hora_inicio && value) {
          const startTime = new Date(`2000-01-01T${formData.hora_inicio}`);
          const endTime = new Date(`2000-01-01T${value}`);
          if (endTime <= startTime) {
            return 'La hora de fin debe ser posterior a la hora de inicio';
          }
        }
        return null;
      },
      notas: ValidationRules.notes,
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
      
      const appointmentData = {
        ...formData,
        titulo: cleanText(formData.titulo),
        descripcion: cleanText(formData.descripcion),
        notas: cleanText(formData.notas),
      };

      let response;
      if (isEditing) {
        response = await appointmentService.updateAppointment(appointmentId, appointmentData);
      } else {
        response = await appointmentService.createAppointment(appointmentData);
      }

      if (response.success) {
        Alert.alert(
          'Éxito',
          isEditing ? 'Cita actualizada correctamente' : 'Cita creada correctamente',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', response.message || 'Error al guardar la cita');
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      Alert.alert('Error', 'No se pudo guardar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const InputField = ({ label, field, placeholder, keyboardType = 'default', multiline = false, required = false, options = null }) => {
    const handleFieldChange = (value) => {
      handleInputChange(field, value);
    };

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        
        {options ? (
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  formData[field] === option.value && styles.optionButtonSelected
                ]}
                onPress={() => handleInputChange(option.value)}
              >
                <Text style={[
                  styles.optionText,
                  formData[field] === option.value && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <SimpleTextInput
            placeholder={placeholder}
            value={formData[field]}
            onChangeText={handleFieldChange}
            keyboardType={keyboardType}
            multiline={multiline}
            editable={!loading}
            error={errors[field]}
            returnKeyType={multiline ? 'default' : 'next'}
          />
        )}
        
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  const renderPatient = ({ item }) => (
    <TouchableOpacity
      style={styles.patientItem}
      onPress={() => selectPatient(item)}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>
          {item.nombre} {item.apellido}
        </Text>
        <Text style={styles.patientCode}>Código: {item.codigo}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
    </TouchableOpacity>
  );

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
            {isEditing ? 'Editar Cita' : 'Nueva Cita'}
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
          {/* Selección de Paciente */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Paciente <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.patientSelector, errors.paciente_id && styles.inputError]}
              onPress={() => setShowPatientModal(true)}
            >
              <Text style={[
                styles.patientSelectorText,
                !selectedPatient && styles.placeholderText
              ]}>
                {selectedPatient 
                  ? `${selectedPatient.nombre} ${selectedPatient.apellido} (${selectedPatient.codigo})`
                  : 'Seleccionar paciente'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.gray[500]} />
            </TouchableOpacity>
            {errors.paciente_id && <Text style={styles.errorText}>{errors.paciente_id}</Text>}
          </View>

          {/* Tipo de Cita */}
          <InputField
            label="Tipo de Cita"
            field="tipo"
            required
            options={appointmentTypes}
          />

          {/* Título */}
          <InputField
            label="Título"
            field="titulo"
            placeholder="Título de la cita"
            required
          />

          {/* Descripción */}
          <InputField
            label="Descripción"
            field="descripcion"
            placeholder="Descripción de la cita"
            multiline
            required
          />

          {/* Fecha y Hora */}
          <View style={styles.dateTimeContainer}>
            <CustomDateTimePicker
              label="Fecha y Hora de Inicio"
              value={formData.fecha && formData.hora_inicio ? 
                new Date(`${formData.fecha}T${formData.hora_inicio}`) : null}
              onChange={(date) => {
                const dateStr = date.toISOString().split('T')[0];
                const timeStr = date.toTimeString().split(' ')[0].substring(0, 5);
                setFormData(prev => ({
                  ...prev,
                  fecha: dateStr,
                  hora_inicio: timeStr
                }));
              }}
              error={errors.fecha || errors.hora_inicio}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <InputField
                label="Hora Fin"
                field="hora_fin"
                placeholder="HH:MM"
                keyboardType="default"
                required
              />
            </View>
            <View style={styles.halfWidth}>
              {/* Espacio vacío para mantener el layout */}
            </View>
          </View>

          {/* Notas */}
          <InputField
            label="Notas"
            field="notas"
            placeholder="Notas adicionales (opcional)"
            multiline
          />
        </View>
      </ScrollView>

      {/* Modal de Selección de Paciente */}
      <Modal
        visible={showPatientModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPatientModal(false)}
            >
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Seleccionar Paciente</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={Colors.gray[500]} />
              <SimpleTextInput
                placeholder="Buscar paciente..."
                value={patientSearch}
                onChangeText={handlePatientSearch}
                style={styles.searchInput}
              />
            </View>
          </View>

          <FlatList
            data={filteredPatients}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPatient}
            style={styles.patientsList}
            showsVerticalScrollIndicator={false}
          />
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.white,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  dateTimeContainer: {
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  optionTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  patientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  patientSelectorText: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: Colors.gray[400],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalPlaceholder: {
    width: 40,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  patientsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  patientCode: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});

export default AddAppointmentScreen;
