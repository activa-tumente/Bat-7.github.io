// Script de debug para verificar la implementación de Reports
console.log('=== DEBUG REPORTS IMPLEMENTATION ===');

// Verificar que los componentes existen
try {
  const PatientCard = require('./src/components/reports/PatientCard.jsx');
  console.log('✅ PatientCard component found');
} catch (error) {
  console.log('❌ PatientCard component not found:', error.message);
}

try {
  const InformeModal = require('./src/components/reports/InformeModal.jsx');
  console.log('✅ InformeModal component found');
} catch (error) {
  console.log('❌ InformeModal component not found:', error.message);
}

try {
  const InformesService = require('./src/services/informesService.js');
  console.log('✅ InformesService found');
} catch (error) {
  console.log('❌ InformesService not found:', error.message);
}

try {
  const Reports = require('./src/pages/admin/Reports.jsx');
  console.log('✅ Reports page found');
} catch (error) {
  console.log('❌ Reports page not found:', error.message);
}

console.log('=== END DEBUG ===');