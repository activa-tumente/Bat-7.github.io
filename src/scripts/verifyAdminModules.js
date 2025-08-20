/**
 * Script de verificación para los módulos de administración
 * Ejecutar en la consola del navegador para verificar la instalación
 */

import supabase from '../api/supabaseClient';

class AdminModulesVerifier {
  constructor() {
    this.results = {
      tables: {},
      functions: {},
      permissions: {},
      services: {},
      components: {},
      overall: 'pending'
    };
  }

  async verifyTables() {
    console.log('🔍 Verificando tablas...');
    
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
          this.results.tables[table] = { status: 'error', message: error.message };
          console.error(`❌ Tabla ${table}: ${error.message}`);
        } else {
          this.results.tables[table] = { status: 'success', message: 'Tabla accesible' };
          console.log(`✅ Tabla ${table}: OK`);
        }
      } catch (error) {
        this.results.tables[table] = { status: 'error', message: error.message };
        console.error(`❌ Tabla ${table}: ${error.message}`);
      }
    }
  }

  async verifyFunctions() {
    console.log('🔍 Verificando funciones RPC...');
    
    const requiredFunctions = [
      { name: 'get_user_permissions', params: { user_id: '00000000-0000-0000-0000-000000000000' } },
      { name: 'check_route_access', params: { user_id: '00000000-0000-0000-0000-000000000000', route_path: '/test' } },
      { name: 'get_usage_statistics', params: { start_date: '2024-01-01', end_date: '2024-01-02' } }
    ];

    for (const func of requiredFunctions) {
      try {
        const { data, error } = await supabase.rpc(func.name, func.params);
        
        if (error) {
          this.results.functions[func.name] = { status: 'error', message: error.message };
          console.error(`❌ Función ${func.name}: ${error.message}`);
        } else {
          this.results.functions[func.name] = { status: 'success', message: 'Función ejecutable' };
          console.log(`✅ Función ${func.name}: OK`);
        }
      } catch (error) {
        this.results.functions[func.name] = { status: 'error', message: error.message };
        console.error(`❌ Función ${func.name}: ${error.message}`);
      }
    }
  }

  async verifyPermissions() {
    console.log('🔍 Verificando permisos iniciales...');
    
    try {
      // Verificar permisos de roles
      const { data: rolePerms, error: roleError } = await supabase
        .from('role_permissions')
        .select('*')
        .limit(5);
      
      if (roleError) {
        this.results.permissions.roles = { status: 'error', message: roleError.message };
        console.error(`❌ Permisos de roles: ${roleError.message}`);
      } else {
        this.results.permissions.roles = { 
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
        this.results.permissions.routes = { status: 'error', message: routeError.message };
        console.error(`❌ Permisos de rutas: ${routeError.message}`);
      } else {
        this.results.permissions.routes = { 
          status: 'success', 
          message: `${routePerms.length} permisos encontrados`,
          count: routePerms.length
        };
        console.log(`✅ Permisos de rutas: ${routePerms.length} encontrados`);
      }
    } catch (error) {
      this.results.permissions.general = { status: 'error', message: error.message };
      console.error(`❌ Error general en permisos: ${error.message}`);
    }
  }

  verifyServices() {
    console.log('🔍 Verificando servicios...');
    
    const requiredServices = [
      'userManagementService',
      'routePermissionsService',
      'appUsageService',
      'patientAssignmentService'
    ];

    for (const service of requiredServices) {
      try {
        // Intentar importar dinámicamente el servicio
        import(`../services/${service}.js`)
          .then(() => {
            this.results.services[service] = { status: 'success', message: 'Servicio disponible' };
            console.log(`✅ Servicio ${service}: OK`);
          })
          .catch((error) => {
            this.results.services[service] = { status: 'error', message: error.message };
            console.error(`❌ Servicio ${service}: ${error.message}`);
          });
      } catch (error) {
        this.results.services[service] = { status: 'error', message: error.message };
        console.error(`❌ Servicio ${service}: ${error.message}`);
      }
    }
  }

  verifyComponents() {
    console.log('🔍 Verificando componentes...');
    
    const requiredComponents = [
      'UserManagementPanel',
      'PageAccessPanel',
      'PatientAssignmentPanel',
      'UsageControlPanel',
      'UsageReportsPanel'
    ];

    for (const component of requiredComponents) {
      try {
        // Intentar importar dinámicamente el componente
        import(`../components/UserManagement/${component}.jsx`)
          .then(() => {
            this.results.components[component] = { status: 'success', message: 'Componente disponible' };
            console.log(`✅ Componente ${component}: OK`);
          })
          .catch((error) => {
            this.results.components[component] = { status: 'error', message: error.message };
            console.error(`❌ Componente ${component}: ${error.message}`);
          });
      } catch (error) {
        this.results.components[component] = { status: 'error', message: error.message };
        console.error(`❌ Componente ${component}: ${error.message}`);
      }
    }
  }

  async verifySupabaseConnection() {
    console.log('🔍 Verificando conexión a Supabase...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error de conexión a Supabase:', error.message);
        return false;
      }
      
      console.log('✅ Conexión a Supabase: OK');
      
      if (session) {
        console.log(`✅ Usuario autenticado: ${session.user.email}`);
      } else {
        console.log('⚠️ No hay usuario autenticado');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error de conexión a Supabase:', error.message);
      return false;
    }
  }

  generateReport() {
    console.log('\n📊 REPORTE DE VERIFICACIÓN');
    console.log('='.repeat(50));
    
    // Resumen por categoría
    const categories = ['tables', 'functions', 'permissions', 'services', 'components'];
    
    categories.forEach(category => {
      const items = this.results[category];
      const total = Object.keys(items).length;
      const success = Object.values(items).filter(item => item.status === 'success').length;
      const errors = total - success;
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`  ✅ Exitosos: ${success}/${total}`);
      if (errors > 0) {
        console.log(`  ❌ Con errores: ${errors}/${total}`);
      }
    });

    // Determinar estado general
    const allItems = Object.values(this.results).flatMap(category => 
      typeof category === 'object' && category !== null ? Object.values(category) : []
    );
    
    const totalItems = allItems.length;
    const successItems = allItems.filter(item => item.status === 'success').length;
    const successRate = (successItems / totalItems) * 100;

    console.log(`\n🎯 ESTADO GENERAL:`);
    console.log(`  Tasa de éxito: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 90) {
      this.results.overall = 'excellent';
      console.log('  🟢 EXCELENTE - Módulos listos para usar');
    } else if (successRate >= 70) {
      this.results.overall = 'good';
      console.log('  🟡 BUENO - Algunos problemas menores');
    } else {
      this.results.overall = 'poor';
      console.log('  🔴 PROBLEMAS - Requiere atención');
    }

    return this.results;
  }

  async runFullVerification() {
    console.log('🚀 Iniciando verificación completa de módulos de administración...\n');
    
    // Verificar conexión primero
    const connectionOk = await this.verifySupabaseConnection();
    if (!connectionOk) {
      console.log('❌ No se puede continuar sin conexión a Supabase');
      return this.results;
    }

    // Ejecutar todas las verificaciones
    await this.verifyTables();
    await this.verifyFunctions();
    await this.verifyPermissions();
    this.verifyServices();
    this.verifyComponents();

    // Esperar un poco para que las importaciones dinámicas terminen
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generar reporte final
    return this.generateReport();
  }
}

// Función para ejecutar desde la consola
window.verifyAdminModules = async () => {
  const verifier = new AdminModulesVerifier();
  return await verifier.runFullVerification();
};

// Función de verificación rápida
window.quickVerify = async () => {
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

console.log(`
🔧 VERIFICADOR DE MÓDULOS DE ADMINISTRACIÓN

Para usar:
- verifyAdminModules() - Verificación completa
- quickVerify() - Verificación rápida

Ejemplo:
await verifyAdminModules();
`);

export default AdminModulesVerifier;
