/**
 * Utilidad para verificar que los módulos de administración estén funcionando
 */

import supabase from '../api/supabaseClient';

export const verifyAdminModules = async () => {
  console.log('🔍 Verificando módulos de administración...');
  
  const results = {
    tables: {},
    functions: {},
    permissions: {},
    overall: 'pending'
  };

  try {
    // 1. Verificar tablas
    console.log('📋 Verificando tablas...');
    
    const requiredTables = [
      'role_permissions',
      'route_permissions',
      'user_activity_logs',
      'usage_statistics',
      'session_logs',
      'patient_assignments'
    ];

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          results.tables[table] = { status: 'error', message: error.message };
          console.error(`❌ Tabla ${table}: ${error.message}`);
        } else {
          results.tables[table] = { status: 'success', message: 'Tabla accesible' };
          console.log(`✅ Tabla ${table}: OK`);
        }
      } catch (error) {
        results.tables[table] = { status: 'error', message: error.message };
        console.error(`❌ Tabla ${table}: ${error.message}`);
      }
    }

    // 2. Verificar funciones RPC
    console.log('⚙️ Verificando funciones RPC...');
    
    const requiredFunctions = [
      { 
        name: 'get_user_permissions', 
        params: { user_id: '00000000-0000-0000-0000-000000000000' } 
      },
      { 
        name: 'check_route_access', 
        params: { 
          user_id: '00000000-0000-0000-0000-000000000000', 
          route_path: '/test' 
        } 
      },
      { 
        name: 'get_usage_statistics', 
        params: { 
          start_date: '2024-01-01', 
          end_date: '2024-01-02',
          filter_user_type: 'all'
        } 
      }
    ];

    for (const func of requiredFunctions) {
      try {
        const { data, error } = await supabase.rpc(func.name, func.params);
        
        if (error) {
          results.functions[func.name] = { status: 'error', message: error.message };
          console.error(`❌ Función ${func.name}: ${error.message}`);
        } else {
          results.functions[func.name] = { status: 'success', message: 'Función ejecutable' };
          console.log(`✅ Función ${func.name}: OK`);
        }
      } catch (error) {
        results.functions[func.name] = { status: 'error', message: error.message };
        console.error(`❌ Función ${func.name}: ${error.message}`);
      }
    }

    // 3. Verificar permisos iniciales
    console.log('🔐 Verificando permisos iniciales...');
    
    try {
      // Verificar permisos de roles
      const { data: rolePerms, error: roleError } = await supabase
        .from('role_permissions')
        .select('*')
        .limit(5);
      
      if (roleError) {
        results.permissions.roles = { status: 'error', message: roleError.message };
        console.error(`❌ Permisos de roles: ${roleError.message}`);
      } else {
        results.permissions.roles = { 
          status: 'success', 
          message: `${rolePerms.length} permisos encontrados`,
          count: rolePerms.length
        };
        console.log(`✅ Permisos de roles: ${rolePerms.length} encontrados`);
      }

      // Verificar permisos de rutas
      const { data: routePerms, error: routeError } = await supabase
        .from('route_permissions')
        .select('*')
        .limit(5);
      
      if (routeError) {
        results.permissions.routes = { status: 'error', message: routeError.message };
        console.error(`❌ Permisos de rutas: ${routeError.message}`);
      } else {
        results.permissions.routes = { 
          status: 'success', 
          message: `${routePerms.length} permisos encontrados`,
          count: routePerms.length
        };
        console.log(`✅ Permisos de rutas: ${routePerms.length} encontrados`);
      }

      // Verificar estadísticas de uso
      const { data: usageStats, error: usageError } = await supabase
        .from('usage_statistics')
        .select('*')
        .limit(5);
      
      if (usageError) {
        results.permissions.usage = { status: 'error', message: usageError.message };
        console.error(`❌ Estadísticas de uso: ${usageError.message}`);
      } else {
        results.permissions.usage = { 
          status: 'success', 
          message: `${usageStats.length} estadísticas encontradas`,
          count: usageStats.length
        };
        console.log(`✅ Estadísticas de uso: ${usageStats.length} encontradas`);
      }
    } catch (error) {
      results.permissions.general = { status: 'error', message: error.message };
      console.error(`❌ Error general en permisos: ${error.message}`);
    }

    // 4. Calcular estado general
    const allItems = [
      ...Object.values(results.tables),
      ...Object.values(results.functions),
      ...Object.values(results.permissions)
    ];
    
    const totalItems = allItems.length;
    const successItems = allItems.filter(item => item.status === 'success').length;
    const successRate = (successItems / totalItems) * 100;

    console.log('\n📊 REPORTE DE VERIFICACIÓN');
    console.log('='.repeat(50));
    
    // Resumen por categoría
    const categories = ['tables', 'functions', 'permissions'];
    
    categories.forEach(category => {
      const items = results[category];
      const total = Object.keys(items).length;
      const success = Object.values(items).filter(item => item.status === 'success').length;
      const errors = total - success;
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`  ✅ Exitosos: ${success}/${total}`);
      if (errors > 0) {
        console.log(`  ❌ Con errores: ${errors}/${total}`);
      }
    });

    console.log(`\n🎯 ESTADO GENERAL:`);
    console.log(`  Tasa de éxito: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 90) {
      results.overall = 'excellent';
      console.log('  🟢 EXCELENTE - Módulos listos para usar');
    } else if (successRate >= 70) {
      results.overall = 'good';
      console.log('  🟡 BUENO - Algunos problemas menores');
    } else {
      results.overall = 'poor';
      console.log('  🔴 PROBLEMAS - Requiere atención');
    }

    return results;

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    results.overall = 'error';
    return results;
  }
};

// Función de verificación rápida
export const quickVerify = async () => {
  console.log('⚡ Verificación rápida...');
  
  try {
    // Verificar tabla principal
    const { data, error } = await supabase
      .from('role_permissions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Módulos no instalados correctamente');
      return false;
    }
    
    console.log('✅ Módulos básicos funcionando');
    return true;
  } catch (error) {
    console.log('❌ Error en verificación:', error.message);
    return false;
  }
};

// Función para probar desde la consola del navegador
if (typeof window !== 'undefined') {
  window.verifyAdminModules = verifyAdminModules;
  window.quickVerify = quickVerify;
  
  console.log(`
🔧 VERIFICADOR DE MÓDULOS DE ADMINISTRACIÓN

Para usar en la consola del navegador:
- verifyAdminModules() - Verificación completa
- quickVerify() - Verificación rápida

Ejemplo:
await verifyAdminModules();
`);
}

export default { verifyAdminModules, quickVerify };
