// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Theme } from '../constants/Colors';
import { useAndroidSafeArea } from '../hooks/useAndroidSafeArea';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PatientsScreen from '../screens/PatientsScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import AddAppointmentScreen from '../screens/AddAppointmentScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import FinancialScreen from '../screens/FinancialScreen';
import AddFinancialScreen from '../screens/AddFinancialScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PersonalDataScreen from '../screens/PersonalDataScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import SupportScreen from '../screens/SupportScreen';
import AboutScreen from '../screens/AboutScreen';
import BitacoraScreen from '../screens/BitacoraScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigator para Autenticación
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// Stack Navigator para Pacientes
const PatientsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.border,
      },
      headerTintColor: Colors.primary,
      headerTitleStyle: {
        ...Theme.typography.navTitle,
        color: Colors.text.primary,
      },
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen 
      name="PatientsList" 
      component={PatientsScreen}
      options={{ title: 'Pacientes' }}
    />
    <Stack.Screen 
      name="AddPatient" 
      component={AddPatientScreen}
      options={{ title: 'Nuevo Paciente' }}
    />
    <Stack.Screen 
      name="EditPatient" 
      component={AddPatientScreen}
      options={{ title: 'Editar Paciente' }}
    />
    <Stack.Screen 
      name="PatientDetail" 
      component={PatientDetailScreen}
      options={{ title: 'Detalle del Paciente' }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Citas
const AppointmentsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.border,
      },
      headerTintColor: Colors.primary,
      headerTitleStyle: {
        ...Theme.typography.navTitle,
        color: Colors.text.primary,
      },
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen 
      name="AppointmentsList" 
      component={AppointmentsScreen}
      options={{ title: 'Citas' }}
    />
    <Stack.Screen 
      name="AddAppointment" 
      component={AddAppointmentScreen}
      options={{ title: 'Nueva Cita' }}
    />
    <Stack.Screen 
      name="EditAppointment" 
      component={AddAppointmentScreen}
      options={{ title: 'Editar Cita' }}
    />
    <Stack.Screen 
      name="AppointmentDetail" 
      component={AppointmentDetailScreen}
      options={{ title: 'Detalle de la Cita' }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Finanzas
const FinancialStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.border,
      },
      headerTintColor: Colors.primary,
      headerTitleStyle: {
        ...Theme.typography.navTitle,
        color: Colors.text.primary,
      },
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen 
      name="FinancialList" 
      component={FinancialScreen}
      options={{ title: 'Movimientos Financieros' }}
    />
    <Stack.Screen 
      name="AddFinancial" 
      component={AddFinancialScreen}
      options={{ title: 'Nuevo Movimiento' }}
    />
    <Stack.Screen 
      name="EditFinancial" 
      component={AddFinancialScreen}
      options={{ title: 'Editar Movimiento' }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Reportes
const ReportsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.border,
      },
      headerTintColor: Colors.primary,
      headerTitleStyle: {
        ...Theme.typography.navTitle,
        color: Colors.text.primary,
      },
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen 
      name="ReportsList" 
      component={ReportsScreen}
      options={{ title: 'Reportes' }}
    />
    <Stack.Screen 
      name="ReportDetail" 
      component={ReportDetailScreen}
      options={{ title: 'Detalle del Reporte' }}
    />
  </Stack.Navigator>
);

// Stack Navigator para Perfil
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.white,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: Colors.border,
      },
      headerTintColor: Colors.primary,
      headerTitleStyle: {
        ...Theme.typography.navTitle,
        color: Colors.text.primary,
      },
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Perfil', headerShown: false }}
    />
    <Stack.Screen 
      name="PersonalData" 
      component={PersonalDataScreen}
      options={{ title: 'Datos Personales' }}
    />
    <Stack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen}
      options={{ title: 'Cambiar Contraseña' }}
    />
    <Stack.Screen 
      name="Support" 
      component={SupportScreen}
      options={{ title: 'Soporte' }}
    />
    <Stack.Screen 
      name="About" 
      component={AboutScreen}
      options={{ title: 'Acerca de' }}
    />
    <Stack.Screen 
      name="Bitacora" 
      component={BitacoraScreen}
      options={{ title: 'Bitácora' }}
    />
  </Stack.Navigator>
);

// Tab Navigator Principal
const MainTabs = () => {
  const { bottomPadding, tabBarHeight, isAndroid } = useAndroidSafeArea();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Patients':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Appointments':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Financial':
              iconName = focused ? 'cash' : 'cash-outline';
              break;
            case 'Reports':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[500],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0.5,
          borderTopColor: Colors.border,
          paddingBottom: bottomPadding,
          paddingTop: Theme.spacing.sm,
          height: tabBarHeight,
          elevation: isAndroid ? 8 : 0, // Sombra más prominente en Android
          ...Theme.shadows.sm,
        },
        tabBarLabelStyle: {
          ...Theme.typography.caption1,
          fontWeight: '500',
          marginTop: Theme.spacing.xs,
        },
      })}
    >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{ 
        title: 'Inicio',
        headerShown: false,
      }}
    />
    <Tab.Screen 
      name="Patients" 
      component={PatientsStack}
      options={{ 
        title: 'Pacientes',
        headerShown: false,
      }}
    />
    <Tab.Screen 
      name="Appointments" 
      component={AppointmentsStack}
      options={{ 
        title: 'Citas',
        headerShown: false,
      }}
    />
    <Tab.Screen 
      name="Financial" 
      component={FinancialStack}
      options={{ 
        title: 'Finanzas',
        headerShown: false,
      }}
    />
    <Tab.Screen 
      name="Reports" 
      component={ReportsStack}
      options={{ 
        title: 'Reportes',
        headerShown: false,
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStack}
      options={{ 
        title: 'Perfil',
        headerShown: false,
      }}
    />
    </Tab.Navigator>
  );
};

// Navegador Principal
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('AppNavigator: Estado de autenticación:', { isAuthenticated, isLoading });

  if (isLoading) {
    console.log('AppNavigator: Mostrando SplashScreen (cargando...)');
    return <SplashScreen />;
  }

  console.log('AppNavigator: Renderizando navegación principal');
  console.log('AppNavigator: Usuario autenticado:', isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainTabs />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
