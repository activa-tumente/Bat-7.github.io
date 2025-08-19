import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFormValidation } from '../useFormValidation';
import * as yup from 'yup';

// Schema de prueba
const testSchema = yup.object({
  email: yup.string().email('Email inválido').required('Email es requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Password es requerido'),
  age: yup.number().min(18, 'Debe ser mayor de edad').required('Edad es requerida'),
  terms: yup.boolean().oneOf([true], 'Debe aceptar términos')
});

describe('useFormValidation', () => {
  const initialValues = {
    email: '',
    password: '',
    age: '',
    terms: false
  };

  describe('Inicialización', () => {
    it('debe inicializar con valores por defecto', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isValid).toBe(false);
      expect(result.current.isDirty).toBe(false);
    });

    it('debe inicializar con opciones personalizadas', () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema, {
          validateOnChange: false,
          validateOnBlur: false,
          onSubmit
        })
      );

      expect(result.current.values).toEqual(initialValues);
    });
  });

  describe('Manejo de cambios', () => {
    it('debe actualizar valores con handleChange', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      await act(async () => {
        result.current.handleChange('email', 'test@example.com');
      });

      expect(result.current.values.email).toBe('test@example.com');
      expect(result.current.isDirty).toBe(true);
    });

    it('debe manejar eventos de input', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      const mockEvent = {
        target: {
          name: 'email',
          value: 'test@example.com',
          type: 'text'
        }
      };

      await act(async () => {
        result.current.handleInputChange(mockEvent);
      });

      expect(result.current.values.email).toBe('test@example.com');
    });

    it('debe manejar checkboxes', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      const mockEvent = {
        target: {
          name: 'terms',
          checked: true,
          type: 'checkbox'
        }
      };

      await act(async () => {
        result.current.handleInputChange(mockEvent);
      });

      expect(result.current.values.terms).toBe(true);
    });
  });

  describe('Validación', () => {
    it('debe validar en tiempo real cuando está habilitado', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema, {
          validateOnChange: true,
          debounceMs: 0 // Sin debounce para testing
        })
      );

      await act(async () => {
        result.current.handleChange('email', 'invalid-email');
      });

      // Esperar a que se ejecute la validación
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.errors.email).toBe('Email inválido');
    });

    it('debe validar en blur', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema, {
          validateOnBlur: true
        })
      );

      const mockEvent = {
        target: {
          name: 'email',
          value: 'invalid-email'
        }
      };

      await act(async () => {
        result.current.handleBlur(mockEvent);
      });

      expect(result.current.touched.email).toBe(true);
      expect(result.current.errors.email).toBe('Email inválido');
    });

    it('debe validar todo el formulario', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      let validationErrors;
      await act(async () => {
        validationErrors = await result.current.validateAllFields();
      });

      expect(validationErrors).toHaveProperty('email');
      expect(validationErrors).toHaveProperty('password');
      expect(validationErrors).toHaveProperty('age');
      expect(validationErrors).toHaveProperty('terms');
    });

    it('debe validar campo individual', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      // Establecer un valor inválido
      await act(async () => {
        result.current.handleChange('email', 'invalid-email');
      });

      let error;
      await act(async () => {
        error = await result.current.validateSingleField('email');
      });

      expect(error).toBe('Email inválido');
    });
  });

  describe('Estado de validez', () => {
    it('debe marcar como válido cuando no hay errores', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      // Llenar con valores válidos
      await act(async () => {
        result.current.setFormValues({
          email: 'test@example.com',
          password: 'password123',
          age: 25,
          terms: true
        });
      });

      // Validar
      await act(async () => {
        await result.current.validateAllFields();
      });

      expect(result.current.isValid).toBe(true);
    });

    it('debe marcar como inválido cuando hay errores', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      await act(async () => {
        result.current.setFormErrors({
          email: 'Email inválido'
        });
      });

      expect(result.current.isValid).toBe(false);
    });
  });

  describe('Envío de formulario', () => {
    it('debe enviar formulario válido', async () => {
      const onSubmit = vi.fn().mockResolvedValue({ success: true });
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema, { onSubmit })
      );

      // Llenar con valores válidos
      await act(async () => {
        result.current.setFormValues({
          email: 'test@example.com',
          password: 'password123',
          age: 25,
          terms: true
        });
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.handleSubmit();
      });

      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        age: 25,
        terms: true
      });
      expect(submitResult.success).toBe(true);
    });

    it('debe prevenir envío de formulario inválido', async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema, { onSubmit })
      );

      let submitResult;
      await act(async () => {
        submitResult = await result.current.handleSubmit();
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(submitResult.success).toBe(false);
      expect(submitResult.errors).toBeDefined();
    });

    it('debe manejar errores en envío', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'));
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema, { onSubmit })
      );

      // Llenar con valores válidos
      await act(async () => {
        result.current.setFormValues({
          email: 'test@example.com',
          password: 'password123',
          age: 25,
          terms: true
        });
      });

      let submitResult;
      await act(async () => {
        submitResult = await result.current.handleSubmit();
      });

      expect(submitResult.success).toBe(false);
      expect(submitResult.error).toBe('Server error');
    });
  });

  describe('Utilidades', () => {
    it('debe resetear formulario', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      // Modificar valores
      await act(async () => {
        result.current.handleChange('email', 'test@example.com');
        result.current.setFormErrors({ email: 'Error' });
      });

      // Resetear
      await act(async () => {
        result.current.resetForm();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isDirty).toBe(false);
    });

    it('debe limpiar errores', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      // Establecer errores
      await act(async () => {
        result.current.setFormErrors({
          email: 'Error 1',
          password: 'Error 2'
        });
      });

      // Limpiar error específico
      await act(async () => {
        result.current.clearErrors('email');
      });

      expect(result.current.errors.email).toBeUndefined();
      expect(result.current.errors.password).toBe('Error 2');

      // Limpiar todos los errores
      await act(async () => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
    });

    it('debe obtener props de campo', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      const fieldProps = result.current.getFieldProps('email');

      expect(fieldProps).toHaveProperty('name', 'email');
      expect(fieldProps).toHaveProperty('value', '');
      expect(fieldProps).toHaveProperty('onChange');
      expect(fieldProps).toHaveProperty('onBlur');
    });

    it('debe obtener estado de campo', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema)
      );

      // Modificar campo
      await act(async () => {
        result.current.handleChange('email', 'test@example.com');
        result.current.setFormErrors({ email: 'Error' });
      });

      const fieldState = result.current.getFieldState('email');

      expect(fieldState.value).toBe('test@example.com');
      expect(fieldState.error).toBe('Error');
      expect(fieldState.hasError).toBe(false); // No touched yet
    });
  });

  describe('Sanitización', () => {
    it('debe sanitizar valores cuando está habilitado', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialValues, testSchema, {
          sanitizeOnChange: true
        })
      );

      await act(async () => {
        result.current.handleChange('email', '  TEST@EXAMPLE.COM  ', 'email');
      });

      expect(result.current.values.email).toBe('test@example.com');
    });

    it('debe sanitizar nombres', async () => {
      const { result } = renderHook(() => 
        useFormValidation({ name: '' }, yup.object({ name: yup.string() }), {
          sanitizeOnChange: true
        })
      );

      await act(async () => {
        result.current.handleChange('name', '  John   Doe  ', 'name');
      });

      expect(result.current.values.name).toBe('John Doe');
    });
  });
});
