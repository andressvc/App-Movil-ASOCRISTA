// screens/AddFinancialScreen.js
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
import { financialService, patientService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';
import { ValidationRules, validateForm, cleanText, formatAmount } from '../utils/validations';

const AddFinancialScreen = ({ navigation, route }) => {
  const { movementId } = route.params || {};
  const isEditing = !!movementId;


  const [formData, setFormData] = useState({
    tipo: 'ingreso',
    categoria: '',
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    paciente_id: '',
    metodo_pago: 'efectivo',
    comprobante: '',
  });

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
      'Consulta médica',
      'Terapia individual',
      'Terapia grupal',
      'Evento especial',
      'Otros ingresos',
    ],
    egreso: [
      'Suministros médicos',
      'Equipamiento',
      'Servicios generales',
      'Mantenimiento',
      'Otros gastos',
    ],
  };

  useEffect(() => {
    loadPatients();
    if (isEditing) {
      loadMovement();
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

  const loadMovement = async () => {
    try {
      const response = await financialService.getMovement(movementId);
      if (response.success) {
        const movement = response.data;
        setFormData({
          tipo: movement.tipo,
          categoria: movement.categoria,
          descripcion: movement.descripcion,
          monto: movement.monto.toString(),
          fecha: movement.fecha,
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
      tipo: (value) => !value ? 'Debe seleccionar un tipo' : null,
      categoria: (value) => !value ? 'La categoría es requerida' : null,
      descripcion: ValidationRules.description,
      monto: ValidationRules.amount,
      fecha: ValidationRules.date,
      metodo_pago: (value) => !value ? 'El método de pago es requerido' : null,
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
      
      const movementData = {
        ...formData,
        descripcion: cleanText(formData.descripcion),
        monto: parseFloat(formData.monto),
        comprobante: cleanText(formData.comprobante),
        paciente_id: formData.paciente_id || null,
      };

      let response;
      if (isEditing) {
        response = await financialService.updateMovement(movementId, movementData);
      } else {
        response = await financialService.createMovement(movementData);
      }

      if (response.success) {
        Alert.alert(
          'Éxito',
          isEditing ? 'Movimiento actualizado correctamente' : 'Movimiento creado correctamente',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', response.message || 'Error al guardar el movimiento');
      }
    } catch (error) {
      console.error('Error saving movement:', error);
      Alert.alert('Error', 'No se pudo guardar el movimiento');
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
          <InputField
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
          <InputField
            label="Descripción"
            field="descripcion"
            placeholder="Descripción del movimiento"
            multiline
            required
          />

          {/* Monto y Fecha */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <InputField
                label="Monto"
                field="monto"
                placeholder="0.00"
                keyboardType="numeric"
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <InputField
                label="Fecha"
                field="fecha"
                placeholder="YYYY-MM-DD"
                keyboardType="default"
                required
              />
            </View>
          </View>

          {/* Selección de Paciente */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Paciente (Opcional)</Text>
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
                  : 'Seleccionar paciente (opcional)'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>

          {/* Método de Pago */}
          <InputField
            label="Método de Pago"
            field="metodo_pago"
            required
            options={paymentMethods}
          />

          {/* Comprobante */}
          <InputField
            label="Comprobante (Opcional)"
            field="comprobante"
            placeholder="Número de comprobante o referencia"
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

export default AddFinancialScreen;
