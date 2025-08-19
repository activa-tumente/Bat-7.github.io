import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://ydglduxhgwajqdseqzpy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZ2xkdXhoZ3dhanFkc2VxenB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMTI4NDEsImV4cCI6MjA2MTg4ODg0MX0.HEFdJm5qnXU1PQFbF-HkZ-bLez9LuPi3LepirU0nz4c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para simular el mapeo que hace AuthContext
function mapUserProfile(profile) {
  return {
    ...profile,
    tipo_usuario: profile.rol // Mapear rol de BD a tipo_usuario esperado por la app
  };
}

// Función para simular la validación del LoginForm
function validateUserRole(userRole, selectedRole) {
  // Mapeo de valores del formulario a valores de BD para validación
  const formToDatabaseRole = {
    'candidato': 'estudiante',
    'psicólogo': 'psicologo',
    'administrador': 'administrador'
  };
  
  const expectedRole = formToDatabaseRole[selectedRole.toLowerCase()] || selectedRole.toLowerCase();
  return userRole.toLowerCase() === expectedRole;
}

// Función para simular ProtectedRoute
function checkRouteAccess(userRole, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  
  // Mapeo de alias de roles a roles canónicos del sistema
  const roleAliases = {
    admin: 'administrador',
    'psicólogo': 'psicologo', // Mapear psicólogo con tilde a psicologo sin tilde
    estudiante: 'candidato',
    candidato: 'estudiante', // Mapeo bidireccional
  };

  // Normalizar los roles permitidos y comprobar si el rol del usuario está incluido
  const normalizedAllowedRoles = allowedRoles.map(r => roleAliases[r.toLowerCase()] || r.toLowerCase());
  return normalizedAllowedRoles.includes(userRole.toLowerCase());
}

async function testRoleMapping() {
  console.log('🧪 Probando mapeo de roles...\n');

  // Obtener usuarios de la BD
  const { data: users, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('rol');

  if (error) {
    console.error('❌ Error obteniendo usuarios:', error.message);
    return;
  }

  console.log('👥 Usuarios en la base de datos:');
  users.forEach(user => {
    console.log(`- ${user.nombre} ${user.apellido}: rol="${user.rol}"`);
  });

  console.log('\n🔄 Probando mapeo AuthContext...');
  users.forEach(user => {
    const mappedUser = mapUserProfile(user);
    console.log(`- ${user.nombre}: rol="${user.rol}" → tipo_usuario="${mappedUser.tipo_usuario}"`);
  });

  console.log('\n✅ Probando validación LoginForm...');
  const testCases = [
    { userRole: 'administrador', selectedRole: 'administrador', shouldPass: true },
    { userRole: 'psicologo', selectedRole: 'psicólogo', shouldPass: true },
    { userRole: 'estudiante', selectedRole: 'candidato', shouldPass: true },
    { userRole: 'administrador', selectedRole: 'candidato', shouldPass: false },
    { userRole: 'psicologo', selectedRole: 'administrador', shouldPass: false },
  ];

  testCases.forEach(({ userRole, selectedRole, shouldPass }) => {
    const result = validateUserRole(userRole, selectedRole);
    const status = result === shouldPass ? '✅' : '❌';
    console.log(`${status} Usuario "${userRole}" selecciona "${selectedRole}": ${result ? 'PERMITIDO' : 'DENEGADO'}`);
  });

  console.log('\n🛡️ Probando acceso a rutas...');
  const routeTests = [
    { route: '/home', roles: [], userRole: 'estudiante', shouldPass: true },
    { route: '/cuestionario', roles: [], userRole: 'estudiante', shouldPass: true },
    { route: '/results', roles: ['psicologo', 'psicólogo', 'admin', 'administrador'], userRole: 'estudiante', shouldPass: false },
    { route: '/results', roles: ['psicologo', 'psicólogo', 'admin', 'administrador'], userRole: 'psicologo', shouldPass: true },
    { route: '/admin/administration', roles: ['admin', 'administrador'], userRole: 'psicologo', shouldPass: false },
    { route: '/admin/administration', roles: ['admin', 'administrador'], userRole: 'administrador', shouldPass: true },
  ];

  routeTests.forEach(({ route, roles, userRole, shouldPass }) => {
    const result = checkRouteAccess(userRole, roles);
    const status = result === shouldPass ? '✅' : '❌';
    console.log(`${status} Usuario "${userRole}" accede a "${route}": ${result ? 'PERMITIDO' : 'DENEGADO'}`);
  });

  console.log('\n🎉 Pruebas de mapeo de roles completadas');
}

// Ejecutar las pruebas
testRoleMapping().catch(console.error);
