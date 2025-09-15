// hooks/useThemedStyles.js
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export const useThemedStyles = (createStyles) => {
  const { theme } = useTheme();
  
  return useMemo(() => {
    return createStyles(theme);
  }, [theme, createStyles]);
};

export default useThemedStyles;
