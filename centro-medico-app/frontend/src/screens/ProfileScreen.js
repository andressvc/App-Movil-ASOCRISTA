// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Colors, Theme } from '../constants/Colors';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, changePassword } = useAuth();
  const { isDarkMode, theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Debug: Log navigation object
  useEffect(() => {
    console.log('ProfileScreen mounted');
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'Cambiar Contraseña',
      'Ingresa tu nueva contraseña:',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cambiar',
          onPress: async (newPassword) => {
            if (!newPassword || newPassword.length < 6) {
              Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
              return;
            }

            const result = await changePassword('', newPassword); // En una app real, pedirías la contraseña actual
            if (result.success) {
              Alert.alert('Éxito', 'Contraseña cambiada correctamente');
            } else {
              Alert.alert('Error', result.message);
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const ProfileItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <View style={styles.profileItemIcon}>
          <Ionicons name={icon} size={24} color={Colors.primary} />
        </View>
        <View style={styles.profileItemContent}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (
        <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color={Colors.white} />
        </View>
        <Text style={styles.userName}>{user?.nombre}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userRole}>
          {user?.rol === 'admin' ? 'Administrador' : 
           user?.rol === 'coordinador' ? 'Coordinador' : 'Asistente'}
        </Text>
      </View>

      {/* Información Personal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <ProfileItem
          icon="person-outline"
          title="Datos Personales"
          subtitle="Editar información personal"
          onPress={() => {
            if (navigation && navigation.navigate) {
              navigation.navigate('PersonalData');
            } else {
              Alert.alert('Próximamente', 'Esta función estará disponible pronto');
            }
          }}
        />
        
        <ProfileItem
          icon="lock-closed-outline"
          title="Cambiar Contraseña"
          subtitle="Actualizar tu contraseña"
          onPress={() => {
            if (navigation && navigation.navigate) {
              navigation.navigate('ChangePassword');
            } else {
              Alert.alert('Próximamente', 'Esta función estará disponible pronto');
            }
          }}
        />
      </View>

      {/* Configuración */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        <View style={styles.profileItem}>
          <View style={styles.profileItemLeft}>
            <View style={styles.profileItemIcon}>
              <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.profileItemContent}>
              <Text style={styles.profileItemTitle}>Notificaciones</Text>
              <Text style={styles.profileItemSubtitle}>Recibir notificaciones push</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.gray[300], true: Colors.primary }}
            thumbColor={notificationsEnabled ? Colors.white : Colors.gray[500]}
          />
        </View>

        <View style={styles.profileItem}>
          <View style={styles.profileItemLeft}>
            <View style={styles.profileItemIcon}>
              <Ionicons name="moon-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.profileItemContent}>
              <Text style={styles.profileItemTitle}>Modo Oscuro</Text>
              <Text style={styles.profileItemSubtitle}>Tema oscuro de la aplicación</Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.gray[300], true: theme.primary }}
            thumbColor={isDarkMode ? theme.white : theme.gray[500]}
          />
        </View>
      </View>

      {/* Soporte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soporte</Text>
        
        <ProfileItem
          icon="help-circle-outline"
          title="Ayuda"
          subtitle="Centro de ayuda y preguntas frecuentes"
          onPress={() => {
            if (navigation && navigation.navigate) {
              navigation.navigate('Support');
            } else {
              Alert.alert('Próximamente', 'Esta función estará disponible pronto');
            }
          }}
        />
        
        <ProfileItem
          icon="information-circle-outline"
          title="Acerca de"
          subtitle="Información de la aplicación"
          onPress={() => {
            if (navigation && navigation.navigate) {
              navigation.navigate('About');
            } else {
              Alert.alert('ASOCRISTA', 'Sistema de Gestión del Centro Médico\nVersión 1.0.0');
            }
          }}
        />
      </View>

      {/* Cerrar Sesión */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>ASOCRISTA v1.0.0</Text>
        <Text style={styles.footerText}>Sistema de Gestión Médica</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: Colors.white,
    marginTop: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Colors.error + '10',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
});

export default ProfileScreen;
