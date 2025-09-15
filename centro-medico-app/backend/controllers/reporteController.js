// controllers/reporteController.js
const { Reporte, Paciente, Cita, MovimientoFinanciero, User } = require('../models');
const { Op } = require('sequelize');
const puppeteer = require('puppeteer');
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

    if (reporte) {
      return res.json({
        success: true,
        message: 'Reporte ya existe para esta fecha',
        data: { reporte }
      });
    }

    // Obtener datos del día
    const datosDia = await obtenerDatosDelDia(fecha, usuario_id);

    // Crear reporte en la base de datos
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

    // Generar PDF
    const rutaPDF = await generarPDFReporte(reporte, datosDia);

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
  // Obtener pacientes únicos del día
  const pacientesDelDia = await Paciente.findAll({
    include: [{
      model: Cita,
      as: 'citas',
      where: { fecha },
      attributes: []
    }],
    where: { activo: true }
  });

  // Obtener citas del día
  const citasDelDia = await Cita.findAll({
    where: { fecha },
    include: [{
      model: Paciente,
      as: 'paciente',
      attributes: ['id', 'nombre', 'apellido']
    }]
  });

  // Obtener movimientos financieros del día
  const movimientosDelDia = await MovimientoFinanciero.findAll({
    where: { fecha, usuario_id }
  });

  // Calcular estadísticas
  const totalPacientes = pacientesDelDia.length;
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

// Función para generar PDF del reporte
const generarPDFReporte = async (reporte, datos) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Crear directorio de reportes si no existe
    const reportesDir = path.join(__dirname, '../reportes');
    await fs.mkdir(reportesDir, { recursive: true });

    // Generar HTML del reporte
    const html = generarHTMLReporte(reporte, datos);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const nombreArchivo = `reporte_${reporte.fecha}_${Date.now()}.pdf`;
    const rutaArchivo = path.join(reportesDir, nombreArchivo);

    await page.pdf({
      path: rutaArchivo,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    return rutaArchivo;

  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw error;
  }
};

// Función para generar HTML del reporte
const generarHTMLReporte = (reporte, datos) => {
  const fechaFormateada = new Date(reporte.fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Diario - ${fechaFormateada}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 28px;
            }
            .header h2 {
                color: #666;
                margin: 10px 0 0 0;
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
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #007bff;
            }
            .stat-card h3 {
                margin: 0 0 10px 0;
                color: #333;
                font-size: 16px;
            }
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
            }
            .section {
                margin-bottom: 30px;
            }
            .section h3 {
                color: #333;
                border-bottom: 2px solid #007bff;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .table th, .table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .table th {
                background-color: #007bff;
                color: white;
                font-weight: bold;
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
                <h1>Reporte Diario</h1>
                <h2>Centro Médico ASOCRISTA - ${fechaFormateada}</h2>
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
                    <div class="stat-value">$${reporte.total_ingresos.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <h3>Total Egresos</h3>
                    <div class="stat-value">$${reporte.total_egresos.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <h3>Balance Diario</h3>
                    <div class="stat-value" style="color: ${reporte.balance_diario >= 0 ? '#28a745' : '#dc3545'}">
                        $${reporte.balance_diario.toFixed(2)}
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
                        ${datos.citas.map(cita => `
                            <tr>
                                <td>${cita.hora_inicio} - ${cita.hora_fin}</td>
                                <td>${cita.paciente.nombre} ${cita.paciente.apellido}</td>
                                <td>${cita.tipo.replace('_', ' ').toUpperCase()}</td>
                                <td class="status-${cita.estado}">${cita.estado.replace('_', ' ').toUpperCase()}</td>
                            </tr>
                        `).join('')}
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
                        ${datos.movimientos.map(mov => `
                            <tr>
                                <td>${mov.tipo.toUpperCase()}</td>
                                <td>${mov.descripcion}</td>
                                <td>$${parseFloat(mov.monto).toFixed(2)}</td>
                                <td>${mov.metodo_pago || 'N/A'}</td>
                            </tr>
                        `).join('')}
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

module.exports = {
  generarReporteDiario,
  obtenerReportes,
  obtenerReporte
};
