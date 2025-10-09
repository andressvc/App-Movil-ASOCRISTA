-- Script de migración para actualizar tipos de cita en Aiven
-- Ejecutar este script en la base de datos de Aiven

-- Modificar el ENUM de tipo en la tabla citas para incluir 'visita_familiar'
ALTER TABLE `citas` 
MODIFY COLUMN `tipo` ENUM('terapia_individual', 'terapia_grupal', 'evento_especial', 'consulta', 'visita_familiar') NOT NULL;

-- Verificar que se aplicó correctamente
SHOW COLUMNS FROM `citas` LIKE 'tipo';

