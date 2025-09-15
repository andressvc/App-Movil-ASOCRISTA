// screens/AboutScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Colors, Theme } from '../constants/Colors';

const AboutScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const appInfo = {
    name: 'ASOCRISTA',
    version: '1.0.0',
    description: 'Sistema de Gestión del Centro Médico ASOCRISTA',
    build: '2024.01.15',
    developer: 'Equipo de Desarrollo ASOCRISTA',
  };

  const features = [
    'Gestión completa de pacientes',
    'Programación de citas médicas',
    'Control financiero integrado',
    'Generación de reportes automáticos',
    'Notificaciones push',
    'Autenticación biométrica',
    'Modo oscuro',
    'Sincronización en tiempo real'
  ];

  const handleOpenWebsite = () => {
    Linking.openURL('https://asocrista.com');
  };

  const handleOpenPrivacy = () => {
    Alert.alert(
      'Política de Privacidad',
      'ASOCRISTA se compromete a proteger la privacidad de nuestros usuarios. Toda la información médica se maneja con estrictos protocolos de seguridad y encriptación.',
      [{ text: 'Entendido' }]
    );
  };

  const handleOpenTerms = () => {
    Alert.alert(
      'Términos de Uso',
      'Al usar esta aplicación, aceptas nuestros términos de servicio. El uso está restringido al personal autorizado del Centro Médico ASOCRISTA.',
      [{ text: 'Entendido' }]
    );
  };

  const InfoItem = ({ icon, title, value, onPress, color = theme.primary }) => (
    <TouchableOpacity 
      style={[styles.infoItem, { backgroundColor: theme.surface }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.infoIcon, { backgroundColor: color + '10' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoTitle, { color: theme.text.primary }]}>{title}</Text>
        <Text style={[styles.infoValue, { color: theme.text.secondary }]}>{value}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color={theme.gray[400]} />
      )}
    </TouchableOpacity>
  );

  const FeatureItem = ({ feature }) => (
    <View style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={16} color={theme.success} />
      <Text style={[styles.featureText, { color: theme.text.primary }]}>{feature}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Acerca de
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <View style={[styles.appInfoCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.appIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="medical" size={40} color={theme.white} />
          </View>
          <Text style={[styles.appName, { color: theme.text.primary }]}>
            {appInfo.name}
          </Text>
          <Text style={[styles.appDescription, { color: theme.text.secondary }]}>
            {appInfo.description}
          </Text>
          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, { color: theme.text.secondary }]}>
              Versión {appInfo.version}
            </Text>
            <Text style={[styles.buildText, { color: theme.text.secondary }]}>
              Build {appInfo.build}
            </Text>
          </View>
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Características
        </Text>
        <View style={[styles.featuresCard, { backgroundColor: theme.surface }]}>
          {features.map((feature, index) => (
            <FeatureItem key={index} feature={feature} />
          ))}
        </View>
      </View>

      {/* App Details */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Información de la Aplicación
        </Text>
        
        <InfoItem
          icon="code-slash"
          title="Desarrollador"
          value={appInfo.developer}
        />
        
        <InfoItem
          icon="phone-portrait"
          title="Plataforma"
          value="React Native / Expo"
        />
        
        <InfoItem
          icon="server"
          title="Backend"
          value="Node.js / Express / MySQL"
        />
        
        <InfoItem
          icon="shield-checkmark"
          title="Seguridad"
          value="Encriptación AES-256"
        />
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Legal
        </Text>
        
        <InfoItem
          icon="document-text"
          title="Términos de Uso"
          value="Ver términos y condiciones"
          onPress={handleOpenTerms}
          color={theme.info}
        />
        
        <InfoItem
          icon="lock-closed"
          title="Política de Privacidad"
          value="Ver política de privacidad"
          onPress={handleOpenPrivacy}
          color={theme.warning}
        />
        
        <InfoItem
          icon="globe"
          title="Sitio Web"
          value="asocrista.com"
          onPress={handleOpenWebsite}
          color={theme.success}
        />
      </View>

      {/* Copyright */}
      <View style={[styles.copyright, { backgroundColor: theme.surface }]}>
        <Text style={[styles.copyrightText, { color: theme.text.secondary }]}>
          © 2024 Centro Médico ASOCRISTA
        </Text>
        <Text style={[styles.copyrightText, { color: theme.text.secondary }]}>
          Todos los derechos reservados
        </Text>
        <Text style={[styles.copyrightText, { color: theme.text.secondary }]}>
          Hecho con ❤️ para la salud
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...Theme.shadows.sm,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  appInfoCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.md,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  versionContainer: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buildText: {
    fontSize: 12,
    marginTop: 2,
  },
  featuresCard: {
    padding: 20,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
  },
  copyright: {
    margin: 20,
    padding: 20,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  copyrightText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default AboutScreen;
