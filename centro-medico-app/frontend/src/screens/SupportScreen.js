// screens/SupportScreen.js
import React, { useState } from 'react';
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

const SupportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "¿Cómo registro un nuevo paciente?",
      answer: "Ve a la sección 'Pacientes' y toca el botón '+' para agregar un nuevo paciente. Completa la información requerida y guarda."
    },
    {
      id: 2,
      question: "¿Cómo programo una cita?",
      answer: "En la sección 'Citas', toca el botón '+' y selecciona el paciente, fecha, hora y tipo de cita. El sistema verificará conflictos automáticamente."
    },
    {
      id: 3,
      question: "¿Cómo registro un pago?",
      answer: "Ve a 'Finanzas' y toca el botón '+'. Selecciona el tipo de movimiento (ingreso/egreso), paciente asociado y completa los datos."
    },
    {
      id: 4,
      question: "¿Cómo genero un reporte?",
      answer: "En la sección 'Reportes', selecciona la fecha y toca 'Generar Reporte'. El sistema creará un PDF automáticamente."
    },
    {
      id: 5,
      question: "¿Cómo cambio mi contraseña?",
      answer: "Ve a 'Perfil' > 'Cambiar Contraseña' e ingresa tu contraseña actual y la nueva contraseña."
    },
    {
      id: 6,
      question: "¿Qué hago si olvido mi contraseña?",
      answer: "Contacta al administrador del sistema para que pueda restablecer tu contraseña de forma segura."
    }
  ];

  const contactInfo = {
    email: "soporte@asocrista.com",
    phone: "+1 (555) 123-4567",
    address: "Centro Médico ASOCRISTA\nCalle Principal 123\nCiudad, Estado 12345"
  };

  const handleEmailContact = () => {
    Linking.openURL(`mailto:${contactInfo.email}?subject=Soporte ASOCRISTA&body=Hola, necesito ayuda con...`);
  };

  const handlePhoneContact = () => {
    Linking.openURL(`tel:${contactInfo.phone}`);
  };

  const handleAddressContact = () => {
    Alert.alert(
      'Dirección',
      contactInfo.address,
      [{ text: 'OK' }]
    );
  };

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const FAQItem = ({ item }) => (
    <View style={[styles.faqItem, { backgroundColor: theme.surface }]}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => toggleFAQ(item.id)}
      >
        <Text style={[styles.faqQuestionText, { color: theme.text.primary }]}>
          {item.question}
        </Text>
        <Ionicons
          name={expandedFAQ === item.id ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.primary}
        />
      </TouchableOpacity>
      {expandedFAQ === item.id && (
        <View style={styles.faqAnswer}>
          <Text style={[styles.faqAnswerText, { color: theme.text.secondary }]}>
            {item.answer}
          </Text>
        </View>
      )}
    </View>
  );

  const ContactItem = ({ icon, title, subtitle, onPress, color = theme.primary }) => (
    <TouchableOpacity style={[styles.contactItem, { backgroundColor: theme.surface }]} onPress={onPress}>
      <View style={[styles.contactIcon, { backgroundColor: color + '10' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.contactContent}>
        <Text style={[styles.contactTitle, { color: theme.text.primary }]}>{title}</Text>
        <Text style={[styles.contactSubtitle, { color: theme.text.secondary }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.gray[400]} />
    </TouchableOpacity>
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
          Soporte
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Contacto
        </Text>
        
        <ContactItem
          icon="mail"
          title="Correo Electrónico"
          subtitle={contactInfo.email}
          onPress={handleEmailContact}
          color={theme.info}
        />
        
        <ContactItem
          icon="call"
          title="Teléfono"
          subtitle={contactInfo.phone}
          onPress={handlePhoneContact}
          color={theme.success}
        />
        
        <ContactItem
          icon="location"
          title="Dirección"
          subtitle="Ver dirección completa"
          onPress={handleAddressContact}
          color={theme.warning}
        />
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Preguntas Frecuentes
        </Text>
        
        {faqData.map((item) => (
          <FAQItem key={item.id} item={item} />
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Acciones Rápidas
        </Text>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('About')}
        >
          <Ionicons name="information-circle" size={20} color={theme.white} />
          <Text style={[styles.actionButtonText, { color: theme.white }]}>
            Información de la Aplicación
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.secondary }]}
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible en una actualización futura')}
        >
          <Ionicons name="bug" size={20} color={theme.white} />
          <Text style={[styles.actionButtonText, { color: theme.white }]}>
            Reportar Problema
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: theme.surface }]}>
        <Text style={[styles.footerText, { color: theme.text.secondary }]}>
          ¿No encuentras lo que buscas?
        </Text>
        <Text style={[styles.footerSubtext, { color: theme.text.secondary }]}>
          Contáctanos directamente y te ayudaremos
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
  },
  faqItem: {
    marginBottom: 12,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: Theme.borderRadius.md,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    margin: 20,
    padding: 20,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    ...Theme.shadows.sm,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SupportScreen;
