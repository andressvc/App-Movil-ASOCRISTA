# 🏥 ASOCRISTA - Centro Médico

Sistema de gestión integral para centros médicos desarrollado con React Native y Node.js.

## 📋 Características Principales

### 👥 Gestión de Pacientes
- Registro completo de información personal
- Historial médico
- Códigos únicos de identificación
- Búsqueda avanzada

### 📅 Sistema de Citas
- Programación de citas médicas
- Diferentes tipos de citas (terapia individual, grupal, eventos especiales)
- Control de conflictos de horarios
- Estados de citas (programada, en proceso, completada, cancelada)

### 💰 Control Financiero
- Registro de ingresos y egresos
- Categorización de movimientos
- Balance diario automático
- Historial financiero completo

### 📊 Reportes Automatizados
- Generación de reportes diarios en PDF
- Estadísticas detalladas
- Envío automático por email
- Historial de reportes

### 🔐 Seguridad
- Autenticación JWT
- Encriptación de contraseñas
- Roles de usuario (Admin, Coordinador, Asistente)
- Autenticación biométrica

### 📱 Funcionalidades Móviles
- Escáner QR para códigos de pacientes
- Notificaciones push
- Gestión de archivos (fotos/documentos)
- Modo oscuro/claro
- Sincronización en tiempo real

## 🛠️ Tecnologías Utilizadas

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

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- MySQL (v8 o superior)
- Expo CLI
- Git

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/asocrista-centro-medico.git
cd asocrista-centro-medico
```

### 2. Configurar Backend
```bash
cd backend
npm install
cp env.example .env
# Editar .env con tus configuraciones
npm run dev
```

### 3. Configurar Base de Datos
```sql
CREATE DATABASE centro_medico;
-- El sistema creará automáticamente las tablas al iniciar
```

### 4. Configurar Frontend
```bash
cd frontend
npm install
npx expo start
```

## 📱 Uso de la Aplicación

### Usuario Administrador por Defecto
- **Email:** admin@asocrista.com
- **Contraseña:** admin123
- ⚠️ **Cambiar contraseña después del primer login**

### Funcionalidades Principales

1. **Dashboard:** Vista general con estadísticas del día
2. **Pacientes:** Gestión completa de pacientes
3. **Citas:** Programación y seguimiento de citas
4. **Finanzas:** Control de ingresos y egresos
5. **Reportes:** Generación y visualización de reportes
6. **Perfil:** Configuración personal y de la aplicación

## 🔧 Configuración Avanzada

### Variables de Entorno (.env)
```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=centro_medico
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

# Servidor
PORT=3000
JWT_SECRET=tu_jwt_secret_seguro

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

### Configuración de IP para Desarrollo Móvil
En `frontend/src/constants/Config.local.js`:
```javascript
// Cambiar por la IP de tu máquina
return 'http://192.168.1.100:3000/api';
```

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Obtener perfil
- `PUT /api/auth/perfil` - Actualizar perfil
- `PUT /api/auth/cambiar-password` - Cambiar contraseña

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Crear paciente
- `GET /api/pacientes/:id` - Obtener paciente
- `PUT /api/pacientes/:id` - Actualizar paciente
- `DELETE /api/pacientes/:id` - Eliminar paciente

### Citas
- `GET /api/citas` - Listar citas
- `POST /api/citas` - Crear cita
- `PUT /api/citas/:id` - Actualizar cita
- `PATCH /api/citas/:id/estado` - Cambiar estado
- `DELETE /api/citas/:id` - Eliminar cita

### Finanzas
- `GET /api/movimientos` - Listar movimientos
- `POST /api/movimientos` - Crear movimiento
- `GET /api/movimientos/balance/:fecha` - Balance diario
- `GET /api/movimientos/historial` - Historial financiero

### Reportes
- `POST /api/reportes/generar/:fecha` - Generar reporte
- `GET /api/reportes` - Listar reportes
- `GET /api/reportes/:id` - Obtener reporte

## 🔒 Seguridad

- Contraseñas encriptadas con bcryptjs
- Tokens JWT con expiración de 24 horas
- Validación de entrada en todos los endpoints
- Headers de seguridad con Helmet
- Rate limiting implementado
- CORS configurado

## 📈 Características Técnicas

- **Arquitectura:** MVC con separación de responsabilidades
- **Base de Datos:** Relaciones bien definidas con Sequelize
- **API:** RESTful con respuestas consistentes
- **Frontend:** Componentes reutilizables y hooks personalizados
- **Estado:** Context API para gestión global
- **Navegación:** Stack y Tab navigators
- **UI/UX:** Material Design con temas personalizables

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- **Email:** soporte@asocrista.com
- **Teléfono:** +1 (555) 123-4567

## 🎯 Roadmap

- [ ] Notificaciones push mejoradas
- [ ] Integración con sistemas de pago
- [ ] Dashboard con gráficos avanzados
- [ ] Exportación de datos
- [ ] API para integraciones externas
- [ ] Aplicación web complementaria

---

**Desarrollado con ❤️ para la salud de la comunidad**
