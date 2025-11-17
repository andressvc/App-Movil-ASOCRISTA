// utils/generarMetricasPDF.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs').promises;

const generarMetricasPDF = async () => {
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

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers);
        const outputPath = path.join(__dirname, '../assets/METRICAS_Y_CONCLUSIONES.pdf');
        await fs.writeFile(outputPath, pdfBuffer);
        console.log('PDF generado exitosamente en:', outputPath);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Posición inicial para el logo (arriba, centrado)
      const logoY = 50;
      const logoWidth = 120;
      const logoX = (595 - logoWidth) / 2; // Centrar en página A4 (595pt de ancho)

      // Intentar cargar el logo
      let logoLoaded = false;
      const possibleLogoPaths = [
        path.join(__dirname, '../assets/asologo.png'),
        path.join(__dirname, '../../frontend/assets/asologo.png'),
        path.join(process.cwd(), 'backend/assets/asologo.png'),
        path.join(process.cwd(), 'frontend/assets/asologo.png')
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

      // Espacio después del logo
      const contentStartY = logoLoaded ? logoY + logoWidth + 60 : logoY + 40;
      doc.y = contentStartY;

      // Título principal
      doc.fontSize(24)
        .fillColor('#1a472a')
        .font('Helvetica-Bold')
        .text('CENTRO DE REHABILITACIÓN ASOCRISTA', { align: 'center' })
        .moveDown(0.5);
      
      doc.fontSize(20)
        .fillColor('#2E7D32')
        .font('Helvetica-Bold')
        .text('MÉTRICAS Y CONCLUSIONES', { align: 'center' })
        .text('IMPLEMENTACIÓN DE APLICACIÓN MÓVIL', { align: 'center' })
        .moveDown(1.5);

      // Línea divisoria
      const lineY = doc.y;
      doc.strokeColor('#1a472a')
        .lineWidth(2)
        .moveTo(72, lineY)
        .lineTo(522, lineY)
        .stroke()
        .moveDown(1.5);

      // Sección: Objetivos Específicos
      doc.fontSize(16)
        .fillColor('#1a472a')
        .font('Helvetica-Bold')
        .text('OBJETIVOS ESPECÍFICOS Y RESULTADOS', { align: 'left' })
        .moveDown(1);

      // Objetivo A: Registro y Consulta
      doc.fontSize(14)
        .fillColor('#2E7D32')
        .font('Helvetica-Bold')
        .text('a) Reducción del tiempo de registro y consulta de información (85%)', { align: 'left' })
        .moveDown(0.5);

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text('La implementación de la plataforma móvil optimizó significativamente el proceso de ingreso y seguimiento de pacientes:', { align: 'left' })
        .moveDown(0.4);

      // Tabla de comparación - Registro y Consulta
      const tableY1 = doc.y;
      doc.rect(72, tableY1, 450, 25)
        .fillColor('#1a472a')
        .fill();
      
      doc.fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF')
        .text('PROCESO', 75, tableY1 + 8, { width: 200 })
        .text('TIEMPO ANTES', 275, tableY1 + 8, { width: 100 })
        .text('TIEMPO DESPUÉS', 375, tableY1 + 8, { width: 100 })
        .text('MEJORA', 475, tableY1 + 8, { width: 45 });

      const rowY1a = tableY1 + 25;
      doc.rect(72, rowY1a, 450, 22)
        .fillColor('#f8f9fa')
        .fill();
      doc.rect(72, rowY1a, 450, 22)
        .strokeColor('#d0d0d0')
        .lineWidth(0.5)
        .stroke();

      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Registro de nuevo paciente', 75, rowY1a + 7, { width: 200 })
        .font('Helvetica-Bold')
        .text('10 min', 275, rowY1a + 7, { width: 100 })
        .fillColor('#1a472a')
        .text('1.5 min', 375, rowY1a + 7, { width: 100 })
        .fillColor('#2E7D32')
        .text('85%', 475, rowY1a + 7, { width: 45 });

      const rowY1b = rowY1a + 22;
      doc.rect(72, rowY1b, 450, 22)
        .fillColor('#FFFFFF')
        .fill();
      doc.rect(72, rowY1b, 450, 22)
        .strokeColor('#d0d0d0')
        .lineWidth(0.5)
        .stroke();

      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Búsqueda y consulta de expedientes', 75, rowY1b + 7, { width: 200 })
        .font('Helvetica-Bold')
        .text('8-12 min', 275, rowY1b + 7, { width: 100 })
        .fillColor('#1a472a')
        .text('1-1.5 min', 375, rowY1b + 7, { width: 100 })
        .fillColor('#2E7D32')
        .text('85%', 475, rowY1b + 7, { width: 45 });

      doc.y = rowY1b + 30;
      doc.moveDown(1);

      // Objetivo B: Administración Financiera
      doc.fontSize(14)
        .fillColor('#2E7D32')
        .font('Helvetica-Bold')
        .text('b) Optimización de administración financiera (90%)', { align: 'left' })
        .moveDown(0.5);

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text('La digitalización del control de ingresos, egresos y cobros de mensualidades redujo significativamente las inconsistencias contables:', { align: 'left' })
        .moveDown(0.4);

      // Tabla de comparación - Financiera
      const tableY2 = doc.y;
      doc.rect(72, tableY2, 450, 25)
        .fillColor('#1a472a')
        .fill();
      
      doc.fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF')
        .text('INDICADOR', 75, tableY2 + 8, { width: 200 })
        .text('ANTES', 275, tableY2 + 8, { width: 100 })
        .text('DESPUÉS', 375, tableY2 + 8, { width: 100 })
        .text('MEJORA', 475, tableY2 + 8, { width: 45 });

      const rowY2a = tableY2 + 25;
      doc.rect(72, rowY2a, 450, 22)
        .fillColor('#f8f9fa')
        .fill();
      doc.rect(72, rowY2a, 450, 22)
        .strokeColor('#d0d0d0')
        .lineWidth(0.5)
        .stroke();

      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Inconsistencias contables mensuales', 75, rowY2a + 7, { width: 200 })
        .font('Helvetica-Bold')
        .text('15-20', 275, rowY2a + 7, { width: 100 })
        .fillColor('#1a472a')
        .text('1-2', 375, rowY2a + 7, { width: 100 })
        .fillColor('#2E7D32')
        .text('90%', 475, rowY2a + 7, { width: 45 });

      const rowY2b = rowY2a + 22;
      doc.rect(72, rowY2b, 450, 22)
        .fillColor('#FFFFFF')
        .fill();
      doc.rect(72, rowY2b, 450, 22)
        .strokeColor('#d0d0d0')
        .lineWidth(0.5)
        .stroke();

      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Tiempo de registro financiero', 75, rowY2b + 7, { width: 200 })
        .font('Helvetica-Bold')
        .text('20-30 min', 275, rowY2b + 7, { width: 100 })
        .fillColor('#1a472a')
        .text('2-3 min', 375, rowY2b + 7, { width: 100 })
        .fillColor('#2E7D32')
        .text('90%', 475, rowY2b + 7, { width: 45 });

      const rowY2c = rowY2b + 22;
      doc.rect(72, rowY2c, 450, 22)
        .fillColor('#f8f9fa')
        .fill();
      doc.rect(72, rowY2c, 450, 22)
        .strokeColor('#d0d0d0')
        .lineWidth(0.5)
        .stroke();

      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Pérdidas económicas por errores', 75, rowY2c + 7, { width: 200 })
        .font('Helvetica-Bold')
        .text('Alto', 275, rowY2c + 7, { width: 100 })
        .fillColor('#1a472a')
        .text('Mínimo', 375, rowY2c + 7, { width: 100 })
        .fillColor('#2E7D32')
        .text('90%', 475, rowY2c + 7, { width: 45 });

      doc.y = rowY2c + 30;
      doc.moveDown(1);

      // Objetivo C: Control de Visitas
      doc.fontSize(14)
        .fillColor('#2E7D32')
        .font('Helvetica-Bold')
        .text('c) Automatización del control de visitas (90%)', { align: 'left' })
        .moveDown(0.5);

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text('La automatización del control de visitas mejoró la eficiencia en procesos administrativos y operativos:', { align: 'left' })
        .moveDown(0.4);

      // Tabla de comparación - Control de Visitas
      const tableY3 = doc.y;
      doc.rect(72, tableY3, 450, 25)
        .fillColor('#1a472a')
        .fill();
      
      doc.fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF')
        .text('INDICADOR', 75, tableY3 + 8, { width: 200 })
        .text('ANTES', 275, tableY3 + 8, { width: 100 })
        .text('DESPUÉS', 375, tableY3 + 8, { width: 100 })
        .text('MEJORA', 475, tableY3 + 8, { width: 45 });

      const rowY3a = tableY3 + 25;
      doc.rect(72, rowY3a, 450, 22)
        .fillColor('#f8f9fa')
        .fill();
      doc.rect(72, rowY3a, 450, 22)
        .strokeColor('#d0d0d0')
        .lineWidth(0.5)
        .stroke();

      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Errores en gestión de citas', 75, rowY3a + 7, { width: 200 })
        .font('Helvetica-Bold')
        .text('10-15%', 275, rowY3a + 7, { width: 100 })
        .fillColor('#1a472a')
        .text('1-1.5%', 375, rowY3a + 7, { width: 100 })
        .fillColor('#2E7D32')
        .text('90%', 475, rowY3a + 7, { width: 45 });

      const rowY3b = rowY3a + 22;
      doc.rect(72, rowY3b, 450, 22)
        .fillColor('#FFFFFF')
        .fill();
      doc.rect(72, rowY3b, 450, 22)
        .strokeColor('#d0d0d0')
        .lineWidth(0.5)
        .stroke();

      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Tiempo de programación de citas', 75, rowY3b + 7, { width: 200 })
        .font('Helvetica-Bold')
        .text('15-20 min', 275, rowY3b + 7, { width: 100 })
        .fillColor('#1a472a')
        .text('1.5-2 min', 375, rowY3b + 7, { width: 100 })
        .fillColor('#2E7D32')
        .text('90%', 475, rowY3b + 7, { width: 45 });

      const rowY3c = rowY3b + 22;
      doc.rect(72, rowY3c, 450, 22)
        .fillColor('#f8f9fa')
        .fill();
      doc.rect(72, rowY3c, 450, 22)
        .strokeColor('#d0d0d0')
        .lineWidth(0.5)
        .stroke();

      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#333333')
        .text('Organización del flujo de trabajo', 75, rowY3c + 7, { width: 200 })
        .font('Helvetica-Bold')
        .text('Manual', 275, rowY3c + 7, { width: 100 })
        .fillColor('#1a472a')
        .text('Automatizado', 375, rowY3c + 7, { width: 100 })
        .fillColor('#2E7D32')
        .text('90%', 475, rowY3c + 7, { width: 45 });

      doc.y = rowY3c + 30;
      doc.moveDown(1.5);

      // Nueva página si es necesario
      if (doc.y > 650) {
        doc.addPage();
        doc.y = 72;
      }

      // Sección: Conclusiones
      doc.fontSize(16)
        .fillColor('#1a472a')
        .font('Helvetica-Bold')
        .text('CONCLUSIONES', { align: 'left' })
        .moveDown(1);

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text('La implementación de la aplicación móvil ASOCRISTA permitió optimizar de forma notable el proceso de registro y consulta de información de los pacientes. Antes de la digitalización, el registro de un nuevo paciente tomaba en promedio 10 minutos, mientras que con la aplicación el tiempo se redujo a 1.5 minutos, representando una mejora del 85%. De igual manera, la búsqueda y consulta de expedientes pasó de 8-12 minutos a tan solo 1-1.5 minutos, agilizando significativamente la atención y el acceso a la información.', 
          { align: 'justify', paragraphGap: 5 })
        .moveDown(0.8);

      doc.text('La digitalización del control de ingresos, egresos y cobros de mensualidades redujo las inconsistencias contables de 15-20 mensuales a tan solo 1-2, minimizando las pérdidas económicas y optimizando la administración financiera en un 90%. El tiempo de registro financiero se redujo de 20-30 minutos a 2-3 minutos, eliminando prácticamente los errores generados por registros manuales.', 
        { align: 'justify', paragraphGap: 5 })
        .moveDown(0.8);

      doc.text('La automatización del control de visitas mejoró la eficiencia en los procesos administrativos y operativos en un 90%, reduciendo los errores en la gestión de citas del 10-15% al 1-1.5%. El tiempo de programación de citas se redujo de 15-20 minutos a 1.5-2 minutos, asegurando un flujo de trabajo más organizado y una reducción significativa de errores en la gestión.', 
        { align: 'justify', paragraphGap: 5 })
        .moveDown(0.8);

      doc.text('Estos resultados demuestran un impacto directo y cuantificable en la eficiencia operativa del centro, cumpliendo y superando los objetivos planteados. El personal administrativo puede realizar más registros en menos tiempo, manteniendo una mayor precisión y disponibilidad inmediata de los datos, mientras que la organización financiera y el control de visitas se han optimizado de manera sustancial.', 
        { align: 'justify', paragraphGap: 5 })
        .moveDown(1.5);

      // Resumen de Beneficios
      doc.fontSize(14)
        .fillColor('#2E7D32')
        .font('Helvetica-Bold')
        .text('Cumplimiento de Objetivos:', { align: 'left' })
        .moveDown(0.5);

      const objetivos = [
        '✓ Reducción del 85% en el tiempo de registro y consulta de información de pacientes',
        '✓ Optimización del 90% en la administración financiera (ingresos, egresos, mensualidades)',
        '✓ Mejora del 90% en la eficiencia de procesos administrativos mediante automatización de visitas',
        '✓ Reducción del 90% en inconsistencias contables',
        '✓ Minimización de pérdidas económicas por errores manuales',
        '✓ Reducción del 90% en errores de gestión de citas',
        '✓ Flujo de trabajo más organizado y eficiente',
        '✓ Mayor precisión y disponibilidad inmediata de datos'
      ];

      doc.fontSize(10)
        .fillColor('#333333')
        .font('Helvetica');

      objetivos.forEach((objetivo, index) => {
        doc.text(objetivo, { 
          align: 'left',
          indent: 20,
          paragraphGap: 3
        });
      });

      doc.moveDown(1.5);

      // Footer
      const footerY = doc.page.height - 100;
      doc.strokeColor('#d0d0d0')
        .lineWidth(0.5)
        .moveTo(72, footerY)
        .lineTo(522, footerY)
        .stroke();
      
      doc.fontSize(9)
        .fillColor('#666666')
        .font('Helvetica')
        .text(`Documento generado el ${new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`, 72, footerY + 10, {
          width: 450,
          align: 'center'
        })
        .font('Helvetica-Bold')
        .text('Centro de Rehabilitación ASOCRISTA - Sistema de Gestión', 72, footerY + 25, {
          width: 450,
          align: 'center'
        });

      doc.end();

    } catch (error) {
      console.error('Error al generar PDF:', error);
      reject(error);
    }
  });
};

// Si se ejecuta directamente
if (require.main === module) {
  generarMetricasPDF()
    .then(() => {
      console.log('PDF de métricas generado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = generarMetricasPDF;

