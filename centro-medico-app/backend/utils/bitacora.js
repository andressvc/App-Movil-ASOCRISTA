const { Bitacora } = require('../models');

async function logBitacora(req, { accion, descripcion, entidad, entidad_id, metadata }) {
  try {
    if (!req || !req.usuario || !req.usuario.id) return;
    if (!accion) return;
    await Bitacora.create({
      usuario_id: req.usuario.id,
      accion,
      descripcion: descripcion || null,
      entidad: entidad || null,
      entidad_id: entidad_id || null,
      metadata: metadata || null
    });
  } catch (e) {
    // No romper flujo por errores de bitácora
    console.error('Bitácora error (ignorado):', e.message);
  }
}

module.exports = { logBitacora };


