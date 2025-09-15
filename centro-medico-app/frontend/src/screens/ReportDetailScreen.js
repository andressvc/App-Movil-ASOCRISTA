// screens/ReportDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reportService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';

const ReportDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await reportService.getReport(id);
      if (response.success) {
        setReport(response.data);
      } else {
        Alert.alert('Error', 'No se pudo cargar el reporte');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading report:', error);
      Alert.alert('Error', 'No se pudo cargar el reporte');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `Reporte ${report.tipo} - ${report.titulo}\nFecha: ${formatDate(report.fecha)}\n\n${report.descripcion || ''}`,
        title: report.titulo,
      };
      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statLeft}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando reporte...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorMessage}>No se pudo cargar el reporte</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReport}>
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
        <Text style={styles.title}>Detalle del Reporte</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Report Info */}
      <View style={styles.reportInfo}>
        <View style={styles.reportHeader}>
          <View style={styles.reportType}>
            <Ionicons name="document-text" size={24} color={Colors.primary} />
            <Text style={styles.reportTypeText}>{report.tipo.toUpperCase()}</Text>
          </View>
          <Text style={styles.reportDate}>{formatDate(report.fecha)}</Text>
        </View>
        
        <Text style={styles.reportTitle}>{report.titulo}</Text>
        
        {report.descripcion && (
          <Text style={styles.reportDescription}>{report.descripcion}</Text>
        )}
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Pacientes"
            value={report.total_pacientes || 0}
            icon="people-outline"
            color={Colors.primary}
            subtitle="Pacientes atendidos"
          />
          <StatCard
            title="Total Citas"
            value={report.total_citas || 0}
            icon="calendar-outline"
            color={Colors.secondary}
            subtitle="Citas programadas"
          />
          <StatCard
            title="Citas Completadas"
            value={report.citas_completadas || 0}
            icon="checkmark-circle-outline"
            color={Colors.success}
            subtitle="Citas finalizadas"
          />
          <StatCard
            title="Total Ingresos"
            value={formatCurrency(report.total_ingresos || 0)}
            icon="cash-outline"
            color={Colors.warning}
            subtitle="Ingresos del día"
          />
        </View>
      </View>

      {/* Financial Summary */}
      {report.resumen_financiero && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Financiero</Text>
          <View style={styles.financialCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Ingresos:</Text>
              <Text style={[styles.financialValue, { color: Colors.success }]}>
                {formatCurrency(report.resumen_financiero.ingresos || 0)}
              </Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Egresos:</Text>
              <Text style={[styles.financialValue, { color: Colors.error }]}>
                {formatCurrency(report.resumen_financiero.egresos || 0)}
              </Text>
            </View>
            <View style={[styles.financialRow, styles.financialTotal]}>
              <Text style={styles.financialTotalLabel}>Balance:</Text>
              <Text style={[
                styles.financialTotalValue,
                { color: (report.resumen_financiero.balance || 0) >= 0 ? Colors.success : Colors.error }
              ]}>
                {formatCurrency(report.resumen_financiero.balance || 0)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Patient Details */}
      {report.detalles_pacientes && report.detalles_pacientes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pacientes Atendidos</Text>
          {report.detalles_pacientes.map((paciente, index) => (
            <View key={index} style={styles.patientCard}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>
                  {paciente.nombre} {paciente.apellido}
                </Text>
                <Text style={styles.patientCode}>Código: {paciente.codigo}</Text>
              </View>
              <View style={styles.patientStats}>
                <Text style={styles.patientStat}>
                  {paciente.total_citas || 0} citas
                </Text>
                <Text style={styles.patientStat}>
                  {formatCurrency(paciente.total_pagado || 0)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Appointment Details */}
      {report.detalles_citas && report.detalles_citas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Citas del Día</Text>
          {report.detalles_citas.map((cita, index) => (
            <View key={index} style={styles.appointmentCard}>
              <View style={styles.appointmentTime}>
                <Text style={styles.timeText}>
                  {cita.hora_inicio} - {cita.hora_fin}
                </Text>
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentPatient}>
                  {cita.paciente?.nombre} {cita.paciente?.apellido}
                </Text>
                <Text style={styles.appointmentTitle}>{cita.titulo}</Text>
                <Text style={styles.appointmentStatus}>
                  Estado: {cita.estado}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Reporte generado el {formatDate(report.created_at)}
        </Text>
        <Text style={styles.footerText}>
          ASOCRISTA - Sistema de Gestión Médica
        </Text>
      </View>
    </ScrollView>
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
  shareButton: {
    padding: 8,
  },
  reportInfo: {
    backgroundColor: Colors.white,
    margin: 20,
    padding: 20,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  reportDate: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  financialCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 20,
    ...Theme.shadows.sm,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  financialTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
    paddingTop: 16,
  },
  financialLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  financialTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  financialTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Theme.shadows.sm,
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
  patientStats: {
    alignItems: 'flex-end',
  },
  patientStat: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
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
  appointmentInfo: {
    flex: 1,
  },
  appointmentPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  appointmentTitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  appointmentStatus: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
});

export default ReportDetailScreen;
