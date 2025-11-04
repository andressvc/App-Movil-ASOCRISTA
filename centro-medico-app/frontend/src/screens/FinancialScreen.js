// screens/FinancialScreen.js
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { financialService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';
import { getTodayISO, parseISOToLocalDate, MX_TZ } from '../utils/date';

const FinancialScreen = ({ navigation }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState(getTodayISO(MX_TZ));

  const movementTypes = [
    { value: 'all', label: 'Todos', color: Colors.gray[500] },
    { value: 'ingreso', label: 'Ingresos', color: Colors.success },
    { value: 'egreso', label: 'Egresos', color: Colors.error },
  ];

  const loadMovements = useCallback(async (type = selectedType, date = selectedDate) => {
    try {
      setLoading(true);
      
      const params = {
        tipo: type === 'all' ? undefined : type,
        fecha: date,
        page: 1,
        limit: 50,
      };

      const response = await financialService.getMovements(params);
      
      if (response.success) {
        setMovements(response.data.movimientos || []);
      } else {
        Alert.alert('Error', response.message || 'No se pudieron cargar los movimientos');
        setMovements([]);
      }
    } catch (error) {
      console.error('Error loading movements:', error);
      Alert.alert('Error', 'No se pudieron cargar los movimientos');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMovements(selectedType, selectedDate);
    setRefreshing(false);
  }, [loadMovements, selectedType, selectedDate]);

  // Recargar movimientos cuando cambie el tipo o fecha seleccionada
  useEffect(() => {
    loadMovements(selectedType, selectedDate);
  }, [selectedType, selectedDate, loadMovements]);

  // Recargar movimientos cuando la pantalla recupera el foco (después de crear/editar)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadMovements(selectedType, selectedDate);
    });

    return unsubscribe;
  }, [navigation, loadMovements, selectedType, selectedDate]);

  const getTypeColor = (tipo) => {
    return tipo === 'ingreso' ? Colors.success : Colors.error;
  };

  const getTypeIcon = (tipo) => {
    return tipo === 'ingreso' ? 'trending-up' : 'trending-down';
  };

  const renderMovement = ({ item }) => (
    <View style={styles.movementCard}>
      <View style={styles.movementHeader}>
        <View style={styles.movementType}>
          <Ionicons 
            name={getTypeIcon(item.tipo)} 
            size={20} 
            color={getTypeColor(item.tipo)} 
          />
          <Text style={[styles.typeText, { color: getTypeColor(item.tipo) }]}>
            {item.tipo.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.amountText, { color: getTypeColor(item.tipo) }]}>
          {item.tipo === 'ingreso' ? '+' : '-'}Q {parseFloat(item.monto).toFixed(2)}
        </Text>
      </View>
      
      <Text style={styles.descriptionText}>{item.descripcion}</Text>
      <Text style={styles.categoryText}>{item.categoria}</Text>
      
      {item.paciente && (
        <View style={styles.patientInfo}>
          <Ionicons name="person-outline" size={16} color={Colors.gray[500]} />
          <Text style={styles.patientText}>
            {item.paciente.nombre} {item.paciente.apellido}
          </Text>
        </View>
      )}
      
      <View style={styles.movementFooter}>
        <Text style={styles.dateText}>
          {parseISOToLocalDate(item.fecha)?.toLocaleDateString('es-ES')}
        </Text>
        {item.metodo_pago && (
          <Text style={styles.paymentText}>{item.metodo_pago}</Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cash-outline" size={64} color={Colors.gray[300]} />
      <Text style={styles.emptyTitle}>No hay movimientos</Text>
      <Text style={styles.emptyMessage}>
        No se encontraron movimientos financieros para los filtros seleccionados
      </Text>
    </View>
  );

  const TypeFilter = ({ type, label, color, isSelected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isSelected && { backgroundColor: color, borderColor: color }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterText,
        isSelected && { color: Colors.white }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
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
        <Text style={styles.title}>Movimientos Financieros</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddFinancial')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.typeFilters}>
          {movementTypes.map((type) => (
            <TypeFilter
              key={type.value}
              type={type.value}
              label={type.label}
              color={type.color}
              isSelected={selectedType === type.value}
              onPress={() => setSelectedType(type.value)}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.loadAllButton}
          onPress={() => {
            setSelectedDate(null);
            loadMovements('all', null);
          }}
        >
          <Ionicons name="cash-outline" size={16} color={Colors.primary} />
          <Text style={styles.loadAllButtonText}>Todos los Días</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen del Día</Text>
          <Text style={styles.summaryDate}>
            {selectedDate ? parseISOToLocalDate(selectedDate)?.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Todos los días'}
          </Text>
        </View>
      </View>

      {/* Movements List */}
      <FlatList
        data={movements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMovement}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  filtersContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  loadAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  loadAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  typeFilters: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  summaryContainer: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  summaryDate: {
    fontSize: 14,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  movementCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    ...Theme.shadows.sm,
  },
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  movementType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  movementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  paymentText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
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
});

export default FinancialScreen;
