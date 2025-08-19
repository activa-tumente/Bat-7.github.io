/**
 * Utilidad para verificar que todos los iconos importados existen
 * Útil para debugging de problemas de iconos
 */

// Importar todos los iconos que usamos en la aplicación
import {
  // Iconos de navegación
  FaHome,
  FaUser,
  FaUsers,
  FaUserMd,
  FaUserGraduate,
  FaUserShield,
  FaArrowLeft,
  FaArrowRight,
  
  // Iconos de acciones
  FaEdit,
  FaTrash,
  FaDownload,
  FaUpload,
  FaShare,
  FaPrint,
  FaSave,
  FaRedo, // Cambiado de FaRefresh
  
  // Iconos de estado
  FaCheck,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaSpinner,
  FaCog,
  FaBug,
  
  // Iconos de interfaz
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaFilter,
  FaSort,
  FaExpandArrowsAlt, // Cambiado de FaExpand
  FaCompressArrowsAlt, // Cambiado de FaCompress
  
  // Iconos de comunicación
  FaEnvelope,
  FaPhone,
  FaLock,
  FaUnlock,
  
  // Iconos de archivos
  FaFile,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  
  // Iconos de tiempo
  FaCalendarAlt,
  FaClock,
  
  // Iconos de datos
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaTable,
  
  // Iconos de etiquetas
  FaTag,
  FaTags,
  
  // Iconos de configuración
  FaCogs,
  FaWrench,
  FaTools
} from 'react-icons/fa';

/**
 * Lista de todos los iconos que usamos
 */
export const iconList = {
  // Navegación
  FaHome,
  FaUser,
  FaUsers,
  FaUserMd,
  FaUserGraduate,
  FaUserShield,
  FaArrowLeft,
  FaArrowRight,
  
  // Acciones
  FaEdit,
  FaTrash,
  FaDownload,
  FaUpload,
  FaShare,
  FaPrint,
  FaSave,
  FaRedo,
  
  // Estado
  FaCheck,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaSpinner,
  FaCog,
  FaBug,
  
  // Interfaz
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaFilter,
  FaSort,
  FaExpandArrowsAlt,
  FaCompressArrowsAlt,
  
  // Comunicación
  FaEnvelope,
  FaPhone,
  FaLock,
  FaUnlock,
  
  // Archivos
  FaFile,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  
  // Tiempo
  FaCalendarAlt,
  FaClock,
  
  // Datos
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaTable,
  
  // Etiquetas
  FaTag,
  FaTags,
  
  // Configuración
  FaCogs,
  FaWrench,
  FaTools
};

/**
 * Verificar que todos los iconos están disponibles
 */
export const checkIcons = () => {
  const results = {};
  const errors = [];
  
  Object.entries(iconList).forEach(([name, IconComponent]) => {
    try {
      if (typeof IconComponent === 'function') {
        results[name] = 'OK';
      } else {
        results[name] = 'ERROR: Not a function';
        errors.push(`${name} is not a valid React component`);
      }
    } catch (error) {
      results[name] = `ERROR: ${error.message}`;
      errors.push(`${name}: ${error.message}`);
    }
  });
  
  return {
    results,
    errors,
    totalIcons: Object.keys(iconList).length,
    errorCount: errors.length,
    successCount: Object.keys(iconList).length - errors.length
  };
};

/**
 * Mostrar reporte de iconos en consola
 */
export const reportIcons = () => {
  const report = checkIcons();
  
  console.group('🎨 Icon Check Report');
  console.log(`Total icons: ${report.totalIcons}`);
  console.log(`✅ Success: ${report.successCount}`);
  console.log(`❌ Errors: ${report.errorCount}`);
  
  if (report.errors.length > 0) {
    console.group('❌ Errors:');
    report.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return report;
};

// Ejecutar check en desarrollo
if (import.meta.env.DEV) {
  reportIcons();
}

export default {
  iconList,
  checkIcons,
  reportIcons
};
