// screens/AddFinancialScreen.js
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
} from 'react-native';
import FreeTextInput from '../components/FreeTextInput';
import CustomDateTimePicker from '../components/DateTimePicker';
import { Ionicons } from '@expo/vector-icons';
import { financialService, patientService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';
import { ValidationRules, validateForm, cleanText, formatAmount } from '../utils/validations';

const AddFinancialScreen = ({ navigation, route }) => {
  const { movementId } = route.params || {};
  const isEditing = !!movementId;

  // Función para obtener la fecha actual en formato DD/MM/YYYY (local)
  const getCurrentDateFormatted = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Función para formatear fecha a DD/MM/YYYY (visual)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Función para convertir DD/MM/YYYY a YYYY-MM-DD (para backend)
  const formatDateForBackend = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  // Estado inicial del formulario
  const initialFormState = {
    tipo: 'ingreso',
    categoria: '',
    descripcion: '',
    monto: '',
    fecha: getCurrentDateFormatted(),
    paciente_id: '',
    metodo_pago: 'efectivo',
    comprobante: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const movementTypes = [
    { value: 'ingreso', label: 'Ingreso', color: Colors.success },
    { value: 'egreso', label: 'Egreso', color: Colors.error },
  ];

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'cheque', label: 'Cheque' },
  ];

  const categories = {
    ingreso: [
      'Transporte',
      'Consumo en Tienda',
      'Cuota Mensual',
    ],
    egreso: [
      'Gastos del centro',
    ],
  };

  useEffect(() => {
    loadPatients().then(async () => {
      const { patientId } = route.params || {};
      if (patientId) {
        try {
          const resp = await patientService.getPatient(patientId);
          if (resp.success) {
            const p = resp.data.paciente;
            setSelectedPatient(p);
            setFormData(prev => ({ ...prev, paciente_id: p.id }));
          }
        } catch (e) {}
      }
    });
    if (isEditing) {
      loadMovement();
    }
  }, []);

  // Actualizar fecha en tiempo real cada día
  useEffect(() => {
    const updateDate = () => {
      if (!isEditing) {
        setFormData(prev => ({
          ...prev,
          fecha: getCurrentDateFormatted()
        }));
      }
    };

    // Actualizar inmediatamente
    updateDate();

    // Calcular tiempo hasta el próximo cambio de día
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    // Configurar timeout para la próxima medianoche
    const timeout = setTimeout(() => {
      updateDate();
      // Después de la medianoche, actualizar cada 24 horas
      const interval = setInterval(updateDate, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, timeUntilMidnight);

    return () => clearTimeout(timeout);
  }, [isEditing]);

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

  const loadMovement = async () => {
    try {
      setLoading(true);
      const response = await financialService.getMovement(movementId);
      if (response.success) {
        const movement = response.data;
        setFormData({
          tipo: movement.tipo,
          categoria: movement.categoria,
          descripcion: movement.descripcion,
          monto: movement.monto.toString(),
          fecha: formatDateForDisplay(movement.fecha),
          paciente_id: movement.paciente_id || '',
          metodo_pago: movement.metodo_pago || 'efectivo',
          comprobante: movement.comprobante || '',
        });
        if (movement.paciente) {
          setSelectedPatient(movement.paciente);
        }
      }
    } catch (error) {
      console.error('Error loading movement:', error);
      Alert.alert('Error', 'No se pudo cargar la información del movimiento');
    } finally {
      setLoading(false);
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

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Si cambia el tipo de movimiento, resetear la categoría
      if (field === 'tipo') {
        newData.categoria = '';
      }
      
      return newData;
    });
    
    // Limpiar error del campo cuando el usuario haga una selección
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTextChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateFormData = () => {
    const rules = {
      tipo: (value) => !value ? 'Debe seleccionar un tipo' : null,
      categoria: (value) => !value ? 'La categoría es requerida' : null,
      descripcion: ValidationRules.description,
      monto: ValidationRules.amount,
      fecha: (value) => {
        if (!value) return 'La fecha es requerida';
        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(value)) return 'La fecha debe estar en formato DD/MM/YYYY';
        return null;
      },
      paciente_id: (value) => !value ? 'El paciente es requerido' : null,
      metodo_pago: (value) => !value ? 'El método de pago es requerido' : null,
    };

    return validateForm(formData, rules);
  };

  const handleSave = async () => {
    // Validación simple
    if (!formData.categoria || !formData.descripcion || !formData.monto) {
      Alert.alert('Error', 'Completa todos los campos requeridos');
      return;
    }

    if (!formData.paciente_id) {
      Alert.alert('Error', 'Debes seleccionar un paciente');
      return;
    }

    setLoading(true);

    try {
      const movementData = {
        ...formData,
        monto: parseFloat(formData.monto) || 0,
        fecha: formatDateForBackend(formData.fecha),
        paciente_id: formData.paciente_id || null,
      };

      let response;
      if (isEditing) {
        response = await financialService.updateMovement(movementId, movementData);
      } else {
        response = await financialService.createMovement(movementData);
      }

      // Verificar si la respuesta fue exitosa
      if (response.success) {
        // MOSTRAR ALERTA DESPUÉS DE GUARDAR EXITOSAMENTE
        setShowSuccessAlert(true);

        // Limpiar campos DESPUÉS de guardar exitosamente si no es edición
        if (!isEditing) {
          setTimeout(() => {
            setFormData({
              tipo: 'ingreso',
              categoria: '',
              descripcion: '',
              monto: '',
              fecha: getCurrentDateFormatted(),
              paciente_id: '',
              metodo_pago: 'efectivo',
              comprobante: '',
            });
            setSelectedPatient(null);
            setErrors({});
          }, 500);
        }
      } else {
        Alert.alert('Error', response.message || 'No se pudo guardar el movimiento');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'No se pudo guardar el movimiento';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Componente simple para campos de texto (igual que en AddPatientScreen)
  const TextField = ({ label, field, placeholder, keyboardType = 'default', multiline = false, required = false }) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <FreeTextInput
          placeholder={placeholder}
          value={formData[field]}
          onChangeText={(value) => handleTextChange(field, value)}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={!loading}
          error={errors[field]}
          returnKeyType={multiline ? 'default' : 'next'}
        />
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  // Componente simple para campos de selección
  const SelectField = ({ label, field, options, required = false }) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData[field] === option.value && styles.optionButtonSelected
              ]}
              onPress={() => handleInputChange(field, option.value)}
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
            {isEditing ? 'Editar Movimiento' : 'Nuevo Movimiento'}
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
          {/* Tipo de Movimiento */}
          <SelectField
            label="Tipo de Movimiento"
            field="tipo"
            required
            options={movementTypes}
          />

          {/* Categoría */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Categoría <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.optionsContainer}>
              {categories[formData.tipo]?.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.optionButton,
                    formData.categoria === category && styles.optionButtonSelected
                  ]}
                  onPress={() => handleInputChange('categoria', category)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.categoria === category && styles.optionTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
          </View>

          {/* Descripción */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Descripción <Text style={styles.required}>*</Text>
            </Text>
            <FreeTextInput
              placeholder="Descripción del movimiento"
              value={formData.descripcion}
              onChangeText={(value) => handleTextChange('descripcion', value)}
              multiline
              editable={!loading}
              error={errors.descripcion}
            />
            {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}
          </View>

          {/* Monto y Fecha */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Monto <Text style={styles.required}>*</Text>
                </Text>
                <FreeTextInput
                  placeholder="0.00"
                  value={formData.monto}
                  onChangeText={(value) => handleTextChange('monto', value)}
                  keyboardType="numeric"
                  editable={!loading}
                  error={errors.monto}
                />
                {errors.monto && <Text style={styles.errorText}>{errors.monto}</Text>}
              </View>
            </View>
            <View style={styles.halfWidth}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Fecha <Text style={styles.required}>*</Text>
                </Text>
                <FreeTextInput
                  placeholder="DD/MM/YYYY"
                  value={formData.fecha}
                  onChangeText={(value) => handleTextChange('fecha', value)}
                  keyboardType="default"
                  editable={!loading}
                  error={errors.fecha}
                />
                {errors.fecha && <Text style={styles.errorText}>{errors.fecha}</Text>}
              </View>
            </View>
          </View>

          {/* Selección de Paciente */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Paciente <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.patientSelector}
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
          </View>

          {/* Método de Pago */}
          <SelectField
            label="Método de Pago"
            field="metodo_pago"
            required
            options={paymentMethods}
          />

          {/* Comprobante */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Comprobante (Opcional)</Text>
            <FreeTextInput
              placeholder="Número de comprobante o referencia"
              value={formData.comprobante}
              onChangeText={(value) => handleTextChange('comprobante', value)}
              keyboardType="default"
              editable={!loading}
              error={errors.comprobante}
            />
            {errors.comprobante && <Text style={styles.errorText}>{errors.comprobante}</Text>}
          </View>
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
              <FreeTextInput
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
              onPress={() => setShowSuccessAlert(false)}
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

export default AddFinancialScreen;
