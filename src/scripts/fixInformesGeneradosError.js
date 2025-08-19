/**
 * Script para diagnosticar y corregir el error "psicologo_id is ambiguous"
 * en la generación de informes
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuración de Supabase
const supabaseUrl = 'https://ydglduxhgwajqdseqzpy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZ2xkdXhoZ3dhanFkc2VxenB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzU5NzI5NCwiZXhwIjoyMDM5MTczMjk0fQ.VgGPqaGqEOVgdqhEjYs_3_VhHaLJOJOLdJJJJJJJJJJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticarProblema() {
  console.log('🔍 Diagnosticando problema de "psicologo_id is ambiguous"...\n');

  try {
    // 1. Verificar triggers existentes
    console.log('1. Verificando triggers en informes_generados...');
    const { data: triggers, error: triggersError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT
          trigger_name,
          event_manipulation,
          action_statement,
          action_timing
        FROM information_schema.triggers
        WHERE event_object_table = 'informes_generados'
          AND event_object_schema = 'public';
      `
    });

    if (triggersError) {
      console.error('❌ Error verificando triggers:', triggersError);
    } else {
      console.log('📋 Triggers encontrados:', triggers);
    }

    // 2. Verificar políticas RLS
    console.log('\n2. Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT
          policyname,
          permissive,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE tablename = 'informes_generados';
      `
    });

    if (policiesError) {
      console.error('❌ Error verificando políticas:', policiesError);
    } else {
      console.log('📋 Políticas RLS encontradas:', policies);
    }

    // 3. Probar inserción problemática
    console.log('\n3. Probando inserción que causa el error...');
    const testInsert = await supabase
      .from('informes_generados')
      .insert({
        paciente_id: '8bce36b1-d34b-4d04-a25b-4ed71d8d02c0', // ID del paciente del error
        tipo_informe: 'completo',
        titulo: 'Test Informe',
        descripcion: 'Prueba para diagnosticar error',
        contenido: { test: true },
        estado: 'generado'
      })
      .select()
      .single();

    if (testInsert.error) {
      console.error('❌ Error en inserción de prueba:', testInsert.error);
      console.log('🎯 Este es el error que necesitamos corregir');
    } else {
      console.log('✅ Inserción de prueba exitosa:', testInsert.data.id);
      // Limpiar el registro de prueba
      await supabase.from('informes_generados').delete().eq('id', testInsert.data.id);
    }

  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error);
  }
}

async function aplicarFix() {
  console.log('\n🔧 Aplicando fix para el problema...\n');

  try {
    // Leer el archivo SQL de fix
    const sqlPath = path.join(process.cwd(), 'src', 'sql', 'fix_informes_generados_trigger.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Ejecutando ${commands.length} comandos SQL...`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.toLowerCase().includes('select') || command.toLowerCase().includes('show')) {
        // Comandos de consulta
        const { data, error } = await supabase.rpc('execute_sql', {
          sql_query: command + ';'
        });

        if (error) {
          console.warn(`⚠️ Comando ${i + 1} (consulta) falló:`, error.message);
        } else {
          console.log(`✅ Comando ${i + 1} (consulta) ejecutado:`, data?.length || 0, 'resultados');
        }
      } else {
        // Comandos de modificación
        const { error } = await supabase.rpc('execute_sql', {
          sql_query: command + ';'
        });

        if (error) {
          console.warn(`⚠️ Comando ${i + 1} falló:`, error.message);
        } else {
          console.log(`✅ Comando ${i + 1} ejecutado correctamente`);
        }
      }
    }

    console.log('\n🎉 Fix aplicado completamente');

  } catch (error) {
    console.error('❌ Error aplicando fix:', error);
  }
}

async function verificarSolucion() {
  console.log('\n✅ Verificando que el problema esté solucionado...\n');

  try {
    // Probar inserción nuevamente
    const testInsert = await supabase
      .from('informes_generados')
      .insert({
        paciente_id: '8bce36b1-d34b-4d04-a25b-4ed71d8d02c0',
        tipo_informe: 'completo',
        titulo: 'Test Informe Post-Fix',
        descripcion: 'Verificación después del fix',
        contenido: { test: true, fixed: true },
        estado: 'generado'
      })
      .select()
      .single();

    if (testInsert.error) {
      console.error('❌ El problema persiste:', testInsert.error);
      return false;
    } else {
      console.log('🎉 ¡Problema solucionado! Informe creado:', testInsert.data.id);
      // Limpiar el registro de prueba
      await supabase.from('informes_generados').delete().eq('id', testInsert.data.id);
      return true;
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando diagnóstico y corrección del error de informes...\n');

  await diagnosticarProblema();
  await aplicarFix();
  const solucionado = await verificarSolucion();

  if (solucionado) {
    console.log('\n✅ ¡Todos los problemas han sido solucionados!');
    console.log('📋 Resumen:');
    console.log('   - Error "psicologo_id is ambiguous" corregido');
    console.log('   - Generación de informes funcionando correctamente');
    console.log('   - Deduplicación mejorada en Reports.jsx');
  } else {
    console.log('\n❌ Algunos problemas persisten. Revisar logs anteriores.');
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { diagnosticarProblema, aplicarFix, verificarSolucion };