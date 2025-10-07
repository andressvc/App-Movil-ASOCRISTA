// screens/SupportScreen.js
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
import { Colors, Theme } from '../constants/Colors';

const SupportScreen = ({ navigation }) => {
  const handleEmailSupport = () => {
    const email = 'soporte@asocrista.com';
    const subject = 'Soporte Técnico - Centro Médico ASOCRISTA';
    const body = 'Hola, necesito ayuda con...';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No se puede abrir el cliente de correo');
        }
      })
      .catch((error) => {
        console.error('Error opening email:', error);
        Alert.alert('Error', 'No se pudo abrir el cliente de correo');
      });
  };

  const handlePhoneSupport = () => {
    const phoneNumber = '+50212345678';
    const url = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'No se puede realizar la llamada');
        }
      })
      .catch((error) => {
        console.error('Error opening phone:', error);
        Alert.alert('Error', 'No se pudo realizar la llamada');
      });
  };

  const supportOptions = [
    {
      id: 1,
      title: 'Correo Electrónico',
      description: 'joseandresv025@gmail.com',
      icon: 'mail-outline',
      onPress: handleEmailSupport,
    },
   
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Soporte</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información de contacto */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.infoDescription}>
            Estamos aquí para ayudarte. Puedes contactarnos a través de cualquiera de los siguientes medios.
          </Text>
        </View>

        {/* Opciones de soporte */}
        <View style={styles.optionsContainer}>
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.onPress}
            >
              <View style={styles.optionIcon}>
                <Ionicons name={option.icon} size={24} color={Colors.primary} />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Información adicional */}
        <View style={styles.additionalInfo}>
          <Text style={styles.additionalTitle}>Horarios de Atención</Text>
          <Text style={styles.additionalText}>
            Lunes a Viernes: 8:00 AM - 6:00 PM{'\n'}
            Sábados: 8:00 AM - 12:00 PM{'\n'}
            Domingos: Cerrado
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    ...Theme.shadows.sm,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 20,
    marginBottom: 20,
    ...Theme.shadows.sm,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  additionalInfo: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.md,
    padding: 20,
    ...Theme.shadows.sm,
  },
  additionalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  additionalText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

export default SupportScreen;
