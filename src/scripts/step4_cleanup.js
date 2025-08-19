/**
 * PASO 4: Limpieza de Archivos Antiguos
 * Identifica y ayuda a limpiar archivos obsoletos
 */

const OLD_FILES = [
  {
    path: 'src/pages/student/Patients.jsx',
    reason: 'Reemplazado por src/pages/admin/Candidates.jsx',
    critical: true
  },
  {
    path: 'src/components/tabs/patients/PatientsTab.jsx',
    reason: 'Reemplazado por src/components/tabs/candidates/CandidatesTab.jsx',
    critical: true
  },
  {
    path: 'src/services/patientService.js',
    reason: 'Reemplazado por src/services/candidateService.js',
    critical: false
  },
  {
    path: 'src/sql/setup_database.sql',
    reason: 'Reemplazado por src/sql/robust_schema.sql',
    critical: false
  }
];

const OLD_REFERENCES = [
  {
    pattern: 'import.*Patients.*from',
    description: 'Importaciones de componentes Patients',
    replacement: 'Cambiar por Candidates'
  },
  {
    pattern: 'import.*PatientsTab.*from',
    description: 'Importaciones de PatientsTab',
    replacement: 'Cambiar por CandidatesTab'
  },
  {
    pattern: '/student/patients',
    description: 'Rutas a la página de pacientes',
    replacement: 'Cambiar por /admin/candidates'
  },
  {
    pattern: '\\.rol\\b',
    description: 'Referencias al campo "rol"',
    replacement: 'Cambiar por .tipo_usuario'
  },
  {
    pattern: 'pacientes.*from.*supabase',
    description: 'Consultas a tabla "pacientes"',
    replacement: 'Cambiar por "candidatos"'
  },
  {
    pattern: 'estudiante',
    description: 'Referencias a tipo "estudiante"',
    replacement: 'Cambiar por "Candidato"'
  }
];

const DIRECTORIES_TO_CHECK = [
  'src/pages/student',
  'src/components/tabs/patients'
];

function executeStep4() {
  console.log('🚀 PASO 4: Limpieza de Archivos Antiguos');
  console.log('=========================================\n');
  
  console.log('🧹 ARCHIVOS PARA ELIMINAR:');
  console.log('===========================');
  
  OLD_FILES.forEach((file, index) => {
    const icon = file.critical ? '🔴' : '🟡';
    const priority = file.critical ? 'CRÍTICO' : 'Opcional';
    
    console.log(`${icon} ${index + 1}. ${file.path}`);
    console.log(`   📝 Razón: ${file.reason}`);
    console.log(`   ⚠️ Prioridad: ${priority}\n`);
  });
  
  console.log('🔍 REFERENCIAS A BUSCAR Y REEMPLAZAR:');
  console.log('======================================');
  
  OLD_REFERENCES.forEach((ref, index) => {
    console.log(`🔎 ${index + 1}. ${ref.description}`);
    console.log(`   📋 Patrón: ${ref.pattern}`);
    console.log(`   🔄 Acción: ${ref.replacement}\n`);
  });
  
  console.log('📁 DIRECTORIOS A VERIFICAR (eliminar si están vacíos):');
  console.log('======================================================');
  
  DIRECTORIES_TO_CHECK.forEach((dir, index) => {
    console.log(`📂 ${index + 1}. ${dir}`);
  });
  
  console.log('\n🛠️ COMANDOS ÚTILES PARA BUSCAR REFERENCIAS:');
  console.log('============================================');
  console.log('# Buscar referencias a Patients:');
  console.log('grep -r "Patients" src/ --exclude-dir=node_modules');
  console.log('');
  console.log('# Buscar referencias a pacientes:');
  console.log('grep -r "pacientes" src/ --exclude-dir=node_modules');
  console.log('');
  console.log('# Buscar referencias a .rol:');
  console.log('grep -r "\\.rol" src/ --exclude-dir=node_modules');
  console.log('');
  console.log('# Buscar referencias a estudiante:');
  console.log('grep -r "estudiante" src/ --exclude-dir=node_modules');
  
  console.log('\n⚠️ IMPORTANTE - PASOS MANUALES REQUERIDOS:');
  console.log('==========================================');
  console.log('1. 🔍 Ejecuta los comandos de búsqueda arriba');
  console.log('2. 📝 Revisa cada referencia encontrada');
  console.log('3. 🔄 Reemplaza las referencias según las indicaciones');
  console.log('4. 🗑️ Elimina los archivos marcados como CRÍTICOS');
  console.log('5. 📂 Elimina directorios vacíos');
  console.log('6. ✅ Verifica que la aplicación sigue funcionando');
  
  console.log('\n🎯 VERIFICACIÓN POST-LIMPIEZA:');
  console.log('==============================');
  console.log('• ✅ La aplicación inicia sin errores');
  console.log('• ✅ El login funciona correctamente');
  console.log('• ✅ El dashboard se carga sin problemas');
  console.log('• ✅ La gestión de candidatos funciona');
  console.log('• ✅ No hay errores en la consola del navegador');
  
  console.log('\n📋 CHECKLIST DE LIMPIEZA:');
  console.log('=========================');
  
  const checklist = [
    'Buscar referencias con grep',
    'Reemplazar imports de Patients → Candidates',
    'Reemplazar rutas /student/patients → /admin/candidates',
    'Reemplazar .rol → .tipo_usuario',
    'Reemplazar "pacientes" → "candidatos" en consultas',
    'Reemplazar "estudiante" → "Candidato"',
    'Eliminar src/pages/student/Patients.jsx',
    'Eliminar src/components/tabs/patients/PatientsTab.jsx',
    'Eliminar directorios vacíos',
    'Probar la aplicación completa'
  ];
  
  checklist.forEach((item, index) => {
    console.log(`☐ ${index + 1}. ${item}`);
  });
  
  console.log('\n🎉 DESPUÉS DE LA LIMPIEZA:');
  console.log('==========================');
  console.log('• 🚀 Código 100% migrado al esquema robusto');
  console.log('• 🧹 Sin archivos obsoletos');
  console.log('• 📦 Proyecto más limpio y mantenible');
  console.log('• ✅ Listo para producción');
  
  return {
    success: true,
    filesToRemove: OLD_FILES,
    referencesToReplace: OLD_REFERENCES,
    directoriesToCheck: DIRECTORIES_TO_CHECK,
    checklist
  };
}

function generateCleanupScript() {
  console.log('📜 SCRIPT DE LIMPIEZA AUTOMÁTICA:');
  console.log('==================================');
  
  const script = `#!/bin/bash
# Script de limpieza automática para BAT-7
# Ejecutar después de verificar que todo funciona

echo "🧹 Iniciando limpieza de archivos antiguos..."

# Buscar referencias antes de eliminar
echo "🔍 Buscando referencias a archivos antiguos..."
echo "Referencias a Patients:"
grep -r "Patients" src/ --exclude-dir=node_modules || echo "No se encontraron referencias"

echo "Referencias a pacientes:"
grep -r "pacientes" src/ --exclude-dir=node_modules || echo "No se encontraron referencias"

echo "Referencias a .rol:"
grep -r "\\.rol" src/ --exclude-dir=node_modules || echo "No se encontraron referencias"

# Eliminar archivos críticos (descomenta después de verificar)
# echo "🗑️ Eliminando archivos obsoletos..."
# rm -f src/pages/student/Patients.jsx
# rm -f src/components/tabs/patients/PatientsTab.jsx
# rm -f src/services/patientService.js

# Eliminar directorios vacíos (descomenta después de verificar)
# rmdir src/pages/student 2>/dev/null || echo "Directorio src/pages/student no está vacío"
# rmdir src/components/tabs/patients 2>/dev/null || echo "Directorio src/components/tabs/patients no está vacío"

echo "✅ Limpieza completada"
echo "🔧 Recuerda probar la aplicación después de la limpieza"
`;

  console.log(script);
  
  console.log('\n💾 Para usar este script:');
  console.log('1. Copia el contenido en un archivo cleanup.sh');
  console.log('2. Dale permisos de ejecución: chmod +x cleanup.sh');
  console.log('3. Descomenta las líneas de eliminación después de verificar');
  console.log('4. Ejecuta: ./cleanup.sh');
  
  return script;
}

function verifyCleanupStatus() {
  console.log('🔍 Verificando estado de la limpieza...\n');
  
  // Esta función sería más útil si pudiera acceder al sistema de archivos
  // Por ahora, proporciona una guía manual
  
  console.log('📋 VERIFICACIÓN MANUAL REQUERIDA:');
  console.log('==================================');
  
  const verificationSteps = [
    {
      step: 'Verificar que no existen archivos antiguos',
      command: 'ls -la src/pages/student/Patients.jsx',
      expected: 'Archivo no encontrado'
    },
    {
      step: 'Verificar que no hay imports de Patients',
      command: 'grep -r "import.*Patients" src/',
      expected: 'Sin resultados'
    },
    {
      step: 'Verificar que no hay referencias a .rol',
      command: 'grep -r "\\.rol" src/',
      expected: 'Sin resultados'
    },
    {
      step: 'Verificar que la aplicación inicia',
      command: 'npm run dev',
      expected: 'Sin errores de compilación'
    }
  ];
  
  verificationSteps.forEach((step, index) => {
    console.log(`${index + 1}. ${step.step}`);
    console.log(`   💻 Comando: ${step.command}`);
    console.log(`   ✅ Esperado: ${step.expected}\n`);
  });
  
  console.log('🎯 SI TODOS LOS PASOS PASAN:');
  console.log('============================');
  console.log('✅ ¡Limpieza completada exitosamente!');
  console.log('🚀 El proyecto está listo para producción');
  console.log('📦 Código 100% migrado al esquema robusto');
  
  return {
    success: true,
    verificationSteps,
    message: 'Verificación manual requerida'
  };
}

// Exportar para uso en consola
if (typeof window !== 'undefined') {
  window.step4 = {
    execute: executeStep4,
    generateScript: generateCleanupScript,
    verify: verifyCleanupStatus,
    files: OLD_FILES,
    references: OLD_REFERENCES
  };
  
  console.log('🛠️ PASO 4 disponible en window.step4:');
  console.log('- execute(): Ver plan de limpieza');
  console.log('- generateScript(): Generar script de limpieza');
  console.log('- verify(): Verificar estado de limpieza');
}

export { 
  executeStep4, 
  generateCleanupScript, 
  verifyCleanupStatus, 
  OLD_FILES, 
  OLD_REFERENCES 
};
