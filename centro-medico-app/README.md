# ASOCRISTA

Sistema de gestión integral para un centro de rehabilitación desarrollado con React Native y Node.js.

## Características Principales

### Gestión de Pacientes
- Registro completo de información personal
- Historial médico
- Códigos únicos de identificación
- Búsqueda avanzada

### Sistema de Citas
- Programación de citas médicas
- Diferentes tipos de citas 
- Control de conflictos de horarios
- Estados de citas 

###  Control Financiero
- Registro de ingresos y egresos
- Categorización de movimientos
- Historial financiero completo

### Reportes Automatizados
- Generación de reportes diarios en PDF
- Estadísticas detalladas
- Historial de reportes

### Seguridad
- Autenticación JWT
- Encriptación de contraseñas
- Roles de usuario 

### Funcionalidades Móviles
- Notificaciones push
- Modo oscuro/claro
- Sincronización en tiempo real

## Tecnologías Utilizadas

### Frontend
- **React Native** con Expo
- **React Navigation** para navegación
- **Context API** para estado global
- **AsyncStorage** para persistencia local
- **Expo Notifications** para notificaciones
- **Expo Barcode Scanner** para QR
- **Expo Local Authentication** para biometría

### Backend
- **Node.js** con Express
- **Sequelize** ORM para MySQL
- **JWT** para autenticación
- **bcryptjs** para encriptación
- **Puppeteer** para generación de PDF
- **node-cron** para tareas programadas
- **Nodemailer** para emails

### Base de Datos
- **MySQL** para persistencia de datos

### Requisitos para probarlo localmente
- Node.js (v16 o superior)
- MySQL (v8 o superior)
- Expo CLI
- Git


