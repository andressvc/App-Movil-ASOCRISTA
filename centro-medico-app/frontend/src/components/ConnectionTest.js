import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { patientService } from '../services/api';
import { Colors, Theme } from '../constants/Colors';

const ConnectionTest = ({ onConnectionSuccess }) => {
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    try {
      setTesting(true);
      console.log('Testing backend connection...');
      
      // Intentar obtener la lista de pacientes como prueba
      const response = await patientService.getPatients({ limit: 1 });
      console.log('Backend response:', response);
      
      if (response.success) {
        Alert.alert('Éxito', 'Conexión con el backend exitosa');
        if (onConnectionSuccess) {
          onConnectionSuccess();
        }
      } else {
        Alert.alert('Error', 'Backend respondió pero con error: ' + (response.message || 'Desconocido'));
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      Alert.alert(
        'Error de Conexión', 
        `No se pudo conectar con el backend.\n\nDetalles: ${error.message}\n\nVerifica que:\n1. El backend esté ejecutándose\n2. La IP sea correcta\n3. No haya firewall bloqueando`
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prueba de Conexión</Text>
      <Text style={styles.description}>
        Si ves este mensaje, hay un problema de conexión con el backend.
      </Text>
      <TouchableOpacity 
        style={[styles.button, testing && styles.buttonDisabled]} 
        onPress={testConnection}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? 'Probando...' : 'Probar Conexión'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Theme.borderRadius.md,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConnectionTest;
