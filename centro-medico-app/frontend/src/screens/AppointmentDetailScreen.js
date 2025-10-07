// screens/AppointmentDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appointmentService, financialService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';

const AppointmentDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [appointment, setAppointment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadAppointmentData();
  }, [id]);

  const loadAppointmentData = async () => {
    try {
      setLoading(true);
      const [appointmentResponse, paymentsResponse] = await Promise.all([
        appointmentService.getAppointment(id),
        financialService.getMovements({ cita_id: id })
      ]);

      if (appointmentResponse.success) {
        setAppointment(appointmentResponse.data);
      }
      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data.movimientos || []);
      }
    } catch (error) {
      console.error('Error loading appointment data:', error);
      Alert.alert('Error', 'No se pudo cargar la información de la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus, notes = '') => {
    try {
      setUpdating(true);
      const response = await appointmentService.changeAppointmentStatus(id, newStatus, notes);
      if (response.success) {
        setAppointment(response.data);
        setShowStatusModal(false);
        Alert.alert('Éxito', 'Estado de la cita actualizado correctamente');
      } else {
        Alert.alert('Error', response.message || 'No se pudo actualizar el estado');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado de la cita');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddPayment = async (paymentData) => {
    try {
      setUpdating(true);
      const response = await financialService.createMovement({
        ...paymentData,
        cita_id: id,
        paciente_id: appointment.paciente_id,
        tipo: 'ingreso',
        categoria: 'consulta'
      });
      if (response.success) {
        setPayments(prev => [response.data, ...prev]);
        setShowPaymentModal(false);
        Alert.alert('Éxito', 'Pago registrado correctamente');
      } else {
        Alert.alert('Error', response.message || 'No se pudo registrar el pago');
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      Alert.alert('Error', 'No se pudo registrar el pago');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `Q ${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'completada': return Colors.success;
      case 'cancelada': return Colors.error;
      case 'en_proceso': return Colors.warning;
      case 'programada': return Colors.info;
      default: return Colors.gray[500];
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      case 'en_proceso': return 'En Proceso';
      case 'programada': return 'Programada';
      case 'no_asistio': return 'No Asistió';
      default: return estado;
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'completada': return 'checkmark-circle';
      case 'cancelada': return 'close-circle';
      case 'en_proceso': return 'time';
      case 'programada': return 'calendar';
      case 'no_asistio': return 'person-remove';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando información de la cita...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>No se pudo cargar la información de la cita</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAppointmentData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.monto), 0);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalle de la Cita</Text>
        <TouchableOpacity
          style={styles.statusButton}
          onPress={() => setShowStatusModal(true)}
        >
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Appointment Info */}
      <View style={styles.appointmentInfo}>
        <View style={styles.appointmentHeader}>
          <View style={styles.statusContainer}>
            <Ionicons 
              name={getStatusIcon(appointment.estado)} 
              size={32} 
              color={getStatusColor(appointment.estado)} 
            />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusText, { color: getStatusColor(appointment.estado) }]}>
                {getStatusText(appointment.estado)}
              </Text>
              <Text style={styles.statusDate}>
                {formatDate(appointment.fecha)} - {formatTime(appointment.hora_inicio)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.appointmentTitle}>{appointment.titulo}</Text>
        
        {appointment.descripcion && (
          <Text style={styles.appointmentDescription}>{appointment.descripcion}</Text>
        )}

        <View style={styles.timeInfo}>
          <View style={styles.timeItem}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.timeText}>
              {formatTime(appointment.hora_inicio)} - {formatTime(appointment.hora_fin)}
            </Text>
          </View>
          <View style={styles.timeItem}>
            <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            <Text style={styles.timeText}>{formatDate(appointment.fecha)}</Text>
          </View>
        </View>
      </View>

      {/* Patient Info */}
      {appointment.paciente && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Paciente</Text>
          <TouchableOpacity
            style={styles.patientCard}
            onPress={() => navigation.navigate('PatientDetail', { id: appointment.paciente_id })}
          >
            <View style={styles.patientHeader}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={24} color={Colors.white} />
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>
                  {appointment.paciente.nombre} {appointment.paciente.apellido}
                </Text>
                <Text style={styles.patientCode}>Código: {appointment.paciente.codigo}</Text>
                {appointment.paciente.telefono && (
                  <Text style={styles.patientPhone}>{appointment.paciente.telefono}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resumen de Pagos</Text>
          <TouchableOpacity
            style={styles.addPaymentButton}
            onPress={() => setShowPaymentModal(true)}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.addPaymentText}>Agregar Pago</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.paymentSummary}>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Total Pagado:</Text>
            <Text style={[styles.paymentValue, { color: Colors.success }]}>
              {formatCurrency(totalPaid)}
            </Text>
          </View>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Pagos Registrados:</Text>
            <Text style={styles.paymentValue}>{payments.length}</Text>
          </View>
        </View>

        {payments.length > 0 && (
          <View style={styles.paymentsList}>
            {payments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentType}>
                    <Ionicons name="cash-outline" size={20} color={Colors.success} />
                    <Text style={styles.paymentTypeText}>PAGO</Text>
                  </View>
                  <Text style={[styles.paymentAmount, { color: Colors.success }]}>
                    {formatCurrency(payment.monto)}
                  </Text>
                </View>
                <Text style={styles.paymentDescription}>{payment.descripcion}</Text>
                <View style={styles.paymentFooter}>
                  <Text style={styles.paymentDate}>{formatDate(payment.fecha)}</Text>
                  {payment.metodo_pago && (
                    <Text style={styles.paymentMethod}>{payment.metodo_pago}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowStatusModal(true)}
          >
            <Ionicons name="create-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Cambiar Estado</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowPaymentModal(true)}
          >
            <Ionicons name="cash-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Registrar Pago</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddAppointment', { id: appointment.id })}
          >
            <Ionicons name="create-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Editar Cita</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PatientDetail', { id: appointment.paciente_id })}
          >
            <Ionicons name="person-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Ver Paciente</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Change Modal */}
      <StatusChangeModal
        visible={showStatusModal}
        currentStatus={appointment.estado}
        onClose={() => setShowStatusModal(false)}
        onStatusChange={handleStatusChange}
        loading={updating}
      />

      {/* Add Payment Modal */}
      <AddPaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onAddPayment={handleAddPayment}
        loading={updating}
      />
    </ScrollView>
  );
};

const StatusChangeModal = ({ visible, currentStatus, onClose, onStatusChange, loading }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');

  const statusOptions = [
    { value: 'programada', label: 'Programada', color: Colors.info },
    { value: 'en_proceso', label: 'En Proceso', color: Colors.warning },
    { value: 'completada', label: 'Completada', color: Colors.success },
    { value: 'cancelada', label: 'Cancelada', color: Colors.error },
    { value: 'no_asistio', label: 'No Asistió', color: Colors.gray[500] },
  ];

  const handleSave = () => {
    onStatusChange(selectedStatus, notes);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cambiar Estado</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Nuevo Estado</Text>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  selectedStatus === option.value && { backgroundColor: option.color + '20', borderColor: option.color }
                ]}
                onPress={() => setSelectedStatus(option.value)}
              >
                <View style={[styles.statusIndicator, { backgroundColor: option.color }]} />
                <Text style={styles.statusOptionText}>{option.label}</Text>
                {selectedStatus === option.value && (
                  <Ionicons name="checkmark" size={20} color={option.color} />
                )}
              </TouchableOpacity>
            ))}
            
            <Text style={styles.inputLabel}>Notas (Opcional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Agregar notas sobre el cambio de estado..."
              multiline
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AddPaymentModal = ({ visible, onClose, onAddPayment, loading }) => {
  const [formData, setFormData] = useState({
    monto: '',
    descripcion: '',
    metodo_pago: 'efectivo',
  });

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'cheque', label: 'Cheque' },
  ];

  const handleSave = () => {
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      Alert.alert('Error', 'El monto debe ser mayor a 0');
      return;
    }
    onAddPayment(formData);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Registrar Pago</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monto *</Text>
              <TextInput
                style={styles.input}
                value={formData.monto}
                onChangeText={(text) => setFormData({ ...formData, monto: text })}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Método de Pago</Text>
              <View style={styles.paymentMethods}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.paymentMethodOption,
                      formData.metodo_pago === method.value && { backgroundColor: Colors.primary + '20', borderColor: Colors.primary }
                    ]}
                    onPress={() => setFormData({ ...formData, metodo_pago: method.value })}
                  >
                    <Text style={[
                      styles.paymentMethodText,
                      formData.metodo_pago === method.value && { color: Colors.primary }
                    ]}>
                      {method.label}
                    </Text>
                    {formData.metodo_pago === method.value && (
                      <Ionicons name="checkmark" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={styles.notesInput}
                value={formData.descripcion}
                onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                placeholder="Descripción del pago..."
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Registrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.md,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
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
  statusButton: {
    padding: 8,
  },
  appointmentInfo: {
    backgroundColor: Colors.white,
    margin: 20,
    padding: 20,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  appointmentHeader: {
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  appointmentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  appointmentDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  timeInfo: {
    gap: 12,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
  },
  addPaymentText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  patientCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    ...Theme.shadows.sm,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  patientCode: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  patientPhone: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  paymentSummary: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 16,
    ...Theme.shadows.sm,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentsList: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    ...Theme.shadows.sm,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 8,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentDescription: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  paymentMethod: {
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    textAlignVertical: 'top',
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethodOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginRight: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AppointmentDetailScreen;