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

#### Variables de entorno
Asegúrate de crear un archivo `.env` dentro de `backend/` con el siguiente contenido base:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=aso_crista

# JWT
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary (para guardar reportes PDF)
CLOUDINARY_CLOUD_NAME=dx52422xt
CLOUDINARY_API_KEY=484125292738435
CLOUDINARY_API_SECRET=REEMPLAZA_CON_TU_API_SECRET
```

- Los reportes PDF ahora se generan en memoria y se suben automáticamente a Cloudinary en la carpeta `reportes`.
- El campo `ruta_archivo` en la tabla `reportes` guarda la URL segura (`secure_url`) del PDF en Cloudinary.
- Asegúrate de no commitear el archivo `.env`.

### Base de Datos
- **MySQL** para persistencia de datos

### Requisitos para probarlo localmente
- Node.js (v16 o superior)
- MySQL (v8 o superior)
- Expo CLI
- Git


