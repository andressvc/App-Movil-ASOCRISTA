// hooks/useAndroidSafeArea.js
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { Theme } from '../constants/Colors';

/**
 * Hook personalizado para manejar el área segura en Android
 * Proporciona valores optimizados para los bottom tabs
 */
export const useAndroidSafeArea = () => {
  const insets = useSafeAreaInsets();

  if (Platform.OS !== 'android') {
    return {
      bottomPadding: Theme.spacing.sm,
      tabBarHeight: 60,
      isAndroid: false,
    };
  }

  // En Android, necesitamos más espacio para evitar superposición
  const bottomPadding = Math.max(insets.bottom + Theme.spacing.sm, Theme.spacing.md);
  const tabBarHeight = 60 + Math.max(insets.bottom, Theme.spacing.sm);

  return {
    bottomPadding,
    tabBarHeight,
    isAndroid: true,
    hasGestureNavigation: insets.bottom > 0,
    systemBottomInset: insets.bottom,
  };
};
