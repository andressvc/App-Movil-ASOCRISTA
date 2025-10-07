// screens/BitacoraScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';

const mockLogs = [
  { id: '1', tipo: 'INFO', mensaje: 'Inicio de sesión exitoso', fecha: new Date().toISOString() },
  { id: '2', tipo: 'ACCION', mensaje: 'Generó reporte diario', fecha: new Date().toISOString() },
  { id: '3', tipo: 'PACIENTE', mensaje: 'Alta de nuevo paciente', fecha: new Date().toISOString() },
];

const BitacoraScreen = () => {
  const [logs, setLogs] = useState(mockLogs);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // En el futuro aquí se llamará al backend para obtener la bitácora real
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.badge}>
          <Ionicons name="document-text-outline" size={16} color={Colors.white} />
          <Text style={styles.badgeText}>{item.tipo}</Text>
        </View>
        <Text style={styles.timeText}>{new Date(item.fecha).toLocaleString()}</Text>
      </View>
      <Text style={styles.message}>{item.mensaje}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}> 
            <Ionicons name="document-text-outline" size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>Sin registros</Text>
            <Text style={styles.emptyMsg}>Aún no hay entradas en la bitácora</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    ...Theme.shadows.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: Colors.white, marginLeft: 6, fontWeight: '600' },
  timeText: { color: Colors.text.secondary, fontSize: 12 },
  message: { marginTop: 8, color: Colors.text.primary },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: '600', color: Colors.text.primary },
  emptyMsg: { marginTop: 4, color: Colors.text.secondary },
});

export default BitacoraScreen;


