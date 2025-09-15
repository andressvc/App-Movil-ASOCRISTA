// components/NotificationService.js
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async initialize() {
    try {
      // Verificar si es un dispositivo físico
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          Alert.alert('Error', 'Se requiere permiso para enviar notificaciones');
          return false;
        }
        
        // Obtener el token de push
        this.expoPushToken = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig.extra.eas.projectId,
        });
        
        console.log('Push token:', this.expoPushToken.data);
      } else {
        Alert.alert('Error', 'Debe usar un dispositivo físico para las notificaciones push');
        return false;
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
    
    return true;
  }

  // Programar notificación local
  async scheduleLocalNotification(title, body, data = {}, trigger = null) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: trigger || null, // null = inmediata
      });
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Programar recordatorio de cita
  async scheduleAppointmentReminder(appointment) {
    const { id, titulo, fecha, hora_inicio, paciente } = appointment;
    
    // Recordatorio 1 hora antes
    const reminderTime = new Date(fecha);
    const [hours, minutes] = hora_inicio.split(':');
    reminderTime.setHours(parseInt(hours) - 1, parseInt(minutes), 0, 0);
    
    if (reminderTime > new Date()) {
      await this.scheduleLocalNotification(
        'Recordatorio de Cita',
        `Tienes una cita con ${paciente.nombre} ${paciente.apellido} en 1 hora: ${titulo}`,
        { appointmentId: id, type: 'appointment_reminder' },
        { date: reminderTime }
      );
    }
    
    // Recordatorio 15 minutos antes
    const urgentReminderTime = new Date(fecha);
    urgentReminderTime.setHours(parseInt(hours), parseInt(minutes) - 15, 0, 0);
    
    if (urgentReminderTime > new Date()) {
      await this.scheduleLocalNotification(
        'Cita Próxima',
        `Cita con ${paciente.nombre} ${paciente.apellido} en 15 minutos: ${titulo}`,
        { appointmentId: id, type: 'appointment_urgent' },
        { date: urgentReminderTime }
      );
    }
  }

  // Programar notificación de pago pendiente
  async schedulePaymentReminder(payment) {
    const { id, monto, paciente, fecha_vencimiento } = payment;
    
    const dueDate = new Date(fecha_vencimiento);
    const reminderTime = new Date(dueDate);
    reminderTime.setDate(reminderTime.getDate() - 1); // 1 día antes
    
    if (reminderTime > new Date()) {
      await this.scheduleLocalNotification(
        'Pago Pendiente',
        `Recordatorio: Pago de $${monto} de ${paciente.nombre} ${paciente.apellido} vence mañana`,
        { paymentId: id, type: 'payment_reminder' },
        { date: reminderTime }
      );
    }
  }

  // Programar notificación de reporte generado
  async scheduleReportNotification(report) {
    await this.scheduleLocalNotification(
      'Reporte Generado',
      `El reporte ${report.tipo} ha sido generado exitosamente`,
      { reportId: report.id, type: 'report_generated' }
    );
  }

  // Cancelar notificación
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancelar todas las notificaciones
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Configurar listeners
  setupNotificationListeners() {
    // Listener para notificaciones recibidas
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listener para respuestas a notificaciones
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;
      
      // Manejar diferentes tipos de notificaciones
      switch (data.type) {
        case 'appointment_reminder':
        case 'appointment_urgent':
          // Navegar a la cita
          break;
        case 'payment_reminder':
          // Navegar al pago
          break;
        case 'report_generated':
          // Navegar al reporte
          break;
        default:
          break;
      }
    });
  }

  // Limpiar listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Obtener notificaciones programadas
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Obtener el token de push
  getExpoPushToken() {
    return this.expoPushToken;
  }
}

export default new NotificationService();
