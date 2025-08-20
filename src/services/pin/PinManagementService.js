/**
 * @file PinManagementService.js
 * @description Servicio unificado para gestión de pines - Versión simplificada
 * Evita problemas de RLS usando directamente la tabla pines_transacciones
 */

import SimplePinService from './SimplePinService';

/**
 * Servicio de gestión de pines - Facade simplificado
 */
class PinManagementService {
  /**
   * Obtener todos los psicólogos con sus estadísticas de pines
   * @returns {Promise<Array>} Lista de psicólogos con estadísticas
   */
  async getPsychologistsWithPinStats() {
    return await SimplePinService.getPsychologistsWithPinStats();
  }

  /**
   * Asignar pines a un psicólogo
   * @param {string} psychologistId - ID del psicólogo
   * @param {number} amount - Cantidad de pines
   * @param {string} reason - Motivo de la asignación
   * @returns {Promise<Object>} Resultado de la asignación
   */
  async assignPins(psychologistId, amount, reason = 'Asignación manual') {
    return await SimplePinService.assignPins(psychologistId, amount, reason);
  }

  /**
   * Obtener balance de un psicólogo específico
   * @param {string} psychologistId - ID del psicólogo
   * @returns {Promise<Object>} Balance del psicólogo
   */
  async getPsychologistBalance(psychologistId) {
    return await SimplePinService.getPsychologistBalance(psychologistId);
  }

  /**
   * Obtener historial de transacciones
   * @param {string} psychologistId - ID del psicólogo (opcional)
   * @param {number} limit - Límite de registros
   * @returns {Promise<Array>} Historial de transacciones
   */
  async getTransactionHistory(psychologistId = null, limit = 50) {
    return await SimplePinService.getTransactionHistory(psychologistId, limit);
  }

  /**
   * Eliminar una transacción de pines específica.
   * @param {string} transactionId - El ID de la transacción a eliminar.
   * @returns {Promise<Object>} - El resultado de la operación de eliminación.
   */
  async deleteTransaction(transactionId) {
    return await SimplePinService.deleteTransaction(transactionId);
  }

  /**
   * Eliminar múltiples transacciones de pines.
   * @param {Array<string>} ids - Array de IDs de transacciones a eliminar.
   * @returns {Promise<Object>} - El resultado de la operación de eliminación.
   */
  async deleteMultipleTransactions(ids) {
    return await SimplePinService.deleteMultipleTransactions(ids);
  }

  /**
   * Obtener estadísticas del sistema
   * @returns {Promise<Object>} Estadísticas generales
   */
  async getSystemStats() {
    return await SimplePinService.getSystemStats();
  }

  /**
   * Consumir un pin
   * @param {string} psychologistId - ID del psicólogo
   * @param {string} reason - Motivo del consumo
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>} Resultado del consumo
   */
  async consumePin(psychologistId, reason = 'Consumo automático', metadata = {}) {
    return await SimplePinService.consumePin(psychologistId, reason, metadata);
  }

  /**
   * Eliminar cantidad específica de pines de un psicólogo
   * @param {string} psychologistId - ID del psicólogo
   * @param {number} amount - Cantidad de pines a eliminar
   * @param {string} reason - Motivo de la eliminación
   * @returns {Promise<Object>} Resultado de la operación
   */
  async removePinsFromPsychologist(psychologistId, amount, reason = 'Eliminación manual de pines') {
    return await SimplePinService.removePinsFromPsychologist(psychologistId, amount, reason);
  }

  /**
   * Eliminar completamente la asignación de pines de un psicólogo
   * @param {string} psychologistId - ID del psicólogo
   * @param {string} reason - Motivo de la eliminación completa
   * @returns {Promise<Object>} Resultado de la operación
   */
  async removePsychologistPinAssignment(psychologistId, reason = 'Eliminación completa de asignación') {
    return await SimplePinService.removePsychologistPinAssignment(psychologistId, reason);
  }

  /**
   * Eliminar múltiples psicólogos y sus asignaciones de pines
   * @param {Array<string>} psychologistIds - Array de IDs de psicólogos
   * @param {string} reason - Motivo de la eliminación
   * @returns {Promise<Object>} Resultado de la operación
   */
  async removeMultiplePsychologistAssignments(psychologistIds, reason = 'Eliminación masiva de asignaciones') {
    return await SimplePinService.removeMultiplePsychologistAssignments(psychologistIds, reason);
  }
}

// Exportar instancia singleton
const pinManagementService = new PinManagementService();
export default pinManagementService;