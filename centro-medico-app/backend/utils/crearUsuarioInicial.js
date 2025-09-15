// utils/crearUsuarioInicial.js
const { User } = require('../models');

const crearUsuarioInicial = async () => {
  try {
    // Verificar si ya existe un usuario admin
    const adminExistente = await User.findOne({ 
      where: { rol: 'admin' } 
    });

    if (adminExistente) {
      console.log('✅ Usuario administrador ya existe');
      return;
    }

    // Crear usuario admin inicial
    const admin = await User.create({
      nombre: 'Administrador',
      email: 'admin@asocrista.com',
      password: 'admin123',
      rol: 'admin'
    });

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📧 Email: admin@asocrista.com');
    console.log('🔑 Contraseña: admin123');
    console.log('⚠️  CAMBIAR CONTRASEÑA DESPUÉS DEL PRIMER LOGIN');

  } catch (error) {
    console.error('❌ Error al crear usuario inicial:', error);
  }
};

module.exports = crearUsuarioInicial;
