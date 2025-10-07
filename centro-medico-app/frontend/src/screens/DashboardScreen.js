// screens/DashboardScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';
import { Images } from '../constants/Images';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = async () => {
    try {
      const response = await dashboardService.getSummary();
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
      Alert.alert('Error', 'No se pudo cargar el resumen');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSummary();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadSummary();
  }, []);

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.statCardContent}>
        <View style={styles.statCardHeader}>
          <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
        </View>
        <View style={styles.statCardBody}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={Colors.white} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>¡Hola, {user?.nombre}!</Text>
              <Text style={styles.date}>{new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</Text>
            </View>
            <View style={styles.logoContainer}>
              <Image 
                source={Images.asoLogo} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
              <View style={styles.profileIconContainer}>
                <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Estadísticas del día */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Día</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Pacientes Atendidos"
              value={summary?.resumen?.totalPacientes || 0}
              icon="people-outline"
              color={Colors.primary}
              onPress={() => navigation.navigate('Patients', { screen: 'PatientsList' })}
            />
            <StatCard
              title="Citas Hoy"
              value={summary?.resumen?.estadisticasHoy?.totalCitas || 0}
              icon="calendar-outline"
              color={Colors.secondary}
              onPress={() => navigation.navigate('Appointments', { screen: 'AppointmentsList' })}
            />
            <StatCard
              title="Citas Completadas"
              value={summary?.resumen?.estadisticasHoy?.citasCompletadas || 0}
              icon="checkmark-circle-outline"
              color={Colors.success}
              onPress={() => navigation.navigate('Appointments', { screen: 'AppointmentsList' })}
            />
            <StatCard
              title="Balance Diario"
              value={`Q ${summary?.resumen?.balanceDiario?.toFixed(2) || '0.00'}`}
              icon="cash-outline"
              color={summary?.resumen?.balanceDiario >= 0 ? Colors.success : Colors.error}
              onPress={() => navigation.navigate('Financial', { screen: 'FinancialList' })}
            />
          </View>
        </View>

      {/* Estadísticas Semanales */}
      {summary?.estadisticasSemanales && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Esta Semana</Text>
          <View style={styles.weeklyStatsContainer}>
            <View style={styles.weeklyStatCard}>
              <Text style={styles.weeklyStatNumber}>
                {summary.estadisticasSemanales.totalCitas || 0}
              </Text>
              <Text style={styles.weeklyStatLabel}>Citas</Text>
              <View style={styles.weeklyStatTrend}>
                <Ionicons 
                  name={summary.estadisticasSemanales.tendenciaCitas >= 0 ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  color={summary.estadisticasSemanales.tendenciaCitas >= 0 ? Colors.success : Colors.error} 
                />
                <Text style={[
                  styles.weeklyStatTrendText,
                  { color: summary.estadisticasSemanales.tendenciaCitas >= 0 ? Colors.success : Colors.error }
                ]}>
                  {Math.abs(summary.estadisticasSemanales.tendenciaCitas || 0)}%
                </Text>
              </View>
            </View>
            <View style={styles.weeklyStatCard}>
              <Text style={styles.weeklyStatNumber}>
                Q ${summary.estadisticasSemanales.ingresosTotales?.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.weeklyStatLabel}>Ingresos</Text>
              <View style={styles.weeklyStatTrend}>
                <Ionicons 
                  name={summary.estadisticasSemanales.tendenciaIngresos >= 0 ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  color={summary.estadisticasSemanales.tendenciaIngresos >= 0 ? Colors.success : Colors.error} 
                />
                <Text style={[
                  styles.weeklyStatTrendText,
                  { color: summary.estadisticasSemanales.tendenciaIngresos >= 0 ? Colors.success : Colors.error }
                ]}>
                  {Math.abs(summary.estadisticasSemanales.tendenciaIngresos || 0)}%
                </Text>
              </View>
            </View>
            <View style={styles.weeklyStatCard}>
              <Text style={styles.weeklyStatNumber}>
                {summary.estadisticasSemanales.pacientesNuevos || 0}
              </Text>
              <Text style={styles.weeklyStatLabel}>Nuevos Pacientes</Text>
              <View style={styles.weeklyStatTrend}>
                <Ionicons 
                  name={summary.estadisticasSemanales.tendenciaPacientes >= 0 ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  color={summary.estadisticasSemanales.tendenciaPacientes >= 0 ? Colors.success : Colors.error} 
                />
                <Text style={[
                  styles.weeklyStatTrendText,
                  { color: summary.estadisticasSemanales.tendenciaPacientes >= 0 ? Colors.success : Colors.error }
                ]}>
                  {Math.abs(summary.estadisticasSemanales.tendenciaPacientes || 0)}%
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Gráfico de Citas por Estado */}
      {summary?.citasPorEstado && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Citas por Estado</Text>
          <View style={styles.chartContainer}>
            {Object.entries(summary.citasPorEstado).map(([estado, cantidad]) => (
              <View key={estado} style={styles.chartItem}>
                <View style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartBarFill,
                      { 
                        height: `${(cantidad / Math.max(...Object.values(summary.citasPorEstado))) * 100}%`,
                        backgroundColor: getStatusColor(estado)
                      }
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{getStatusText(estado)}</Text>
                <Text style={styles.chartValue}>{cantidad}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Top Pacientes */}
      {summary?.topPacientes && summary.topPacientes.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pacientes Más Activos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Patients')}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {summary.topPacientes.slice(0, 3).map((paciente, index) => (
            <TouchableOpacity
              key={paciente.id}
              style={styles.topPatientCard}
              onPress={() => navigation.navigate('PatientDetail', { id: paciente.id })}
            >
              <View style={styles.topPatientRank}>
                <Text style={styles.rankNumber}>#{index + 1}</Text>
              </View>
              <View style={styles.topPatientInfo}>
                <Text style={styles.topPatientName}>
                  {paciente.nombre} {paciente.apellido}
                </Text>
                <Text style={styles.topPatientStats}>
                  {paciente.totalCitas} citas • Q {paciente.totalPagado?.toFixed(2) || '0.00'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>
      )}

        {/* Acciones rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Nuevo Paciente"
              icon="person-add-outline"
              color={Colors.primary}
              onPress={() => navigation.navigate('Patients', { screen: 'AddPatient' })}
            />
            <QuickAction
              title="Nueva Cita"
              icon="calendar-outline"
              color={Colors.secondary}
              onPress={() => navigation.navigate('Appointments', { screen: 'AddAppointment' })}
            />
            <QuickAction
              title="Movimiento Financiero"
              icon="add-circle-outline"
              color={Colors.success}
              onPress={() => navigation.navigate('Financial', { screen: 'AddFinancial' })}
            />
            <QuickAction
              title="Generar Reporte"
              icon="document-text-outline"
              color={Colors.warning}
              onPress={() => navigation.navigate('Reports', { screen: 'ReportsList' })}
            />
          </View>
        </View>

      {/* Citas de hoy */}
      {summary?.citasHoy && summary.citasHoy.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Citas de Hoy</Text>
          {summary.citasHoy.slice(0, 3).map((cita, index) => (
            <TouchableOpacity
              key={index}
              style={styles.appointmentCard}
              onPress={() => navigation.navigate('AppointmentDetail', { id: cita.id })}
            >
              <View style={styles.appointmentTime}>
                <Text style={styles.appointmentTimeText}>
                  {cita.hora_inicio} - {cita.hora_fin}
                </Text>
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentPatient}>
                  {cita.paciente?.nombre} {cita.paciente?.apellido}
                </Text>
                <Text style={styles.appointmentType}>{cita.titulo}</Text>
              </View>
              <View style={[styles.appointmentStatus, { backgroundColor: getStatusColor(cita.estado) }]}>
                <Text style={styles.appointmentStatusText}>
                  {getStatusText(cita.estado)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {summary.citasHoy.length > 3 && (
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => navigation.navigate('Appointments', { screen: 'AppointmentsList' })}
            >
              <Text style={styles.seeMoreText}>
                Ver todas las citas ({summary.citasHoy.length - 3} más)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Alertas */}
      {summary?.alertas && summary.alertas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas</Text>
          {summary.alertas.map((alerta, index) => (
            <View key={index} style={[styles.alertCard, { borderLeftColor: getAlertColor(alerta.tipo) }]}>
              <Ionicons name={getAlertIcon(alerta.tipo)} size={20} color={getAlertColor(alerta.tipo)} />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alerta.titulo}</Text>
                <Text style={styles.alertMessage}>{alerta.mensaje}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStatusColor = (estado) => {
  switch (estado) {
    case 'completada': return Colors.success;
    case 'cancelada': return Colors.error;
    case 'en_proceso': return Colors.warning;
    default: return Colors.info;
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

const getAlertColor = (tipo) => {
  switch (tipo) {
    case 'error': return Colors.error;
    case 'warning': return Colors.warning;
    case 'info': return Colors.info;
    default: return Colors.primary;
  }
};

const getAlertIcon = (tipo) => {
  switch (tipo) {
    case 'error': return 'alert-circle-outline';
    case 'warning': return 'warning-outline';
    case 'info': return 'information-circle-outline';
    default: return 'notifications-outline';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Theme.typography.body,
    color: Colors.text.secondary,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  logo: {
    width: 35,
    height: 35,
  },
  greeting: {
    ...Theme.typography.title2,
    color: Colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  date: {
    ...Theme.typography.subhead,
    color: Colors.text.secondary,
  },
  profileButton: {
    padding: Theme.spacing.sm,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.title3,
    color: Colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  seeAllText: {
    ...Theme.typography.callout,
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
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    width: '48%',
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  statCardContent: {
    flex: 1,
  },
  statCardHeader: {
    marginBottom: Theme.spacing.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardBody: {
    flex: 1,
  },
  statValue: {
    ...Theme.typography.title1,
    color: Colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  statTitle: {
    ...Theme.typography.footnote,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    width: '48%',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  quickActionText: {
    ...Theme.typography.callout,
    color: Colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  appointmentTime: {
    marginRight: Theme.spacing.md,
  },
  appointmentTimeText: {
    ...Theme.typography.footnote,
    fontWeight: '600',
    color: Colors.primary,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentPatient: {
    ...Theme.typography.callout,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  appointmentType: {
    ...Theme.typography.footnote,
    color: Colors.text.secondary,
  },
  appointmentStatus: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  appointmentStatusText: {
    ...Theme.typography.caption1,
    fontWeight: '600',
    color: Colors.white,
  },
  seeMoreButton: {
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  seeMoreText: {
    ...Theme.typography.callout,
    color: Colors.primary,
    fontWeight: '600',
  },
  alertCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...Theme.shadows.sm,
  },
  alertContent: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  alertTitle: {
    ...Theme.typography.callout,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  alertMessage: {
    ...Theme.typography.footnote,
    color: Colors.text.secondary,
  },
  weeklyStatsContainer: {
    flexDirection: 'row',
  },
  weeklyStatCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
    ...Theme.shadows.sm,
  },
  weeklyStatNumber: {
    ...Theme.typography.title3,
    color: Colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  weeklyStatLabel: {
    ...Theme.typography.caption1,
    color: Colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  weeklyStatTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyStatTrendText: {
    ...Theme.typography.caption1,
    fontWeight: '600',
    marginLeft: Theme.spacing.xs,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    height: 200,
    ...Theme.shadows.sm,
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 30,
    height: 120,
    backgroundColor: Colors.gray[100],
    borderRadius: Theme.borderRadius.sm,
    justifyContent: 'flex-end',
    marginBottom: Theme.spacing.sm,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: Theme.borderRadius.sm,
    minHeight: 4,
  },
  chartLabel: {
    ...Theme.typography.caption2,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  chartValue: {
    ...Theme.typography.caption1,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  topPatientCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  topPatientRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  rankNumber: {
    ...Theme.typography.callout,
    fontWeight: '700',
    color: Colors.primary,
  },
  topPatientInfo: {
    flex: 1,
  },
  topPatientName: {
    ...Theme.typography.callout,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  topPatientStats: {
    ...Theme.typography.footnote,
    color: Colors.text.secondary,
  },
});

export default DashboardScreen;
