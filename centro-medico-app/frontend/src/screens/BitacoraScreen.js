import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { bitacoraService } from '../services/bitacora';
import { Colors, Theme } from '../constants/Colors';

const BitacoraScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await bitacoraService.list({ page: reset ? 1 : page, limit: 20 });
      const nuevas = res?.data?.entradas || [];
      setItems(reset ? nuevas : [...items, ...nuevas]);
      setHasMore((res?.data?.paginacion?.pagina || 1) < (res?.data?.paginacion?.totalPaginas || 1));
      setPage((prev) => (reset ? 2 : prev + 1));
    } catch (e) {
      console.error('Error cargando bitácora:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(true); }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.accion}>{item.accion}</Text>
      {item.descripcion ? <Text style={styles.descripcion}>{item.descripcion}</Text> : null}
      <Text style={styles.meta}>{item.entidad || '-'} {item.entidad_id || ''}</Text>
      <Text style={styles.fecha}>{new Date(item.createdAt).toLocaleString('es-ES')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(true)} />}
        onEndReachedThreshold={0.5}
        onEndReached={() => hasMore && load(false)}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Sin entradas</Text> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border
  },
  accion: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  descripcion: { marginTop: 4, color: Colors.text.secondary },
  meta: { marginTop: 4, fontSize: 12, color: Colors.gray[600] },
  fecha: { marginTop: 6, fontSize: 12, color: Colors.gray[500] },
  empty: { textAlign: 'center', marginTop: 40, color: Colors.text.secondary }
});

export default BitacoraScreen;


