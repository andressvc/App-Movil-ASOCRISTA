// screens/ReportsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reportService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';
import { API_CONFIG } from '../constants/Config';
import { getLocalDateString } from '../utils/validations';

const ReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [generating, setGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      setHasError(false);
      console.log('ReportsScreen: Intentando cargar reportes...');
      const response = await reportService.getReports();
      console.log('ReportsScreen: Respuesta del servidor:', response);
      
      if (response.success) {
        // El backend devuelve { data: { reportes: [...] } }
        const reportes = response.data?.reportes || response.data || [];
        setReports(reportes);
        console.log('ReportsScreen: Reportes cargados exitosamente:', reportes);
      } else {
        console.log('ReportsScreen: Respuesta no exitosa:', response.message);
        setReports([]);
        setHasError(true);
      }
    } catch (error) {
      console.error('ReportsScreen: Error cargando reportes:', error);
      
      // Verificar el tipo de error
      if (error.code === 'CONNECTION_ERROR' || !error.response) {
        console.log('ReportsScreen: Error de conexión - Backend no disponible');
        Alert.alert(
          'Error de Conexión',
          'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:3000',
          [
            {
              text: 'Reintentar',
              onPress: () => loadReports()
            },
            {
              text: 'Ver Datos de Ejemplo',
              onPress: () => {
                setReports([
                  {
                    id: 1,
                    tipo: 'diario',
                    titulo: 'Reporte Diario - ' + new Date().toLocaleDateString('es-ES'),
                    descripcion: 'Resumen de actividades del día',
                    fecha: new Date().toISOString(),
                    total_pacientes: 5,
                    total_ingresos: 1250.00
                  },
                  {
                    id: 2,
                    tipo: 'financiero',
                    titulo: 'Reporte Financiero Semanal',
                    descripcion: 'Análisis de ingresos y egresos',
                    fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    total_pacientes: 12,
                    total_ingresos: 3200.00
                  }
                ]);
              }
            }
          ]
        );
      } else if (error.response?.status === 401) {
        console.log('ReportsScreen: Error de autenticación');
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        console.log('ReportsScreen: Error del servidor:', error.response?.data);
        Alert.alert(
          'Error del Servidor',
          error.response?.data?.message || 'Error al cargar los reportes',
          [
            {
              text: 'Reintentar',
              onPress: () => loadReports()
            }
          ]
        );
      }
      
      // En caso de error, mostrar array vacío para que la pantalla se renderice
      setReports([]);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, []);

  const generateReport = async () => {
    try {
      setGenerating(true);
      console.log('ReportsScreen: Generando reporte para fecha:', selectedDate);
      const response = await reportService.generateDailyReport(selectedDate);
      console.log('ReportsScreen: Respuesta de generación:', response);
      
      if (response.success) {
        // Cerrar modal de generar reporte
        setShowGenerateModal(false);
        // Recargar lista para mostrar el nuevo reporte
        await loadReports();
        // Mostrar alerta de éxito
        setShowSuccessAlert(true);
        // Cerrar automáticamente después de 2 segundos
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 2000);
      } else {
        console.log('ReportsScreen: Error en respuesta:', response.message);
        Alert.alert('Error', response.message || 'No se pudo generar el reporte');
      }
    } catch (error) {
      console.error('ReportsScreen: Error generando reporte:', error);
      
      // Si es error 401, significa que no está autenticado
      if (error.response?.status === 401) {
        Alert.alert(
          'Sesión Expirada', 
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudo generar el reporte. Intenta nuevamente.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const getReportTypeIcon = (tipo) => {
    switch (tipo) {
      case 'diario': return 'calendar-outline';
      case 'mensual': return 'calendar';
      case 'anual': return 'calendar-sharp';
      case 'financiero': return 'cash-outline';
      case 'pacientes': return 'people-outline';
      default: return 'document-text-outline';
    }
  };

  const getReportTypeColor = (tipo) => {
    switch (tipo) {
      case 'diario': return Colors.primary;
      case 'mensual': return Colors.secondary;
      case 'anual': return Colors.success;
      case 'financiero': return Colors.warning;
      case 'pacientes': return Colors.info;
      default: return Colors.gray[500];
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) {
        return 'Fecha no disponible';
      }
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  const renderReport = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportType}>
          <Ionicons 
            name={getReportTypeIcon(item.tipo)} 
            size={24} 
            color={getReportTypeColor(item.tipo)} 
          />
          <Text style={[styles.reportTypeText, { color: getReportTypeColor(item.tipo) }]}>
            {(item.tipo || 'general').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.reportDate}>{formatDate(item.fecha || new Date())}</Text>
      </View>
      
      <Text style={styles.reportTitle}>{item.titulo || 'Sin título'}</Text>
      
      {item.descripcion && (
        <Text style={styles.reportDescription}>{item.descripcion}</Text>
      )}
      
      <View style={styles.reportFooter}>
        <View style={styles.reportStats}>
          <Text style={styles.statText}>
            <Ionicons name="people-outline" size={14} color={Colors.gray[500]} />
            {' '}{item.total_pacientes || 0} pacientes
          </Text>
          <Text style={styles.statText}>
            <Ionicons name="cash-outline" size={14} color={Colors.gray[500]} />
            {' '}Q {parseFloat(item.total_ingresos || 0).toFixed(2)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

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
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Reportes</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowGenerateModal(true)}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total Reportes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reports.filter(r => r.tipo === 'diario').length}
          </Text>
          <Text style={styles.statLabel}>Diarios</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {reports.filter(r => r.tipo === 'financiero').length}
          </Text>
          <Text style={styles.statLabel}>Financieros</Text>
        </View>
      </View>

      {/* Reports List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>No hay reportes</Text>
            <Text style={styles.emptyMessage}>
              {loading ? 'Cargando reportes...' : 
               hasError ? 'Error al cargar reportes. Verifica la conexión al servidor.' :
               'Genera tu primer reporte para ver estadísticas detalladas'}
            </Text>
            {!loading && (
              <>
                {hasError ? (
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={() => loadReports()}
                  >
                    <Ionicons name="refresh" size={20} color={Colors.white} />
                    <Text style={styles.generateButtonText}>Reintentar</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={() => setShowGenerateModal(true)}
                  >
                    <Ionicons name="add" size={20} color={Colors.white} />
                    <Text style={styles.generateButtonText}>Generar Reporte</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        ) : (
          reports.map((report) => (
            <View key={report.id}>
              {renderReport({ item: report })}
            </View>
          ))
        )}
      </ScrollView>

      {/* Generate Report Modal */}
      <Modal
        visible={showGenerateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenerateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generar Reporte</Text>
              <TouchableOpacity onPress={() => setShowGenerateModal(false)}>
                <Ionicons name="close" size={24} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Fecha del Reporte</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={styles.dateInput}
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.gray[400]}
                />
                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={() => setSelectedDate(getLocalDateString())}
                >
                  <Text style={styles.todayButtonText}>Hoy</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDescription}>
                Se generará un reporte diario con estadísticas de pacientes, citas y movimientos financieros para la fecha seleccionada.
              </Text>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowGenerateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.generateModalButton, generating && styles.disabledButton]}
                onPress={generateReport}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name="document-text" size={20} color={Colors.white} />
                    <Text style={styles.generateModalButtonText}>Generar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
            <Text style={styles.successModalTitle}>Reporte generado exitosamente</Text>
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={() => setShowSuccessAlert(false)}
            >
              <Text style={styles.successModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  debugText: {
    fontSize: 10,
    color: Colors.gray[500],
    marginTop: 2,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    ...Theme.shadows.sm,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportTypeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  reportDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: Colors.text.secondary,
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
    marginBottom: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.md,
  },
  generateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    maxWidth: 400,
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  todayButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.md,
  },
  todayButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
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
  generateModalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: Theme.borderRadius.md,
  },
  generateModalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
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

export default ReportsScreen;