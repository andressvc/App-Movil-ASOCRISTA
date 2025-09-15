// constants/Colors.js
export const Colors = {
  // Colores principales - Sistema de colores Apple HIG
  primary: '#007AFF',      // Azul iOS nativo
  primaryDark: '#0056CC',  // Azul oscuro
  primaryLight: '#4A9EFF', // Azul claro
  
  // Colores secundarios
  secondary: '#34C759',    // Verde iOS nativo
  secondaryDark: '#248A3D',
  secondaryLight: '#5DD579',
  
  // Colores de estado siguiendo Apple HIG
  success: '#34C759',      // Verde éxito iOS
  warning: '#FF9500',      // Naranja iOS
  error: '#FF3B30',        // Rojo iOS
  info: '#007AFF',         // Azul información iOS
  
  // Colores neutros - Sistema de grises Apple
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F2F2F7',   // iOS Background Grouped
    100: '#E5E5EA',  // iOS Separator
    200: '#D1D1D6',  // iOS Separator Opaque
    300: '#C7C7CC',  // iOS Fill Tertiary
    400: '#AEAEB2',  // iOS Fill Secondary
    500: '#8E8E93',  // iOS Label Tertiary
    600: '#6D6D70',  // iOS Label Secondary
    700: '#48484A',  // iOS Label Primary
    800: '#3A3A3C',  // iOS Fill Primary
    900: '#1C1C1E',  // iOS Label Primary
  },
  
  // Colores de fondo siguiendo Apple HIG
  background: '#F2F2F7',    // iOS Background Grouped
  surface: '#FFFFFF',       // iOS Background
  surfaceSecondary: '#F2F2F7', // iOS Background Secondary
  
  // Colores de texto siguiendo Apple HIG
  text: {
    primary: '#000000',     // iOS Label Primary
    secondary: '#3A3A3C',   // iOS Label Secondary
    tertiary: '#3A3A3C',    // iOS Label Tertiary
    quaternary: '#2C2C2E',  // iOS Label Quarternary
    disabled: '#8E8E93',    // iOS Label Disabled
    placeholder: '#8E8E93', // iOS Placeholder Text
  },
  
  // Colores de borde siguiendo Apple HIG
  border: '#C6C6C8',        // iOS Separator
  divider: '#C6C6C8',       // iOS Separator
  
  // Colores específicos de la app médica
  medical: {
    primary: '#007AFF',     // Azul médico iOS
    secondary: '#34C759',   // Verde médico iOS
    accent: '#FF9500',      // Naranja médico iOS
    background: '#F2F2F7',  // Fondo iOS
    card: '#FFFFFF',        // Tarjetas iOS
    text: '#000000',        // Texto iOS
  },
  
  // Colores adicionales para funcionalidades específicas
  appointment: {
    scheduled: '#007AFF',   // Programada
    completed: '#34C759',   // Completada
    cancelled: '#FF3B30',   // Cancelada
    inProgress: '#FF9500',  // En Proceso
    noShow: '#8E8E93',      // No Asistió
  },
  
  // Colores de alertas
  alert: {
    error: '#FF3B30',       // Error
    warning: '#FF9500',     // Advertencia
    info: '#007AFF',        // Información
    success: '#34C759',     // Éxito
  }
};

export const Theme = {
  colors: Colors,
  // Espaciado siguiendo Apple HIG (8pt grid system)
  spacing: {
    xs: 4,      // 4pt
    sm: 8,      // 8pt
    md: 16,     // 16pt
    lg: 24,     // 24pt
    xl: 32,     // 32pt
    xxl: 48,    // 48pt
    xxxl: 64,   // 64pt
  },
  // Border radius siguiendo Apple HIG
  borderRadius: {
    xs: 2,      // 2pt - muy pequeño
    sm: 4,      // 4pt - pequeño
    md: 8,      // 8pt - medio
    lg: 12,     // 12pt - grande
    xl: 16,     // 16pt - muy grande
    round: 50,  // 50% - circular
  },
  // Sombras siguiendo Apple HIG
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  // Tipografía siguiendo Apple HIG (San Francisco)
  typography: {
    // Títulos grandes
    largeTitle: {
      fontSize: 34,
      fontWeight: '700',
      lineHeight: 41,
      letterSpacing: 0.37,
    },
    title1: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 34,
      letterSpacing: 0.36,
    },
    title2: {
      fontSize: 22,
      fontWeight: '700',
      lineHeight: 28,
      letterSpacing: 0.35,
    },
    title3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 25,
      letterSpacing: 0.38,
    },
    // Texto del cuerpo
    headline: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 22,
      letterSpacing: -0.41,
    },
    body: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 22,
      letterSpacing: -0.41,
    },
    callout: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 21,
      letterSpacing: -0.32,
    },
    subhead: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: -0.24,
    },
    footnote: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
      letterSpacing: -0.08,
    },
    caption1: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0,
    },
    caption2: {
      fontSize: 11,
      fontWeight: '400',
      lineHeight: 13,
      letterSpacing: 0.07,
    },
    // Botones
    button: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 22,
      letterSpacing: -0.41,
    },
    // Navegación
    navTitle: {
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 22,
      letterSpacing: -0.41,
    },
  },
  // Layout siguiendo Apple HIG
  layout: {
    // Márgenes de contenido
    contentMargin: 16,
    contentMarginLarge: 20,
    // Espaciado entre secciones
    sectionSpacing: 24,
    // Espaciado entre elementos
    itemSpacing: 12,
    itemSpacingLarge: 16,
    // Padding de tarjetas
    cardPadding: 16,
    cardPaddingLarge: 20,
  },
};
