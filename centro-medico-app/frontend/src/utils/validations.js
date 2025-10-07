// utils/validations.js
export const ValidationRules = {
  // Validación de nombres (solo letras y espacios)
  name: (value) => {
    if (!value || value.trim().length === 0) {
      return 'Este campo es requerido';
    }
    if (value.trim().length < 2) {
      return 'Debe tener al menos 2 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)) {
      return 'Solo se permiten letras y espacios';
    }
    if (value.trim().length > 50) {
      return 'No puede exceder 50 caracteres';
    }
    return null;
  },

  // Validación de email
  email: (value) => {
    if (!value || value.trim().length === 0) {
      return 'El email es requerido';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'El email no es válido';
    }
    return null;
  },

  // Validación de teléfono
  phone: (value) => {
    if (!value || value.trim().length === 0) {
      return null; // Teléfono es opcional
    }
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'El teléfono no es válido';
    }
    return null;
  },

  // Validación de contraseña
  password: (value) => {
    if (!value || value.length === 0) {
      return 'La contraseña es requerida';
    }
    if (value.length < 6) {
      return 'Debe tener al menos 6 caracteres';
    }
    if (value.length > 50) {
      return 'No puede exceder 50 caracteres';
    }
    return null;
  },

  // Validación de edad
  age: (value) => {
    if (!value || value.trim().length === 0) {
      return null; // Edad es opcional
    }
    const age = parseInt(value);
    if (isNaN(age)) {
      return 'La edad debe ser un número';
    }
    if (age < 0) {
      return 'La edad no puede ser negativa';
    }
    if (age > 150) {
      return 'La edad no puede ser mayor a 150 años';
    }
    return null;
  },

  // Validación de fecha
  date: (value) => {
    if (!value || value.trim().length === 0) {
      return null; // Fecha es opcional
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'La fecha no es válida';
    }
    const today = new Date();
    if (date > today) {
      return 'La fecha no puede ser futura';
    }
    return null;
  },

  // Validación de fecha futura (para citas)
  futureDate: (value) => {
    if (!value || value.trim().length === 0) {
      return 'La fecha es requerida';
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'La fecha no es válida';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return 'La fecha no puede ser pasada';
    }
    return null;
  },

  // Validación de hora
  time: (value) => {
    if (!value || value.trim().length === 0) {
      return 'La hora es requerida';
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return 'La hora debe estar en formato HH:MM';
    }
    return null;
  },

  // Validación de monto - SIMPLIFICADA
  amount: (value) => {
    if (!value || value.trim().length === 0) {
      return 'El monto es requerido';
    }
    return null;
  },

  // Validación de descripción - SIMPLIFICADA
  description: (value) => {
    if (!value || value.trim().length === 0) {
      return 'La descripción es requerida';
    }
    return null;
  },

  // Validación de título
  title: (value) => {
    if (!value || value.trim().length === 0) {
      return 'El título es requerido';
    }
    if (value.trim().length < 3) {
      return 'Debe tener al menos 3 caracteres';
    }
    if (value.trim().length > 200) {
      return 'No puede exceder 200 caracteres';
    }
    return null;
  },

  // Validación de dirección
  address: (value) => {
    if (!value || value.trim().length === 0) {
      return null; // Dirección es opcional
    }
    if (value.trim().length < 5) {
      return 'Debe tener al menos 5 caracteres';
    }
    if (value.trim().length > 300) {
      return 'No puede exceder 300 caracteres';
    }
    return null;
  },

  // Validación de notas
  notes: (value) => {
    if (!value || value.trim().length === 0) {
      return null; // Notas son opcionales
    }
    if (value.trim().length > 1000) {
      return 'No puede exceder 1000 caracteres';
    }
    return null;
  },

  // Validación de historial médico
  medicalHistory: (value) => {
    if (!value || value.trim().length === 0) {
      return null; // Historial médico es opcional
    }
    if (value.trim().length > 2000) {
      return 'No puede exceder 2000 caracteres';
    }
    return null;
  },
};

// Función para validar un formulario completo
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];
    
    if (typeof rule === 'function') {
      const error = rule(value);
      if (error) {
        errors[field] = error;
      }
    } else if (typeof rule === 'object' && rule.validator) {
      const error = rule.validator(value);
      if (error) {
        errors[field] = error;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Función para limpiar texto (remover caracteres especiales)
export const cleanText = (text) => {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
};

// Función para formatear nombre (primera letra mayúscula)
export const formatName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Función para formatear teléfono
export const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

// Función para formatear monto
export const formatAmount = (amount) => {
  if (!amount) return '0.00';
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};
