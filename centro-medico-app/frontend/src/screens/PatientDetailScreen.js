// screens/PatientDetailScreen.js
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { patientService, appointmentService, financialService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';

const PatientDetailScreen = ({ route, navigation }) => {
  const { id } = route.params || {};
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [financialHistory, setFinancialHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Validar que tenemos un ID válido
  if (!id) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>ID de paciente no válido</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      console.log('Loading patient data for ID:', id);
      
      // Solo cargar datos del paciente por ahora
      const patientResponse = await patientService.getPatient(id);
      console.log('Patient response:', patientResponse);

      if (patientResponse.success) {
        setPatient(patientResponse.data.paciente);
        console.log('Patient loaded successfully:', patientResponse.data.paciente);
      } else {
        console.error('Patient response not successful:', patientResponse);
        Alert.alert('Error', patientResponse.message || 'No se pudo cargar la información del paciente');
        return;
      }
      
      // Cargar citas y movimientos financieros por separado (opcional)
      try {
        const appointmentsResponse = await appointmentService.getAppointments({ paciente_id: id });
        if (appointmentsResponse.success) {
          setAppointments(appointmentsResponse.data.citas || []);
        }
      } catch (error) {
        console.log('Error loading appointments:', error);
      }

      try {
        const financialResponse = await financialService.getMovements({ paciente_id: id });
        if (financialResponse.success) {
          setFinancialHistory(financialResponse.data.movimientos || []);
        }
      } catch (error) {
        console.log('Error loading financial data:', error);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
      
      let errorMessage = 'No se pudo cargar la información del paciente';
      
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        errorMessage = 'Error de conexión. Verifica que el backend esté ejecutándose.';
        setConnectionError(true);
      } else if (error.response?.status === 404) {
        errorMessage = 'Paciente no encontrado.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error del servidor. Intenta más tarde.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPatient = async (updatedData) => {
    try {
      setEditing(true);
      const response = await patientService.updatePatient(id, updatedData);
      if (response.success) {
        setPatient(response.data);
        setShowEditModal(false);
        Alert.alert('Éxito', 'Paciente actualizado correctamente');
      } else {
        Alert.alert('Error', response.message || 'No se pudo actualizar el paciente');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      Alert.alert('Error', 'No se pudo actualizar el paciente');
    } finally {
      setEditing(false);
    }
  };

  const handleDeletePatient = () => {
    Alert.alert(
      'Eliminar Paciente',
      '¿Estás seguro de que quieres eliminar este paciente? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Intentando eliminar paciente ID:', id);
              const response = await patientService.deletePatient(id);
              console.log('📥 Respuesta de eliminación:', response);
              
              if (response && response.success) {
                Alert.alert('Éxito', 'Paciente eliminado correctamente', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              } else {
                Alert.alert('Error', response?.message || 'No se pudo eliminar el paciente');
              }
            } catch (error) {
              console.error('❌ Error deleting patient:', error);
              console.error('Error details:', error.response?.data || error.message);
              
              let errorMessage = 'No se pudo eliminar el paciente';
              
              if (error.response?.status === 401) {
                errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
                Alert.alert('Sesión Expirada', errorMessage, [
                  { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
                return;
              } else if (error.response?.status === 404) {
                errorMessage = 'Paciente no encontrado';
              } else if (error.response?.status === 403) {
                errorMessage = 'No tienes permisos para eliminar este paciente';
              } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error.message) {
                errorMessage = error.message;
              }
              
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `Q ${parseFloat(amount).toFixed(2)}`;
  };

  const getAppointmentStatusColor = (estado) => {
    switch (estado) {
      case 'completada': return Colors.success;
      case 'cancelada': return Colors.error;
      case 'en_proceso': return Colors.warning;
      case 'programada': return Colors.info;
      default: return Colors.gray[500];
    }
  };

  const getAppointmentStatusText = (estado) => {
    switch (estado) {
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      case 'en_proceso': return 'En Proceso';
      case 'programada': return 'Programada';
      case 'no_asistio': return 'No Asistió';
      default: return estado;
    }
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <View style={styles.statLeft}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
        </View>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </TouchableOpacity>
  );

  if (connectionError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Error de Conexión</Text>
        <Text style={styles.errorMessage}>No se pudo conectar con el servidor</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPatientData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando información del paciente...</Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>No se pudo cargar la información del paciente</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPatientData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Text style={styles.title}>Detalle del Paciente</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowEditModal(true)}
        >
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Patient Info */}
      <View style={styles.patientInfo}>
        <View style={styles.patientHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={Colors.white} />
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>
              {patient.nombre} {patient.apellido}
            </Text>
            <Text style={styles.patientCode}>Código: {patient.codigo}</Text>
            {patient.edad && (
              <Text style={styles.patientAge}>{patient.edad} años</Text>
            )}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          {patient.telefono && (
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{patient.telefono}</Text>
            </View>
          )}
          {patient.email && (
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{patient.email}</Text>
            </View>
          )}
          {patient.direccion && (
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <Text style={styles.contactText}>{patient.direccion}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Citas"
            value={appointments.length}
            icon="calendar-outline"
            color={Colors.primary}
            onPress={() => navigation.navigate('Appointments', { patientId: id })}
          />
          <StatCard
            title="Citas Completadas"
            value={appointments.filter(a => a.estado === 'completada').length}
            icon="checkmark-circle-outline"
            color={Colors.success}
            onPress={() => navigation.navigate('Appointments', { patientId: id })}
          />
          <StatCard
            title="Total Pagado"
            value={formatCurrency(financialHistory.reduce((sum, f) => sum + (f.tipo === 'ingreso' ? parseFloat(f.monto) : 0), 0))}
            icon="cash-outline"
            color={Colors.warning}
            onPress={() => navigation.navigate('Financial', { patientId: id })}
          />
          <StatCard
            title="Última Cita"
            value={appointments.length > 0 ? formatDate(appointments[0].fecha) : 'N/A'}
            icon="time-outline"
            color={Colors.info}
            onPress={() => navigation.navigate('Appointments', { patientId: id })}
          />
        </View>
      </View>

      {/* Recent Appointments */}
      {appointments.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Citas Recientes</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Appointments', { patientId: id })}
            >
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {appointments.slice(0, 3).map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => navigation.navigate('AppointmentDetail', { id: appointment.id })}
            >
              <View style={styles.appointmentTime}>
                <Text style={styles.timeText}>
                  {appointment.hora_inicio} - {appointment.hora_fin}
                </Text>
                <Text style={styles.dateText}>{formatDate(appointment.fecha)}</Text>
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentTitle}>{appointment.titulo}</Text>
                {appointment.descripcion && (
                  <Text style={styles.appointmentDescription}>{appointment.descripcion}</Text>
                )}
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getAppointmentStatusColor(appointment.estado) }
              ]}>
                <Text style={styles.statusText}>
                  {getAppointmentStatusText(appointment.estado)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Financial History */}
      {financialHistory.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial Financiero</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Financial', { patientId: id })}
            >
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {financialHistory.slice(0, 3).map((movement) => (
            <View key={movement.id} style={styles.financialCard}>
              <View style={styles.financialHeader}>
                <View style={styles.financialType}>
                  <Ionicons
                    name={movement.tipo === 'ingreso' ? 'trending-up' : 'trending-down'}
                    size={20}
                    color={movement.tipo === 'ingreso' ? Colors.success : Colors.error}
                  />
                  <Text style={[
                    styles.financialTypeText,
                    { color: movement.tipo === 'ingreso' ? Colors.success : Colors.error }
                  ]}>
                    {movement.tipo.toUpperCase()}
                  </Text>
                </View>
                <Text style={[
                  styles.financialAmount,
                  { color: movement.tipo === 'ingreso' ? Colors.success : Colors.error }
                ]}>
                  {movement.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(movement.monto)}
                </Text>
              </View>
              <Text style={styles.financialDescription}>{movement.descripcion}</Text>
              <Text style={styles.financialDate}>{formatDate(movement.fecha)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Appointments', { screen: 'AddAppointment', params: { patientId: id } })}
          >
            <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Nueva Cita</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Financial', { screen: 'AddFinancial', params: { patientId: id } })}
          >
            <Ionicons name="cash-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Nuevo Pago</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Llamar al contacto de emergencia
              if (patient?.telefono_emergencia) {
                Alert.alert(
                  'Contacto de Emergencia',
                  `¿Deseas llamar al contacto de emergencia?\n\nNombre: ${patient.contacto_emergencia || 'No especificado'}\nTeléfono: ${patient.telefono_emergencia}`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Llamar',
                      onPress: () => {
                        Linking.openURL(`tel:${patient.telefono_emergencia}`);
                      }
                    }
                  ]
                );
              } else if (patient?.telefono) {
                // Si no hay contacto de emergencia, usar el teléfono del paciente
                Alert.alert(
                  'Llamar al Paciente',
                  `¿Deseas llamar al paciente?\n\nTeléfono: ${patient.telefono}`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Llamar',
                      onPress: () => {
                        Linking.openURL(`tel:${patient.telefono}`);
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Información', 'El paciente no tiene número de teléfono ni contacto de emergencia registrado');
              }
            }}
          >
            <Ionicons name="call-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>Llamar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={() => {
              console.log('🔴 Botón eliminar presionado');
              handleDeletePatient();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={24} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Patient Modal */}
      <EditPatientModal
        visible={showEditModal}
        patient={patient}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditPatient}
        loading={editing}
      />
    </ScrollView>
  );
};

const EditPatientModal = ({ visible, patient, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    edad: '',
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        nombre: patient.nombre || '',
        apellido: patient.apellido || '',
        telefono: patient.telefono || '',
        email: patient.email || '',
        direccion: patient.direccion || '',
        edad: patient.edad ? patient.edad.toString() : '',
      });
    }
  }, [patient]);

  const handleSave = () => {
    if (!formData.nombre || !formData.apellido) {
      Alert.alert('Error', 'Nombre y apellido son obligatorios');
      return;
    }
    onSave(formData);
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
            <Text style={styles.modalTitle}>Editar Paciente</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                placeholder="Nombre del paciente"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Apellido *</Text>
              <TextInput
                style={styles.input}
                value={formData.apellido}
                onChangeText={(text) => setFormData({ ...formData, apellido: text })}
                placeholder="Apellido del paciente"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={formData.telefono}
                onChangeText={(text) => setFormData({ ...formData, telefono: text })}
                placeholder="Número de teléfono"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Correo electrónico"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dirección</Text>
              <TextInput
                style={styles.input}
                value={formData.direccion}
                onChangeText={(text) => setFormData({ ...formData, direccion: text })}
                placeholder="Dirección del paciente"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Edad</Text>
              <TextInput
                style={styles.input}
                value={formData.edad}
                onChangeText={(text) => setFormData({ ...formData, edad: text })}
                placeholder="Edad en años"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
          
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
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  editButton: {
    padding: 8,
  },
  patientInfo: {
    backgroundColor: Colors.white,
    margin: 20,
    padding: 20,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  patientCode: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  patientAge: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
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
  seeAllText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderLeftWidth: 4,
    ...Theme.shadows.sm,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLeft: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  appointmentTime: {
    marginRight: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  appointmentDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  financialCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    ...Theme.shadows.sm,
  },
  financialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  financialType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialTypeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  financialAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  financialDescription: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  financialDate: {
    fontSize: 12,
    color: Colors.text.secondary,
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
  dangerButton: {
    borderWidth: 1,
    borderColor: Colors.error,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
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

export default PatientDetailScreen;