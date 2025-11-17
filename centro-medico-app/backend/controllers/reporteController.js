// controllers/reporteController.js
const { Reporte, Paciente, Cita, MovimientoFinanciero, User } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const { uploadPdfBuffer, isConfigured: cloudinaryConfigured } = require('../services/cloudinaryService');
const { logBitacora } = require('../utils/bitacora');
const path = require('path');
const fs = require('fs').promises;

// REQ5 - Generar reporte diario
const generarReporteDiario = async (req, res) => {
  try {
    const { fecha } = req.params;
    const usuario_id = req.usuario.id;

    // Validar fecha
    if (!fecha) {
      return res.status(400).json({
        success: false,
        message: 'La fecha es requerida'
      });
    }

    // Verificar si ya existe un reporte para esta fecha
    let reporte = await Reporte.findOne({
      where: { fecha, usuario_id }
    });

    // Obtener datos del día (siempre en vivo desde la BD)
    const datosDia = await obtenerDatosDelDia(fecha, usuario_id);

    if (reporte) {
      // Si existe, actualizar con los datos actuales
      await reporte.update({
        total_pacientes: datosDia.totalPacientes,
        total_citas: datosDia.totalCitas,
        citas_completadas: datosDia.citasCompletadas,
        citas_canceladas: datosDia.citasCanceladas,
        total_ingresos: datosDia.totalIngresos,
        total_egresos: datosDia.totalEgresos,
        balance_diario: datosDia.balanceDiario
      });
    } else {
      // Si no existe, crearlo
      reporte = await Reporte.create({
        fecha,
        usuario_id,
        total_pacientes: datosDia.totalPacientes,
        total_citas: datosDia.totalCitas,
        citas_completadas: datosDia.citasCompletadas,
        citas_canceladas: datosDia.citasCanceladas,
        total_ingresos: datosDia.totalIngresos,
        total_egresos: datosDia.totalEgresos,
        balance_diario: datosDia.balanceDiario
      });
    }

    // Generar PDF actualizado
    const pdfBuffer = await generarPDFReporte(reporte, datosDia);

    // Guardar localmente
    const reportesDir = path.join(__dirname, '../reportes');
    await fs.mkdir(reportesDir, { recursive: true });
    const nombreArchivo = `reporte_${reporte.fecha}_${Date.now()}.pdf`;
    const rutaLocal = path.join(reportesDir, nombreArchivo);
    await fs.writeFile(rutaLocal, pdfBuffer);
    const rutaPDF = `/reportes/${nombreArchivo}`; // Ruta relativa para el navegador

    // Actualizar reporte con ruta del archivo
    await reporte.update({ ruta_archivo: rutaPDF });

    res.json({
      success: true,
      message: 'Reporte diario generado exitosamente',
      data: { 
        reporte,
        rutaPDF,
        datos: datosDia
      }
    });

    // Bitácora
    logBitacora(req, {
      accion: 'reporte_generado',
      descripcion: `Reporte diario generado ${reporte.fecha}`,
      entidad: 'reporte',
      entidad_id: reporte.id,
      metadata: { fecha: reporte.fecha }
    });

  } catch (error) {
    console.error('Error al generar reporte diario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función auxiliar para obtener datos del día
const obtenerDatosDelDia = async (fecha, usuario_id) => {
  // Obtener citas del día del usuario
  const citasDelDia = await Cita.findAll({
    where: { fecha, usuario_id },
    include: [{
      model: Paciente,
      as: 'paciente',
      attributes: ['id', 'nombre', 'apellido'],
      where: { activo: true },
      required: false
    }]
  });

  // Obtener pacientes únicos que tienen citas en el día (pacientes atendidos)
  const pacientesUnicos = new Set(citasDelDia.map(c => c.paciente_id).filter(Boolean));
  const totalPacientes = pacientesUnicos.size;

  // Obtener movimientos financieros del día
  const movimientosDelDia = await MovimientoFinanciero.findAll({
    where: { fecha, usuario_id }
  });

  // Calcular estadísticas
  const totalCitas = citasDelDia.length;
  const citasCompletadas = citasDelDia.filter(c => c.estado === 'completada').length;
  const citasCanceladas = citasDelDia.filter(c => c.estado === 'cancelada').length;
  
  const totalIngresos = movimientosDelDia
    .filter(m => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + parseFloat(m.monto), 0);
  
  const totalEgresos = movimientosDelDia
    .filter(m => m.tipo === 'egreso')
    .reduce((sum, m) => sum + parseFloat(m.monto), 0);
  
  const balanceDiario = totalIngresos - totalEgresos;

  return {
    totalPacientes,
    totalCitas,
    citasCompletadas,
    citasCanceladas,
    totalIngresos,
    totalEgresos,
    balanceDiario,
    citas: citasDelDia,
    movimientos: movimientosDelDia
  };
};

// Función para generar PDF del reporte como Buffer usando pdfkit
const generarPDFReporte = async (reporte, datos) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 72,
          left: 72,
          right: 72
        }
      });

      // Paleta de colores
      const colors = {
        primary: '#1E88E5',     // Azul principal
        secondary: '#42A5F5',   // Azul secundario
        lightBg: '#E3F2FD',     // Fondo celeste claro
        lightText: '#546E7A',   // Texto gris
        darkText: '#263238',    // Texto oscuro
        success: '#43A047',     // Verde para éxito
        danger: '#E53935',      // Rojo para errores
        border: '#BBDEFB'       // Borde celeste
      };

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Formatear fecha
      const fechaFormateada = new Date(reporte.fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Posición inicial para el logo (arriba, centrado)
      const logoY = 50;
      const logoWidth = 120;
      const logoX = (595 - logoWidth) / 2; // Centrar en página A4 (595pt de ancho)

      // Intentar cargar el logo desde diferentes ubicaciones posibles
      let logoLoaded = false;
      const possibleLogoPaths = [
        path.join(__dirname, '../../frontend/assets/asologo.png'),
        path.join(__dirname, '../assets/asologo.png'),
        path.join(__dirname, '../../assets/asologo.png'),
        path.join(process.cwd(), 'frontend/assets/asologo.png'),
        path.join(process.cwd(), 'assets/asologo.png')
      ];

      for (const logoPath of possibleLogoPaths) {
        try {
          if (require('fs').existsSync(logoPath)) {
            doc.image(logoPath, logoX, logoY, { width: logoWidth, align: 'center' });
            logoLoaded = true;
            break;
          }
        } catch (e) {
          // Continuar con el siguiente path
        }
      }

      // Espacio prudencial después del logo (60pt = ~2cm)
      const contentStartY = logoLoaded ? logoY + logoWidth + 60 : logoY + 40;

      // Posicionar el cursor al inicio del contenido
      doc.y = contentStartY;

      // Header con título
      doc.fontSize(22)
        .fillColor(colors.primary)
        .font('Helvetica-Bold')
        .text('CENTRO DE REHABILITACIÓN ASOCRISTA', { align: 'center' })
        .moveDown(0.4);
      
      doc.fontSize(18)
        .fillColor(colors.secondary)
        .font('Helvetica')
        .text('REPORTE DIARIO DE ACTIVIDADES', { align: 'center' })
        .moveDown(0.5);
      
      doc.fontSize(12)
        .fillColor(colors.lightText)
        .text(fechaFormateada, { align: 'center' })
        .moveDown(1.2);

      // Línea divisoria
      const lineY = doc.y;
      doc.strokeColor(colors.primary)
        .lineWidth(1.5)
        .moveTo(72, lineY)
        .lineTo(522, lineY)
        .stroke()
        .moveDown(0.3);
      
      doc.strokeColor(colors.secondary)
        .lineWidth(0.5)
        .moveTo(72, doc.y)
        .lineTo(522, doc.y)
        .stroke()
        .moveDown(1.8);

      // Título de sección de estadísticas
      doc.fontSize(14)
        .fillColor(colors.primary)
        .font('Helvetica-Bold')
        .text('RESUMEN ESTADÍSTICO', { align: 'left' })
        .moveDown(0.8);

      // Estadísticas en grid (2 columnas)
      const stats = [
        { title: 'Pacientes Atendidos', value: reporte.total_pacientes, icon: '👥' },
        { title: 'Total de Citas', value: reporte.total_citas, icon: '📅' },
        { title: 'Citas Completadas', value: reporte.citas_completadas, icon: '✅' },
        { title: 'Citas Canceladas', value: reporte.citas_canceladas, icon: '❌' },
        { title: 'Total Ingresos', value: `Q ${parseFloat(reporte.total_ingresos).toFixed(2)}`, icon: '💰' },
        { title: 'Total Egresos', value: `Q ${parseFloat(reporte.total_egresos).toFixed(2)}`, icon: '💸' },
        { 
          title: 'Balance Diario', 
          value: `Q ${parseFloat(reporte.balance_diario).toFixed(2)}`, 
          color: reporte.balance_diario >= 0 ? colors.success : colors.danger,
          icon: '📊' 
        }
      ];

      // Mostrar estadísticas en tarjetas
      let x = 72;
      let y = doc.y;
      const colWidth = 220;
      const rowHeight = 55;
      const startY = y;
      const gap = 10;

      stats.forEach((stat, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const currentX = x + (col * (colWidth + gap));
        const currentY = startY + (row * rowHeight);

        // Borde de la tarjeta
        doc.rect(currentX, currentY, colWidth, rowHeight)
          .strokeColor(colors.border)
          .lineWidth(0.5)
          .stroke();

        // Fondo de la tarjeta
        doc.rect(currentX + 1, currentY + 1, colWidth - 2, rowHeight - 2)
          .fillColor(colors.lightBg)
          .fill();

        // Título
        doc.fillColor(colors.darkText)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(stat.title.toUpperCase(), currentX + 12, currentY + 8, {
            width: colWidth - 24,
            align: 'left'
          });

        // Valor
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .fillColor(stat.color || colors.primary)
          .text(stat.value.toString(), currentX + 12, currentY + 22, {
            width: colWidth - 24,
            align: 'left'
          });
      });

      doc.y = startY + (Math.ceil(stats.length / 2) * rowHeight);
      doc.moveDown(1.5);

      // ===== SECCIÓN DE PACIENTES ATENDIDOS =====
      doc.addPage();
      doc.y = 72; // Posición inicial en la nueva página

      // Título de la sección
      doc.fontSize(14)
        .fillColor(colors.primary)
        .font('Helvetica-Bold')
        .text('PACIENTES ATENDIDOS', { align: 'left' })
        .moveDown(0.8);

      if (datos.citas && datos.citas.length > 0) {
        // Filtrar solo citas con pacientes
        const citasConPacientes = datos.citas.filter(cita => cita.paciente);
        
        if (citasConPacientes.length > 0) {
          // Encabezado de la tabla
          const tableHeaderY = doc.y;
          doc.rect(72, tableHeaderY, 450, 22)
            .fillColor(colors.primary)
            .fill();
          
          doc.fontSize(9)
            .font('Helvetica-Bold')
            .fillColor('#FFFFFF')
            .text('HORA', 75, tableHeaderY + 7, { width: 60 })
            .text('PACIENTE', 135, tableHeaderY + 7, { width: 150 })
            .text('EDAD', 285, tableHeaderY + 7, { width: 50 })
            .text('TELÉFONO', 335, tableHeaderY + 7, { width: 100 })
            .text('CONSULTA', 435, tableHeaderY + 7, { width: 85 });

          let tableY = tableHeaderY + 22;
          
          // Ordenar citas por hora
          citasConPacientes
            .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
            .forEach((cita, index) => {
              if (tableY > 700) {
                doc.addPage();
                tableY = 72;
                // Redibujar encabezado en nueva página
                doc.rect(72, tableY, 450, 22)
                  .fillColor(colors.primary)
                  .fill();
                doc.fontSize(9)
                  .font('Helvetica-Bold')
                  .fillColor('#FFFFFF')
                  .text('HORA', 75, tableY + 7, { width: 60 })
                  .text('PACIENTE', 135, tableY + 7, { width: 150 })
                  .text('EDAD', 285, tableY + 7, { width: 50 })
                  .text('TELÉFONO', 335, tableY + 7, { width: 100 })
                  .text('CONSULTA', 435, tableY + 7, { width: 85 });
                tableY += 22;
              }

              // Fondo de fila alternado
              const bgColor = index % 2 === 0 ? '#FFFFFF' : colors.lightBg;
              doc.rect(72, tableY, 450, 20)
                .fillColor(bgColor)
                .fill();

              // Borde de la celda
              doc.rect(72, tableY, 450, 20)
                .strokeColor(colors.border)
                .lineWidth(0.3)
                .stroke();

              // Calcular edad si hay fecha de nacimiento
              let edad = 'N/A';
              if (cita.paciente && cita.paciente.fecha_nacimiento) {
                const nacimiento = new Date(cita.paciente.fecha_nacimiento);
                const hoy = new Date();
                let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
                const m = hoy.getMonth() - nacimiento.getMonth();
                if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
                  edadCalculada--;
                }
                edad = edadCalculada;
              }

              // Contenido de la celda
              doc.fillColor(colors.darkText)
                .fontSize(9)
                .font('Helvetica')
                .text(cita.hora_inicio || '--:--', 75, tableY + 6, { width: 60 })
                .text(`${cita.paciente.nombre || ''} ${cita.paciente.apellido || ''}`, 135, tableY + 6, { width: 150 })
                .text(edad.toString(), 285, tableY + 6, { width: 50, align: 'center' })
                .text(cita.paciente.telefono || 'N/A', 335, tableY + 6, { width: 100 })
                .text((cita.tipo_consulta || 'Consulta').substring(0, 12), 435, tableY + 6, { width: 85 });

              tableY += 20;
            });
          doc.y = tableY;
        } else {
          doc.fontSize(10)
            .fillColor(colors.lightText)
            .text('No hay pacientes registrados para este día', { align: 'center' });
        }
      } else {
        doc.fontSize(10)
          .fillColor(colors.lightText)
          .text('No hay citas registradas para este día', { align: 'center' });
      }

      // ===== SECCIÓN DE CITAS DEL DÍA =====
      doc.addPage();
      doc.y = 72; // Posición inicial en la nueva página

      doc.fontSize(14)
        .fillColor(colors.primary)
        .font('Helvetica-Bold')
        .text('CITAS DEL DÍA', { align: 'left' })
        .moveDown(0.8);

      if (datos.citas && datos.citas.length > 0) {
        // Encabezado de la tabla
        const tableHeaderY = doc.y;
        doc.rect(72, tableHeaderY, 450, 22)
          .fillColor(colors.primary)
          .fill();
        
        doc.fontSize(9)
          .font('Helvetica-Bold')
          .fillColor('#FFFFFF')
          .text('HORA', 75, tableHeaderY + 7, { width: 80 })
          .text('PACIENTE', 155, tableHeaderY + 7, { width: 150 })
          .text('TIPO', 305, tableHeaderY + 7, { width: 100 })
          .text('ESTADO', 405, tableHeaderY + 7, { width: 115 });

        let tableY = tableHeaderY + 22;
        
        // Ordenar citas por hora
        datos.citas
          .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
          .forEach((cita, index) => {
            if (tableY > 700) {
              doc.addPage();
              tableY = 72;
              // Redibujar encabezado en nueva página
              doc.rect(72, tableY, 450, 22)
                .fillColor(colors.primary)
                .fill();
              doc.fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#FFFFFF')
                .text('HORA', 75, tableY + 7, { width: 80 })
                .text('PACIENTE', 155, tableY + 7, { width: 150 })
                .text('TIPO', 305, tableY + 7, { width: 100 })
                .text('ESTADO', 405, tableY + 7, { width: 115 });
              tableY += 22;
            }

            // Fondo de fila alternado
            const bgColor = index % 2 === 0 ? '#FFFFFF' : colors.lightBg;
            doc.rect(72, tableY, 450, 20)
              .fillColor(bgColor)
              .fill();

            // Borde de la celda
            doc.rect(72, tableY, 450, 20)
              .strokeColor(colors.border)
              .lineWidth(0.3)
              .stroke();

            // Contenido de la celda
            doc.fillColor(colors.darkText)
              .fontSize(9)
              .font('Helvetica')
              .text(`${cita.hora_inicio || ''} - ${cita.hora_fin || ''}`, 75, tableY + 6, { width: 80 })
              .text(cita.paciente ? `${cita.paciente.nombre || ''} ${cita.paciente.apellido || ''}` : 'Sin paciente', 155, tableY + 6, { width: 150 })
              .text((cita.tipo || '').replace('_', ' ').toUpperCase(), 305, tableY + 6, { width: 100 });

            // Color según estado
            const estadoColor = cita.estado === 'completada' ? colors.success : 
                             cita.estado === 'cancelada' ? colors.danger : colors.warning;
            
            doc.font('Helvetica-Bold')
              .fillColor(estadoColor)
              .text((cita.estado || 'programada').replace('_', ' ').toUpperCase(), 405, tableY + 6, { width: 115 });

            tableY += 20;
          });
        doc.y = tableY;
      } else {
        doc.fontSize(10)
          .fillColor(colors.lightText)
          .text('No hay citas registradas para este día', { align: 'center' });
      }

      // ===== SECCIÓN DE MOVIMIENTOS FINANCIEROS =====
      doc.addPage();
      doc.y = 72; // Posición inicial en la nueva página

      doc.fontSize(14)
        .fillColor(colors.primary)
        .font('Helvetica-Bold')
        .text('MOVIMIENTOS FINANCIEROS', { align: 'left' })
        .moveDown(0.8);

      if (datos.movimientos && datos.movimientos.length > 0) {
        // Encabezado de la tabla
        const tableHeaderY = doc.y;
        doc.rect(72, tableHeaderY, 450, 22)
          .fillColor(colors.primary)
          .fill();
        
        doc.fontSize(9)
          .font('Helvetica-Bold')
          .fillColor('#FFFFFF')
          .text('TIPO', 75, tableHeaderY + 7, { width: 80 })
          .text('DESCRIPCIÓN', 155, tableHeaderY + 7, { width: 200 })
          .text('MONTO', 355, tableHeaderY + 7, { width: 80 })
          .text('MÉTODO', 435, tableHeaderY + 7, { width: 85 });

        let tableY = tableHeaderY + 22;
        
        datos.movimientos.forEach((mov, index) => {
          if (tableY > 700) {
            doc.addPage();
            tableY = 72;
            // Redibujar encabezado en nueva página
            doc.rect(72, tableY, 450, 22)
              .fillColor(colors.primary)
              .fill();
            doc.fontSize(9)
              .font('Helvetica-Bold')
              .fillColor('#FFFFFF')
              .text('TIPO', 75, tableY + 7, { width: 80 })
              .text('DESCRIPCIÓN', 155, tableY + 7, { width: 200 })
              .text('MONTO', 355, tableY + 7, { width: 80 })
              .text('MÉTODO', 435, tableY + 7, { width: 85 });
            tableY += 22;
          }

          // Fondo de fila alternado
          const bgColor = index % 2 === 0 ? '#FFFFFF' : colors.lightBg;
          doc.rect(72, tableY, 450, 20)
            .fillColor(bgColor)
            .fill();

          // Borde de la celda
          doc.rect(72, tableY, 450, 20)
            .strokeColor(colors.border)
            .lineWidth(0.3)
            .stroke();

          // Contenido de la celda
          doc.fillColor(colors.darkText)
            .fontSize(9)
            .font('Helvetica')
            .text((mov.tipo || '').toUpperCase(), 75, tableY + 6, { width: 80 })
            .text(mov.descripcion || 'Sin descripción', 155, tableY + 6, { width: 200 })
            .font('Helvetica-Bold')
            .fillColor(mov.tipo === 'ingreso' ? colors.success : colors.danger)
            .text(`Q ${parseFloat(mov.monto || 0).toFixed(2)}`, 355, tableY + 6, { width: 80 })
            .font('Helvetica')
            .fillColor(colors.darkText)
            .text(mov.metodo_pago || 'N/A', 435, tableY + 6, { width: 85 });

          tableY += 20;
        });
        doc.y = tableY;
      } else {
        doc.fontSize(10)
          .fillColor(colors.lightText)
          .text('No hay movimientos financieros registrados para este día', { align: 'center' });
      }

      // Pie de página
      doc.moveDown(2);
      const footerY = doc.page.height - 100;
      doc.strokeColor(colors.border)
        .lineWidth(0.5)
        .moveTo(72, footerY)
        .lineTo(522, footerY)
        .stroke();
      
      doc.fontSize(9)
        .fillColor(colors.lightText)
        .font('Helvetica')
        .text(`Reporte generado automáticamente el ${new Date().toLocaleString('es-ES')}`, 72, footerY + 10, {
          width: 450,
          align: 'center'
        })
        .font('Helvetica-Bold')
        .text('Centro de Rehabilitación ASOCRISTA - Sistema de Gestión', 72, footerY + 25, {
          width: 450,
          align: 'center',
          color: colors.primary
        });

      doc.end();

    } catch (error) {
      console.error('Error al generar PDF:', error);
      reject(error);
    }
  });
};

// Función para generar HTML del reporte con logo (NO USADA - Se usa pdfkit directamente)
// Mantenida por compatibilidad pero ya no se usa
const generarHTMLReporte = async (reporte, datos) => {
  const fechaFormateada = new Date(reporte.fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Intentar leer el logo y convertirlo a base64
  let logoBase64 = '';
  try {
    const logoPath = path.join(__dirname, '../../frontend/assets/asologo.png');
    const logoBuffer = await fs.readFile(logoPath);
    logoBase64 = logoBuffer.toString('base64');
  } catch (error) {
    console.log('Logo no encontrado, usando texto en su lugar');
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Diario - ${fechaFormateada}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 4px solid #2E7D32;
                padding-bottom: 25px;
                margin-bottom: 35px;
            }
            .logo-container {
                margin-bottom: 15px;
            }
            .logo {
                max-width: 150px;
                height: auto;
                margin-bottom: 10px;
            }
            .header h1 {
                color: #2E7D32;
                margin: 10px 0;
                font-size: 28px;
                font-weight: bold;
            }
            .header h2 {
                color: #555;
                margin: 5px 0 0 0;
                font-size: 18px;
                font-weight: normal;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin-bottom: 30px;
            }
            .stat-card {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 22px;
                border-radius: 10px;
                border-left: 5px solid #2E7D32;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                transition: transform 0.2s;
            }
            .stat-card h3 {
                margin: 0 0 12px 0;
                color: #333;
                font-size: 15px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .stat-value {
                font-size: 28px;
                font-weight: bold;
                color: #2E7D32;
            }
            .section {
                margin-bottom: 35px;
            }
            .section h3 {
                color: #2E7D32;
                border-bottom: 3px solid #2E7D32;
                padding-bottom: 12px;
                margin-bottom: 22px;
                font-size: 20px;
                font-weight: bold;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 25px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .table th, .table td {
                padding: 14px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .table th {
                background-color: #2E7D32;
                color: white;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 13px;
                letter-spacing: 0.5px;
            }
            .table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .status-completada { color: #28a745; font-weight: bold; }
            .status-cancelada { color: #dc3545; font-weight: bold; }
            .status-programada { color: #ffc107; font-weight: bold; }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                ${logoBase64 ? `<div class="logo-container"><img src="data:image/png;base64,${logoBase64}" class="logo" alt="ASOCRISTA Logo" /></div>` : ''}
                <h1>Centro de Rehabilitación ASOCRISTA</h1>
                <h2>Reporte diario</h2>
                <h2 style="margin-top: 8px; font-size: 16px;">${fechaFormateada}</h2>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Pacientes Atendidos</h3>
                    <div class="stat-value">${reporte.total_pacientes}</div>
                </div>
                <div class="stat-card">
                    <h3>Total de Citas</h3>
                    <div class="stat-value">${reporte.total_citas}</div>
                </div>
                <div class="stat-card">
                    <h3>Citas Completadas</h3>
                    <div class="stat-value">${reporte.citas_completadas}</div>
                </div>
                <div class="stat-card">
                    <h3>Citas Canceladas</h3>
                    <div class="stat-value">${reporte.citas_canceladas}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Ingresos</h3>
                    <div class="stat-value">Q ${parseFloat(reporte.total_ingresos).toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Egresos</h3>
                    <div class="stat-value">Q ${parseFloat(reporte.total_egresos).toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <h3>Balance Diario</h3>
                    <div class="stat-value" style="color: ${reporte.balance_diario >= 0 ? '#2E7D32' : '#dc3545'}">
                        Q ${parseFloat(reporte.balance_diario).toFixed(2)}
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>Citas del Día</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Paciente</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(datos.citas || []).map(cita => `
                            <tr>
                                <td>${cita.hora_inicio || ''} - ${cita.hora_fin || ''}</td>
                                <td>${cita.paciente ? `${cita.paciente.nombre || ''} ${cita.paciente.apellido || ''}` : 'Sin paciente'}</td>
                                <td>${(cita.tipo || '').replace('_', ' ').toUpperCase()}</td>
                                <td class="status-${cita.estado || 'programada'}">${(cita.estado || 'programada').replace('_', ' ').toUpperCase()}</td>
                            </tr>
                        `).join('')}
                        ${(!datos.citas || datos.citas.length === 0) ? '<tr><td colspan="4" style="text-align: center; padding: 20px;">No hay citas registradas para este día</td></tr>' : ''}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h3>Movimientos Financieros</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Monto</th>
                            <th>Método de Pago</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(datos.movimientos || []).map(mov => `
                            <tr>
                                <td>${(mov.tipo || '').toUpperCase()}</td>
                                <td>${mov.descripcion || 'Sin descripción'}</td>
                                <td>Q ${parseFloat(mov.monto || 0).toFixed(2)}</td>
                                <td>${mov.metodo_pago || 'N/A'}</td>
                            </tr>
                        `).join('')}
                        ${(!datos.movimientos || datos.movimientos.length === 0) ? '<tr><td colspan="4" style="text-align: center; padding: 20px;">No hay movimientos financieros registrados para este día</td></tr>' : ''}
                    </tbody>
                </table>
            </div>

            <div class="footer">
                <p>Reporte generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
                <p>Centro Médico ASOCRISTA - Sistema de Gestión</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Obtener reportes existentes
const obtenerReportes = async (req, res) => {
  try {
    const { page = 1, limit = 10, fechaInicio, fechaFin } = req.query;
    const usuario_id = req.usuario.id;
    const offset = (page - 1) * limit;

    // Construir filtros
    const filtros = { usuario_id };
    
    if (fechaInicio && fechaFin) {
      filtros.fecha = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    } else if (fechaInicio) {
      filtros.fecha = { [Op.gte]: fechaInicio };
    } else if (fechaFin) {
      filtros.fecha = { [Op.lte]: fechaFin };
    }

    const { count, rows: reportes } = await Reporte.findAndCountAll({
      where: filtros,
      order: [['fecha', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reportes,
        paginacion: {
          total: count,
          pagina: parseInt(page),
          limite: parseInt(limit),
          totalPaginas: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener reporte por ID
const obtenerReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const reporte = await Reporte.findOne({
      where: { id, usuario_id }
    });

    if (!reporte) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    res.json({
      success: true,
      data: { reporte }
    });

  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Descargar PDF del reporte
const descargarPDFReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const reporte = await Reporte.findOne({
      where: { id, usuario_id }
    });

    if (!reporte) {
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado'
      });
    }

    // Si tiene ruta_archivo (Cloudinary URL), redirigir a ella
    if (reporte.ruta_archivo && reporte.ruta_archivo.startsWith('http')) {
      return res.redirect(reporte.ruta_archivo);
    }

    // Si es ruta local, intentar servir el archivo
    if (reporte.ruta_archivo && !reporte.ruta_archivo.startsWith('http')) {
      try {
        await fs.access(reporte.ruta_archivo);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_${reporte.fecha}.pdf"`);
        return res.sendFile(path.resolve(reporte.ruta_archivo));
      } catch (error) {
        // Si no existe el archivo, generar uno nuevo
        console.log('Archivo PDF local no encontrado, generando uno nuevo...');
      }
    }

    // Generar PDF nuevo (ya sea porque no existe archivo o porque está en Cloudinary)
    console.log(`Generando PDF para reporte ID: ${id}, fecha: ${reporte.fecha}`);
    const datosDia = await obtenerDatosDelDia(reporte.fecha, usuario_id);
    
    let pdfBuffer;
    try {
      pdfBuffer = await generarPDFReporte(reporte, datosDia);
    } catch (pdfError) {
      console.error('Error específico al generar PDF:', pdfError);
      throw new Error(`No se pudo generar el PDF: ${pdfError.message}`);
    }

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${reporte.fecha}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error al descargar PDF:', error);
    console.error('Error detalles:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF del reporte',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar reporte
const actualizarReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;
    const datosActualizacion = req.body;

    const reporte = await Reporte.findOne({ where: { id, usuario_id } });
    if (!reporte) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }

    // Solo permitir actualizar ciertos campos
    const camposPermitidos = ['total_pacientes', 'total_citas', 'citas_completadas', 'citas_canceladas', 'total_ingresos', 'total_egresos', 'balance_diario'];
    const datosActualizados = {};
    
    Object.keys(datosActualizacion).forEach(key => {
      if (camposPermitidos.includes(key)) {
        datosActualizados[key] = datosActualizacion[key];
      }
    });

    await reporte.update(datosActualizados);

    res.json({ 
      success: true, 
      message: 'Reporte actualizado exitosamente',
      data: { reporte }
    });

    // Bitácora
    logBitacora(req, {
      accion: 'reporte_actualizado',
      descripcion: `Reporte ${id} actualizado`,
      entidad: 'reporte',
      entidad_id: id,
      metadata: datosActualizados
    });
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Eliminar reporte
const eliminarReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.usuario.id;

    const reporte = await Reporte.findOne({ where: { id, usuario_id } });
    if (!reporte) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }

    // Intentar eliminar archivo local si existe (ignorar errores)
    try {
      if (reporte.ruta_archivo && !reporte.ruta_archivo.startsWith('http')) {
        await fs.unlink(reporte.ruta_archivo).catch(() => {});
      }
    } catch (e) {}

    await reporte.destroy();
    res.json({ success: true, message: 'Reporte eliminado' });

    // Bitácora
    logBitacora(req, {
      accion: 'reporte_eliminado',
      descripcion: `Reporte ${id} eliminado`,
      entidad: 'reporte',
      entidad_id: id
    });
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = {
  generarReporteDiario,
  obtenerReportes,
  obtenerReporte,
  actualizarReporte,
  descargarPDFReporte,
  eliminarReporte
};
