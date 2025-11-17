// utils/generarConclusionesPDF.js
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs').promises;

const generarConclusionesPDF = async () => {
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
        const outputPath = path.join(__dirname, '../assets/CONCLUSIONES.pdf');
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
        .text('CONCLUSIONES', { align: 'center' })
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

      // Introducción
      doc.fontSize(12)
        .fillColor('#333333')
        .font('Helvetica')
        .text('La implementación de la aplicación móvil ASOCRISTA ha demostrado resultados significativos en la optimización de los procesos operativos y administrativos del centro de rehabilitación. A continuación se presentan las conclusiones basadas en los objetivos planteados y los resultados obtenidos.', 
          { align: 'justify', paragraphGap: 5 })
        .moveDown(1.5);

      // Objetivo A
      doc.fontSize(16)
        .fillColor('#1a472a')
        .font('Helvetica-Bold')
        .text('a) Reducción del tiempo de registro y consulta de información (85%)', { align: 'left' })
        .moveDown(0.8);

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text('La implementación de la plataforma móvil permitió reducir el tiempo de registro y consulta de información de los pacientes en un 85%, optimizando significativamente el proceso de ingreso y seguimiento. Antes de la digitalización, el registro de un nuevo paciente tomaba en promedio 10 minutos, mientras que con la aplicación el tiempo se redujo a 1.5 minutos. De igual manera, la búsqueda y consulta de expedientes pasó de 8-12 minutos a tan solo 1-1.5 minutos, agilizando considerablemente la atención y el acceso a la información.', 
          { align: 'justify', paragraphGap: 5 })
        .moveDown(1);

      // Objetivo B
      doc.fontSize(16)
        .fillColor('#1a472a')
        .font('Helvetica-Bold')
        .text('b) Optimización de administración financiera (90%)', { align: 'left' })
        .moveDown(0.8);

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text('La digitalización del control de ingresos, egresos y cobros de mensualidades logró optimizar la administración financiera del negocio en un 90%, reduciendo significativamente las inconsistencias contables generadas por registros manuales. Las inconsistencias contables mensuales se redujeron de 15-20 a tan solo 1-2, minimizando las pérdidas económicas. El tiempo de registro financiero se redujo de 20-30 minutos a 2-3 minutos, eliminando prácticamente los errores generados por registros manuales y mejorando la precisión en el manejo de la información financiera.', 
          { align: 'justify', paragraphGap: 5 })
        .moveDown(1);

      // Objetivo C
      doc.fontSize(16)
        .fillColor('#1a472a')
        .font('Helvetica-Bold')
        .text('c) Mejora en eficiencia de procesos administrativos y operativos (90%)', { align: 'left' })
        .moveDown(0.8);

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text('La automatización del control de visitas mejoró la eficiencia en los procesos administrativos y operativos del centro en un 90%, asegurando un flujo de trabajo más organizado y una reducción significativa de errores en la gestión. Los errores en la gestión de citas se redujeron del 10-15% al 1-1.5%, mientras que el tiempo de programación de citas pasó de 15-20 minutos a 1.5-2 minutos. Esta automatización ha permitido una mejor organización del flujo de trabajo y una reducción sustancial de errores en la gestión diaria.', 
          { align: 'justify', paragraphGap: 5 })
        .moveDown(1.5);

      // Nueva página si es necesario
      if (doc.y > 650) {
        doc.addPage();
        doc.y = 72;
      }

      // Conclusiones Generales
      doc.fontSize(16)
        .fillColor('#1a472a')
        .font('Helvetica-Bold')
        .text('CONCLUSIONES GENERALES', { align: 'left' })
        .moveDown(1);

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text('Los resultados obtenidos demuestran un impacto directo y cuantificable en la eficiencia operativa del centro de rehabilitación ASOCRISTA. La implementación de la aplicación móvil ha cumplido y superado los objetivos planteados en cada una de las áreas evaluadas:', 
          { align: 'justify', paragraphGap: 5 })
        .moveDown(0.8);

      const logros = [
        'Reducción del 85% en el tiempo de registro y consulta de información de pacientes mediante la plataforma móvil',
        'Optimización del 90% en la administración financiera al digitalizar el control de ingresos, egresos y cobros de mensualidades',
        'Mejora del 90% en la eficiencia de procesos administrativos y operativos mediante la automatización del control de visitas',
        'Reducción significativa de inconsistencias contables (de 15-20 a 1-2 mensuales)',
        'Minimización de pérdidas económicas por errores en registros manuales',
        'Reducción del 90% en errores de gestión de citas',
        'Flujo de trabajo más organizado y eficiente',
        'Mayor precisión y disponibilidad inmediata de datos'
      ];

      doc.fontSize(10)
        .fillColor('#333333')
        .font('Helvetica');

      logros.forEach((logro, index) => {
        doc.text(`• ${logro}`, { 
          align: 'left',
          indent: 20,
          paragraphGap: 4
        });
      });

      doc.moveDown(1);

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text('El personal administrativo ahora puede realizar más registros en menos tiempo, manteniendo una mayor precisión y disponibilidad inmediata de los datos. La organización financiera y el control de visitas se han optimizado de manera sustancial, lo que se traduce en una mejora significativa en la calidad del servicio y en la eficiencia operativa del centro.', 
          { align: 'justify', paragraphGap: 5 })
        .moveDown(1);

      // Impacto Final
      doc.fontSize(14)
        .fillColor('#2E7D32')
        .font('Helvetica-Bold')
        .text('Impacto en la Organización', { align: 'left' })
        .moveDown(0.8);

      doc.fontSize(11)
        .fillColor('#333333')
        .font('Helvetica')
        .text('La implementación exitosa de la aplicación móvil ASOCRISTA ha transformado los procesos operativos del centro, estableciendo un nuevo estándar de eficiencia y precisión. Los porcentajes de mejora alcanzados (85% y 90%) no solo cumplen con los objetivos planteados, sino que establecen una base sólida para el crecimiento futuro y la mejora continua de los servicios ofrecidos a los pacientes.', 
          { align: 'justify', paragraphGap: 5 })
        .moveDown(1.5);

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
  generarConclusionesPDF()
    .then(() => {
      console.log('PDF de conclusiones generado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = generarConclusionesPDF;



