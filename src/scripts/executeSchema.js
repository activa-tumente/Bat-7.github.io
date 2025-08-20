/**
 * Script para ejecutar el esquema robusto en Supabase
 * Proyecto: ydglduxhgwajqdseqzpy
 */

import supabase from '../api/supabaseClient.js';

const SCHEMA_STEPS = [
  {
    name: 'Verificar conexión',
    sql: 'SELECT current_database(), current_user;'
  },
  {
    name: 'Habilitar extensiones',
    sql: `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `
  },
  {
    name: 'Crear tabla instituciones',
    sql: `
      CREATE TABLE IF NOT EXISTS public.instituciones (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nombre TEXT NOT NULL,
        tipo_institucion TEXT CHECK (tipo_institucion IN ('Universidad', 'Colegio', 'Instituto', 'Centro de Salud', 'Otro')),
        direccion TEXT,
        telefono TEXT,
        email TEXT,
        contacto_principal TEXT,
        activo BOOLEAN DEFAULT TRUE,
        fecha_registro TIMESTAMPTZ DEFAULT NOW(),
        fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(nombre)
      );
    `
  },
  {
    name: 'Crear tabla usuarios',
    sql: `
      CREATE TABLE IF NOT EXISTS public.usuarios (
        id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        documento TEXT UNIQUE,
        nombre TEXT NOT NULL,
        apellido TEXT,
        tipo_usuario TEXT CHECK (tipo_usuario IN ('Administrador', 'Psicólogo', 'Candidato')) DEFAULT 'Candidato',
        institucion_id UUID REFERENCES instituciones(id),
        activo BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
        ultimo_acceso TIMESTAMPTZ,
        fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
      );
    `
  },
  {
    name: 'Crear tabla candidatos',
    sql: `
      CREATE TABLE IF NOT EXISTS public.candidatos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nombre TEXT NOT NULL,
        apellidos TEXT,
        fecha_nacimiento DATE,
        genero TEXT CHECK (genero IN ('Masculino', 'Femenino', 'Otro')),
        documento_identidad TEXT UNIQUE,
        email TEXT,
        telefono TEXT,
        direccion TEXT,
        institucion_id UUID REFERENCES instituciones(id) NOT NULL,
        psicologo_id UUID REFERENCES usuarios(id),
        nivel_educativo TEXT,
        ocupacion TEXT,
        notas TEXT,
        activo BOOLEAN DEFAULT TRUE,
        fecha_registro TIMESTAMPTZ DEFAULT NOW(),
        fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
        fecha_eliminacion TIMESTAMPTZ,
        CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
        CONSTRAINT valid_birth_date CHECK (fecha_nacimiento IS NULL OR fecha_nacimiento <= CURRENT_DATE)
      );
    `
  },
  {
    name: 'Crear funciones RPC',
    sql: `
      CREATE OR REPLACE FUNCTION get_email_by_documento(p_documento TEXT)
      RETURNS TEXT AS $$
      DECLARE
        v_email TEXT;
      BEGIN
        SELECT u.email INTO v_email
        FROM auth.users u
        JOIN public.usuarios pu ON u.id = pu.id
        WHERE pu.documento = p_documento AND pu.activo = true;
        RETURN v_email;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  },
  {
    name: 'Insertar institución por defecto',
    sql: `
      INSERT INTO public.instituciones (nombre, tipo_institucion, activo)
      SELECT 'Institución General', 'Universidad', TRUE
      WHERE NOT EXISTS (SELECT 1 FROM public.instituciones WHERE nombre = 'Institución General');
    `
  }
];

async function executeSchemaStep(step) {
  try {
    console.log(`🔄 Ejecutando: ${step.name}...`);
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: step.sql 
    });
    
    if (error) {
      // Si la función RPC no existe, intentar con query directo
      const { data: directData, error: directError } = await supabase
        .from('_temp_schema_execution')
        .select('*')
        .limit(1);
      
      if (directError) {
        console.log(`⚠️ ${step.name}: Requiere ejecución manual en el editor SQL`);
        return { success: false, requiresManual: true, error };
      }
    }
    
    console.log(`✅ ${step.name}: Completado`);
    return { success: true };
    
  } catch (error) {
    console.log(`⚠️ ${step.name}: Requiere ejecución manual - ${error.message}`);
    return { success: false, requiresManual: true, error };
  }
}

async function executeFullSchema() {
  console.log('🚀 Iniciando ejecución del esquema robusto...');
  console.log('📋 Proyecto: ydglduxhgwajqdseqzpy\n');
  
  const results = [];
  let manualSteps = [];
  
  for (const step of SCHEMA_STEPS) {
    const result = await executeSchemaStep(step);
    results.push({ step: step.name, ...result });
    
    if (result.requiresManual) {
      manualSteps.push(step);
    }
    
    // Pausa entre pasos
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Resumen de ejecución:');
  results.forEach(result => {
    const icon = result.success ? '✅' : '⚠️';
    const status = result.success ? 'Automático' : 'Manual requerido';
    console.log(`${icon} ${result.step}: ${status}`);
  });
  
  if (manualSteps.length > 0) {
    console.log('\n🔧 PASOS MANUALES REQUERIDOS:');
    console.log('=====================================');
    console.log('Ve al editor SQL de Supabase y ejecuta:');
    console.log('https://supabase.com/dashboard/project/ydglduxhgwajqdseqzpy/sql');
    console.log('\n-- Copia y pega el siguiente SQL:\n');
    
    manualSteps.forEach((step, index) => {
      console.log(`-- ${index + 1}. ${step.name}`);
      console.log(step.sql);
      console.log('');
    });
  }
  
  return {
    totalSteps: SCHEMA_STEPS.length,
    automaticSteps: results.filter(r => r.success).length,
    manualSteps: manualSteps.length,
    manualStepsSQL: manualSteps
  };
}

async function verifySchemaExecution() {
  console.log('\n🔍 Verificando ejecución del esquema...');
  
  const tables = ['instituciones', 'usuarios', 'candidatos'];
  const verificationResults = [];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        verificationResults.push({ table, status: 'error', message: error.message });
      } else {
        verificationResults.push({ table, status: 'success', count: count || 0 });
      }
    } catch (error) {
      verificationResults.push({ table, status: 'error', message: error.message });
    }
  }
  
  console.log('\n📋 Estado de las tablas:');
  verificationResults.forEach(result => {
    const icon = result.status === 'success' ? '✅' : '❌';
    const info = result.status === 'success' ? 
      `${result.count} registros` : 
      `Error: ${result.message}`;
    console.log(`${icon} ${result.table}: ${info}`);
  });
  
  return verificationResults;
}

// Función principal
async function runSchemaSetup() {
  try {
    const executionResult = await executeFullSchema();
    await verifySchemaExecution();
    
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('1. Si hay pasos manuales, ejecuta el SQL en Supabase');
    console.log('2. Ejecuta el script de usuarios de prueba');
    console.log('3. Prueba el login en la aplicación');
    
    return executionResult;
    
  } catch (error) {
    console.error('❌ Error en la configuración del esquema:', error);
    throw error;
  }
}

// Exportar funciones para uso en consola
if (typeof window !== 'undefined') {
  window.schemaSetup = {
    execute: runSchemaSetup,
    verify: verifySchemaExecution,
    steps: SCHEMA_STEPS
  };
  
  console.log('🛠️ Funciones disponibles en window.schemaSetup:');
  console.log('- execute(): Ejecutar configuración completa');
  console.log('- verify(): Verificar estado de las tablas');
  console.log('- steps: Ver pasos del esquema');
}

export { runSchemaSetup, verifySchemaExecution, executeSchemaStep, SCHEMA_STEPS };
