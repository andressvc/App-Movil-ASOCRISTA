// screens/AppointmentsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appointmentService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';

const AppointmentsScreen = ({ navigation, route }) => {
  const { patientId } = route?.params || {};
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    estado: 'all',
    paciente: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const loadAppointments = useCallback(async (date = selectedDate, filterParams = filters) => {
    try {
      setLoading(true);
      
      const params = {
        page: 1,
        limit: 50,
        ...filterParams,
        ...(patientId && { paciente_id: patientId }),
        ...(date && { fecha: date })
      };

      const response = await appointmentService.getAppointments(params);
      
      if (response.success) {
        setAppointments(response.data.citas || []);
      } else {
        Alert.alert('Error', response.message || 'No se pudieron cargar las citas');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAppointments(selectedDate, filters);
    setRefreshing(false);
  }, [loadAppointments, selectedDate, filters]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      estado: 'all',
      paciente: '',
      fechaInicio: '',
      fechaFin: '',
    };
    setFilters(clearedFilters);
  }, []);

  // Recargar citas cuando cambie la fecha o los filtros
  useEffect(() => {
    loadAppointments(selectedDate, filters);
  }, [selectedDate, filters, loadAppointments]);

  // Recargar citas cuando la pantalla recupera el foco (después de crear/editar)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAppointments(selectedDate, filters);
    });

    return unsubscribe;
  }, [navigation, loadAppointments, selectedDate, filters]);

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

  const changeAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      if (response.success) {
        // Actualizar la lista local
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, estado: newStatus }
              : apt
          )
        );
        Alert.alert('Éxito', 'Estado de la cita actualizado correctamente');
      } else {
        Alert.alert('Error', response.message || 'No se pudo actualizar el estado');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado de la cita');
    }
  };

  const showStatusChangeAlert = (item) => {
    const statusOptions = [
      { text: 'Programada', value: 'programada' },
      { text: 'En Proceso', value: 'en_proceso' },
      { text: 'Completada', value: 'completada' },
      { text: 'Cancelada', value: 'cancelada' },
      { text: 'No Asistió', value: 'no_asistio' },
    ].filter(option => option.value !== item.estado);

    Alert.alert(
      'Cambiar Estado',
      `Cita: ${item.titulo}\nPaciente: ${item.paciente?.nombre} ${item.paciente?.apellido}`,
      [
        ...statusOptions.map(option => ({
          text: option.text,
          onPress: () => changeAppointmentStatus(item.id, option.value)
        })),
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const renderAppointment = ({ item }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => navigation.navigate('AppointmentDetail', { id: item.id })}
    >
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentTime}>
          <Text style={styles.timeText}>
            {item.hora_inicio} - {item.hora_fin}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}
          onPress={() => showStatusChangeAlert(item)}
        >
          <Text style={styles.statusText}>{getStatusText(item.estado)}</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.patientName}>
        {item.paciente?.nombre} {item.paciente?.apellido}
      </Text>
      
      <Text style={styles.appointmentTitle}>{item.titulo}</Text>
      
      {item.descripcion && (
        <Text style={styles.appointmentDescription}>{item.descripcion}</Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={64} color={Colors.gray[300]} />
      <Text style={styles.emptyTitle}>No hay citas</Text>
      <Text style={styles.emptyMessage}>
        No hay citas programadas para esta fecha
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Citas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAppointment')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Date Selector and Filters */}
      <View style={styles.dateSelector}>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>
            {selectedDate ? new Date(selectedDate).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Todas las Citas'}
          </Text>
          <Text style={styles.appointmentCount}>
            {appointments.length} citas
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.loadAllButton}
            onPress={() => {
              setSelectedDate(null);
              loadAppointments(null, {});
            }}
          >
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={styles.loadAllButtonText}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter-outline" size={20} color={Colors.primary} />
            <Text style={styles.filterButtonText}>Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters */}
      {(filters.estado !== 'all' || filters.paciente || filters.fechaInicio || filters.fechaFin) && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersTitle}>Filtros activos:</Text>
          <View style={styles.filterTags}>
            {filters.estado !== 'all' && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Estado: {getStatusText(filters.estado)}</Text>
                <TouchableOpacity onPress={() => handleFilterChange({ ...filters, estado: 'all' })}>
                  <Ionicons name="close" size={16} color={Colors.gray[500]} />
                </TouchableOpacity>
              </View>
            )}
            {filters.paciente && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>Paciente: {filters.paciente}</Text>
                <TouchableOpacity onPress={() => handleFilterChange({ ...filters, paciente: '' })}>
                  <Ionicons name="close" size={16} color={Colors.gray[500]} />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
              <Text style={styles.clearAllText}>Limpiar todo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Appointments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando citas...</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAppointment}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filters Modal */}
      <FiltersModal
        visible={showFilters}
        filters={filters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleFilterChange}
      />
    </View>
  );
};

const FiltersModal = ({ visible, filters, onClose, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'programada', label: 'Programada' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'no_asistio', label: 'No Asistió' },
  ];

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
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estado</Text>
              <View style={styles.statusOptions}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      localFilters.estado === option.value && { backgroundColor: Colors.primary + '20', borderColor: Colors.primary }
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, estado: option.value })}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      localFilters.estado === option.value && { color: Colors.primary }
                    ]}>
                      {option.label}
                    </Text>
                    {localFilters.estado === option.value && (
                      <Ionicons name="checkmark" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Buscar Paciente</Text>
              <TextInput
                style={styles.input}
                value={localFilters.paciente}
                onChangeText={(text) => setLocalFilters({ ...localFilters, paciente: text })}
                placeholder="Nombre del paciente..."
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha Inicio</Text>
              <TextInput
                style={styles.input}
                value={localFilters.fechaInicio}
                onChangeText={(text) => setLocalFilters({ ...localFilters, fechaInicio: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha Fin</Text>
              <TextInput
                style={styles.input}
                value={localFilters.fechaFin}
                onChangeText={(text) => setLocalFilters({ ...localFilters, fechaFin: text })}
                placeholder="YYYY-MM-DD"
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
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
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
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelector: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  loadAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
  },
  loadAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },
  appointmentCount: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  activeFilters: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
  },
  filterTagText: {
    fontSize: 12,
    color: Colors.primary,
    marginRight: 4,
  },
  clearAllButton: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
  },
  clearAllText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  listContainer: {
    padding: 20,
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    ...Theme.shadows.sm,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTime: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  appointmentTitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  appointmentDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 12,
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginRight: 8,
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
  applyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppointmentsScreen;
