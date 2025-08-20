/**
 * Pruebas unitarias para el manejador de errores
 */

import { getErrorMessage, showErrorToast, showSuccessToast } from '../utils/errorHandler';
import { toast } from 'react-toastify';

// Mock de react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

describe('errorHandler', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('getErrorMessage', () => {
    it('debería devolver el mensaje de error para un código conocido', () => {
      const error = { code: '23505' };
      const message = getErrorMessage(error);
      expect(message).toBe('Ya existe un registro con estos datos. No se permiten duplicados.');
    });

    it('debería devolver un mensaje específico para errores de instituciones', () => {
      const error = { message: 'null value in column "nombre"' };
      const message = getErrorMessage(error, 'crear', 'institución');
      expect(message).toBe('El nombre de la institución es obligatorio.');
    });

    it('debería devolver un mensaje específico para errores de psicólogos', () => {
      const error = { message: 'duplicate key value violates unique constraint "psicologos_email_key"' };
      const message = getErrorMessage(error, 'crear', 'psicólogo');
      expect(message).toBe('Ya existe un psicólogo con este correo electrónico.');
    });

    it('debería devolver un mensaje específico para errores de pacientes', () => {
      const error = { message: 'null value in column "fecha_nacimiento"' };
      const message = getErrorMessage(error, 'crear', 'paciente');
      expect(message).toBe('La fecha de nacimiento del paciente es obligatoria.');
    });

    it('debería devolver un mensaje específico para errores de eliminación con restricciones', () => {
      const error = { message: 'violates foreign key constraint' };
      const message = getErrorMessage(error, 'eliminar', 'institución');
      expect(message).toBe('No se puede eliminar la institución porque hay registros que dependen de ella.');
    });

    it('debería devolver el mensaje original si no hay un mensaje específico', () => {
      const error = { message: 'Error desconocido' };
      const message = getErrorMessage(error);
      expect(message).toBe('Error desconocido');
    });

    it('debería devolver un mensaje genérico si no hay mensaje de error', () => {
      const error = {};
      const message = getErrorMessage(error);
      expect(message).toBe('Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.');
    });
  });

  describe('showErrorToast', () => {
    it('debería mostrar un toast de error con el mensaje interpretado', () => {
      const error = { code: '23505' };
      showErrorToast(error, 'crear', 'institución');
      expect(toast.error).toHaveBeenCalledWith(
        'Ya existe un registro con estos datos. No se permiten duplicados.',
        expect.any(Object)
      );
    });

    it('debería mostrar un toast de error con el mensaje específico del contexto', () => {
      const error = { message: 'null value in column "nombre"' };
      showErrorToast(error, 'crear', 'institución');
      expect(toast.error).toHaveBeenCalledWith(
        'El nombre de la institución es obligatorio.',
        expect.any(Object)
      );
    });

    it('debería mostrar un toast de error con el mensaje original si no hay interpretación', () => {
      const error = { message: 'Error desconocido' };
      showErrorToast(error);
      expect(toast.error).toHaveBeenCalledWith(
        'Error desconocido',
        expect.any(Object)
      );
    });
  });

  describe('showSuccessToast', () => {
    it('debería mostrar un toast de éxito con el mensaje proporcionado', () => {
      const message = 'Operación completada con éxito';
      showSuccessToast(message);
      expect(toast.success).toHaveBeenCalledWith(
        message,
        expect.any(Object)
      );
    });
  });
});
