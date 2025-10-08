// components/AndroidTabBar.js
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Theme } from '../constants/Colors';

/**
 * Componente para manejar el área segura de los bottom tabs en Android
 * Asegura que los tabs no se superpongan con los botones de navegación del sistema
 */
const AndroidTabBar = ({ children }) => {
  const insets = useSafeAreaInsets();

  if (Platform.OS !== 'android') {
    return children;
  }

  return (
    <View style={styles.container}>
      {children}
      {/* Espaciador adicional para dispositivos con navegación por gestos */}
      <View 
        style={[
          styles.spacer, 
          { 
            height: Math.max(insets.bottom, Theme.spacing.sm),
            backgroundColor: Colors.white 
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spacer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
});

export default AndroidTabBar;
