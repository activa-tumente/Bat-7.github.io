/**
 * @file AptitudeConfigService.js
 * @description Centralized configuration for BAT-7 aptitudes and scoring
 */

import { 
  HiOutlineChatAlt2,
  HiOutlineCube,
  HiOutlineEye,
  HiOutlineCalculator,
  HiOutlineCog,
  HiOutlineBookOpen
} from 'react-icons/hi';
import { FaBullseye, FaPuzzlePiece } from 'react-icons/fa';

class AptitudeConfigService {
  /**
   * Aptitude configuration mapping
   */
  static APTITUDE_CONFIG = {
    'V': {
      code: 'V',
      name: 'Aptitud Verbal',
      color: '#2563EB',
      icon: HiOutlineChatAlt2,
      description: 'Capacidad para comprender y utilizar el lenguaje'
    },
    'E': {
      code: 'E',
      name: 'Aptitud Espacial',
      color: '#6D28D9',
      icon: HiOutlineCube,
      description: 'Capacidad para visualizar y manipular objetos en el espacio'
    },
    'A': {
      code: 'A',
      name: 'Atención',
      color: '#DC2626',
      icon: HiOutlineEye,
      description: 'Capacidad para mantener la concentración y detectar detalles'
    },
    'CON': {
      code: 'CON',
      name: 'Concentración',
      color: '#DB2777',
      icon: FaBullseye,
      description: 'Capacidad para mantener el foco en tareas específicas'
    },
    'R': {
      code: 'R',
      name: 'Razonamiento',
      color: '#D97706',
      icon: FaPuzzlePiece,
      description: 'Capacidad para resolver problemas lógicos'
    },
    'N': {
      code: 'N',
      name: 'Aptitud Numérica',
      color: '#0F766E',
      icon: HiOutlineCalculator,
      description: 'Capacidad para trabajar con números y operaciones matemáticas'
    },
    'M': {
      code: 'M',
      name: 'Aptitud Mecánica',
      color: '#374151',
      icon: HiOutlineCog,
      description: 'Comprensión de principios mecánicos y físicos'
    },
    'O': {
      code: 'O',
      name: 'Ortografía',
      color: '#16A34A',
      icon: HiOutlineBookOpen,
      description: 'Conocimiento de reglas ortográficas y escritura correcta'
    }
  };

  /**
   * Percentile level configuration
   */
  static PERCENTILE_LEVELS = {
    VERY_HIGH: { min: 95, max: 100, level: 'Muy Alto', color: '#8B5CF6', textColor: 'text-purple-800', bgColor: 'bg-purple-100' },
    HIGH: { min: 81, max: 94, level: 'Alto', color: '#10B981', textColor: 'text-green-800', bgColor: 'bg-green-100' },
    MEDIUM_HIGH: { min: 61, max: 80, level: 'Medio-Alto', color: '#3B82F6', textColor: 'text-blue-800', bgColor: 'bg-blue-100' },
    MEDIUM: { min: 41, max: 60, level: 'Medio', color: '#6B7280', textColor: 'text-gray-800', bgColor: 'bg-gray-100' },
    MEDIUM_LOW: { min: 21, max: 40, level: 'Medio-Bajo', color: '#F59E0B', textColor: 'text-yellow-800', bgColor: 'bg-yellow-100' },
    LOW: { min: 6, max: 20, level: 'Bajo', color: '#F97316', textColor: 'text-orange-800', bgColor: 'bg-orange-100' },
    VERY_LOW: { min: 0, max: 5, level: 'Muy Bajo', color: '#EF4444', textColor: 'text-red-800', bgColor: 'bg-red-100' }
  };

  /**
   * Get aptitude configuration by code
   * @param {string} code - Aptitude code
   * @returns {Object} Aptitude configuration
   */
  static getAptitudeConfig(code) {
    return this.APTITUDE_CONFIG[code] || {
      code: code,
      name: 'Desconocido',
      color: '#374151',
      icon: FaPuzzlePiece,
      description: 'Aptitud no identificada'
    };
  }

  /**
   * Get percentile level configuration
   * @param {number} percentile - Percentile score
   * @returns {Object} Level configuration
   */
  static getPercentileLevel(percentile) {
    const levels = Object.values(this.PERCENTILE_LEVELS);
    const level = levels.find(l => percentile >= l.min && percentile <= l.max);
    return level || this.PERCENTILE_LEVELS.VERY_LOW;
  }

  /**
   * Get all aptitude codes
   * @returns {Array<string>} Array of aptitude codes
   */
  static getAllAptitudeCodes() {
    return Object.keys(this.APTITUDE_CONFIG);
  }

  /**
   * Get aptitudes for intelligence indices calculation
   * @returns {Object} Grouped aptitudes for intelligence calculation
   */
  static getIntelligenceGroupings() {
    return {
      fluid: ['E', 'R'], // Spatial and Reasoning
      crystallized: ['V', 'O'], // Verbal and Spelling
      processing: ['A', 'CON'], // Attention and Concentration
      quantitative: ['N', 'M'] // Numerical and Mechanical
    };
  }

  /**
   * Calculate intelligence indices from results
   * @param {Array} results - Test results array
   * @returns {Object} Intelligence indices
   */
  static calculateIntelligenceIndices(results) {
    if (!results || results.length === 0) {
      return {
        capacidadGeneral: 0,
        inteligenciaFluida: 0,
        inteligenciaCristalizada: 0,
        procesamientoCognitivo: 0,
        aptitudCuantitativa: 0
      };
    }

    const groupings = this.getIntelligenceGroupings();
    
    // Calculate general capacity (g) as average of all percentiles
    const allPercentiles = results.map(r => r.percentil || r.puntaje_pc || 0);
    const capacidadGeneral = Math.round(
      allPercentiles.reduce((sum, p) => sum + p, 0) / allPercentiles.length
    );

    // Calculate specific intelligence indices
    const calculateGroupAverage = (codes) => {
      const groupResults = results.filter(r => 
        codes.includes(r.aptitudes?.codigo || r.test || r.aptitud)
      );
      if (groupResults.length === 0) return capacidadGeneral;
      
      const percentiles = groupResults.map(r => r.percentil || r.puntaje_pc || 0);
      return Math.round(percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length);
    };

    return {
      capacidadGeneral,
      inteligenciaFluida: calculateGroupAverage(groupings.fluid),
      inteligenciaCristalizada: calculateGroupAverage(groupings.crystallized),
      procesamientoCognitivo: calculateGroupAverage(groupings.processing),
      aptitudCuantitativa: calculateGroupAverage(groupings.quantitative)
    };
  }
}

export default AptitudeConfigService;