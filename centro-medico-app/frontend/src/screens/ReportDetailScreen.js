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

const ReportDetailScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando reporte ID:', id);
      
      const response = await reportService.getReport(id);
      console.log('📊 Respuesta reporte:', response);
      
      if (response.success) {
        setReport(response.data.reporte || response.data);
      } else {
        Alert.alert('Error', response.message || 'No se pudo cargar el reporte');
      }
    } catch (error) {
      console.error('❌ Error cargando reporte:', error);
      
      // Datos de ejemplo para desarrollo
      setReport({
        id: id,
        tipo: 'diario',
        titulo: 'Reporte Diario - ' + new Date().toLocaleDateString('es-ES'),
        descripcion: 'Resumen de actividades del día',
        fecha: new Date().toISOString(),
        total_pacientes: 5,
        total_citas: 8,
        citas_completadas: 6,
        citas_canceladas: 1,
        total_ingresos: 1250.00,
        total_egresos: 150.00,
        balance_diario: 1100.00
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    try {
      if (!report) {
        Alert.alert('Error', 'No hay datos del reporte para compartir');
        return;
      }

      const fechaFormateada = formatDate(report.fecha);
      const mensaje = `📊 Reporte Diario - Centro Médico ASOCRISTA\n\n` +
        `📅 Fecha: ${fechaFormateada}\n` +
        `👥 Pacientes Atendidos: ${report.total_pacientes || 0}\n` +
        `📋 Total de Citas: ${report.total_citas || 0}\n` +
        `✅ Citas Completadas: ${report.citas_completadas || 0}\n` +
        `❌ Citas Canceladas: ${report.citas_canceladas || 0}\n` +
        `💰 Total Ingresos: Q ${parseFloat(report.total_ingresos || 0).toFixed(2)}\n` +
        `💸 Total Egresos: Q ${parseFloat(report.total_egresos || 0).toFixed(2)}\n` +
        `📈 Balance Diario: Q ${parseFloat(report.balance_diario || 0).toFixed(2)}\n\n` +
        `Generado desde la App Centro Médico ASOCRISTA`;

      // Mostrar opciones de compartir
      Alert.alert(
        'Compartir Reporte',
        '¿Cómo deseas compartir el reporte?',
        [
          {
            text: 'Solo Texto',
            onPress: async () => {
              try {
                const result = await Share.share({
                  message: mensaje,
                  title: `Reporte Diario - ${fechaFormateada}`,
                });
                if (result.action === Share.sharedAction) {
                  console.log('Reporte compartido exitosamente');
                }
              } catch (error) {
                console.error('Error al compartir texto:', error);
                Alert.alert('Error', 'No se pudo compartir el reporte');
              }
            }
          },
          {
            text: 'Copiar al Portapapeles',
            onPress: async () => {
              try {
                // Importar Clipboard dinámicamente
                const { Clipboard } = await import('@react-native-clipboard/clipboard');
                await Clipboard.setString(mensaje);
                Alert.alert('Éxito', 'Reporte copiado al portapapeles');
              } catch (error) {
                console.error('Error al copiar:', error);
                Alert.alert('Error', 'No se pudo copiar el reporte');
              }
            }
          },
          {
            text: 'Cancelar',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error al compartir reporte:', error);
      Alert.alert('Error', 'No se pudo compartir el reporte');
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadReport}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
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
        <Text style={styles.title}>Detalle del Reporte</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Report Info */}
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>{report.titulo}</Text>
          <Text style={styles.reportDate}>{formatDate(report.fecha)}</Text>
          {report.descripcion && (
            <Text style={styles.reportDescription}>{report.descripcion}</Text>
          )}
        </View>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Pacientes Atendidos"
            value={report.total_pacientes || 0}
            icon="people-outline"
            color={Colors.primary}
          />
          <StatCard
            title="Total Citas"
            value={report.total_citas || 0}
            icon="calendar-outline"
            color={Colors.secondary}
          />
          <StatCard
            title="Citas Completadas"
            value={report.citas_completadas || 0}
            icon="checkmark-circle-outline"
            color={Colors.success}
          />
          <StatCard
            title="Citas Canceladas"
            value={report.citas_canceladas || 0}
            icon="close-circle-outline"
            color={Colors.error}
          />
        </View>

        {/* Financial Summary */}
        <View style={styles.financialSection}>
          <Text style={styles.sectionTitle}>Resumen Financiero</Text>
          <View style={styles.financialGrid}>
            <StatCard
              title="Total Ingresos"
              value={`Q ${parseFloat(report.total_ingresos || 0).toFixed(2)}`}
              icon="trending-up-outline"
              color={Colors.success}
              subtitle="Ingresos del día"
            />
            <StatCard
              title="Total Egresos"
              value={`Q ${parseFloat(report.total_egresos || 0).toFixed(2)}`}
              icon="trending-down-outline"
              color={Colors.error}
              subtitle="Gastos del día"
            />
            <StatCard
              title="Balance Diario"
              value={`Q ${parseFloat(report.balance_diario || 0).toFixed(2)}`}
              icon="cash-outline"
              color={report.balance_diario >= 0 ? Colors.success : Colors.error}
              subtitle="Ganancia neta"
            />
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <Text style={styles.sectionTitle}>Información Adicional</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color={Colors.gray[500]} />
              <Text style={styles.infoLabel}>Tipo de Reporte:</Text>
              <Text style={styles.infoValue}>{report.tipo?.toUpperCase() || 'DIARIO'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={Colors.gray[500]} />
              <Text style={styles.infoLabel}>Fecha de Generación:</Text>
              <Text style={styles.infoValue}>{formatDate(report.createdAt || report.fecha)}</Text>
            </View>
            {report.ruta_archivo && (
              <View style={styles.infoRow}>
                <Ionicons name="download-outline" size={20} color={Colors.gray[500]} />
                <Text style={styles.infoLabel}>Archivo PDF:</Text>
                <Text style={styles.infoValue}>Disponible</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
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
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  reportInfo: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: 20,
    marginBottom: 20,
    ...Theme.shadows.sm,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  reportDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    ...Theme.shadows.sm,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  financialSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  financialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  additionalInfo: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: 20,
    ...Theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
});

export default ReportDetailScreen;