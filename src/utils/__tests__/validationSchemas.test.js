import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  profileSchema,
  validateField,
  validateForm,
  sanitizeInput
} from '../validationSchemas';

describe('validationSchemas', () => {
  describe('loginSchema', () => {
    it('debe validar email válido', async () => {
      const validData = {
        identifier: 'test@example.com',
        password: 'password123',
        userType: 'candidato',
        remember: false
      };

      await expect(loginSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('debe validar documento válido', async () => {
      const validData = {
        identifier: '12345678',
        password: 'password123',
        userType: 'candidato',
        remember: false
      };

      await expect(loginSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('debe rechazar email inválido', async () => {
      const invalidData = {
        identifier: 'invalid-email',
        password: 'password123',
        userType: 'candidato',
        remember: false
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow();
    });

    it('debe rechazar documento inválido', async () => {
      const invalidData = {
        identifier: '123',
        password: 'password123',
        userType: 'candidato',
        remember: false
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow();
    });

    it('debe requerir tipo de usuario', async () => {
      const invalidData = {
        identifier: 'test@example.com',
        password: 'password123',
        remember: false
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow('Debe seleccionar un tipo de usuario');
    });

    it('debe validar tipos de usuario permitidos', async () => {
      const invalidData = {
        identifier: 'test@example.com',
        password: 'password123',
        userType: 'invalid-type',
        remember: false
      };

      await expect(loginSchema.validate(invalidData)).rejects.toThrow('Tipo de usuario no válido');
    });
  });

  describe('registerSchema', () => {
    const validRegisterData = {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      documento: '12345678',
      telefono: '+1234567890',
      fechaNacimiento: '1990-01-01',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      rol: 'estudiante',
      institucion: 'Universidad Test',
      acceptTerms: true
    };

    it('debe validar datos de registro válidos', async () => {
      await expect(registerSchema.validate(validRegisterData)).resolves.toBeDefined();
    });

    it('debe requerir nombre', async () => {
      const invalidData = { ...validRegisterData, nombre: '' };
      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Este campo es obligatorio');
    });

    it('debe validar longitud mínima del nombre', async () => {
      const invalidData = { ...validRegisterData, nombre: 'A' };
      await expect(registerSchema.validate(invalidData)).rejects.toThrow('El nombre debe tener al menos 2 caracteres');
    });

    it('debe validar caracteres del nombre', async () => {
      const invalidData = { ...validRegisterData, nombre: 'Juan123' };
      await expect(registerSchema.validate(invalidData)).rejects.toThrow('El nombre solo puede contener letras');
    });

    it('debe validar email', async () => {
      const invalidData = { ...validRegisterData, email: 'invalid-email' };
      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Debe ser un email válido');
    });

    it('debe validar documento', async () => {
      const invalidData = { ...validRegisterData, documento: '123' };
      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Debe ser un número de documento válido');
    });

    it('debe validar contraseña segura', async () => {
      const invalidData = { ...validRegisterData, password: 'weak' };
      await expect(registerSchema.validate(invalidData)).rejects.toThrow('La contraseña debe contener al menos una mayúscula');
    });

    it('debe validar confirmación de contraseña', async () => {
      const invalidData = { ...validRegisterData, confirmPassword: 'different' };
      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Las contraseñas no coinciden');
    });

    it('debe requerir institución para estudiantes', async () => {
      const invalidData = { ...validRegisterData, rol: 'estudiante', institucion: '' };
      await expect(registerSchema.validate(invalidData)).rejects.toThrow('La institución es obligatoria para estudiantes');
    });

    it('debe requerir especialidad para psicólogos', async () => {
      const invalidData = {
        ...validRegisterData,
        rol: 'psicologo',
        especialidad: '',
        numeroLicencia: '12345'
      };
      await expect(registerSchema.validate(invalidData)).rejects.toThrow('La especialidad es obligatoria para psicólogos');
    });

    it('debe requerir número de licencia para psicólogos', async () => {
      const invalidData = {
        ...validRegisterData,
        rol: 'psicologo',
        especialidad: 'Psicología Clínica',
        numeroLicencia: ''
      };
      await expect(registerSchema.validate(invalidData)).rejects.toThrow('El número de licencia es obligatorio para psicólogos');
    });

    it('debe requerir aceptación de términos', async () => {
      const invalidData = { ...validRegisterData, acceptTerms: false };
      await expect(registerSchema.validate(invalidData)).rejects.toThrow('Debe aceptar los términos y condiciones');
    });
  });

  describe('profileSchema', () => {
    const validProfileData = {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      telefono: '+1234567890',
      biografia: 'Psicólogo especializado en terapia cognitiva',
      sitioWeb: 'https://example.com',
      linkedin: 'https://linkedin.com/in/juan'
    };

    it('debe validar perfil válido', async () => {
      await expect(profileSchema.validate(validProfileData)).resolves.toBeDefined();
    });

    it('debe validar URLs opcionales', async () => {
      const dataWithInvalidUrl = { ...validProfileData, sitioWeb: 'invalid-url' };
      await expect(profileSchema.validate(dataWithInvalidUrl)).rejects.toThrow('Debe ser una URL válida');
    });

    it('debe permitir campos opcionales vacíos', async () => {
      const dataWithEmptyOptionals = {
        ...validProfileData,
        telefono: '',
        biografia: '',
        sitioWeb: '',
        linkedin: ''
      };
      await expect(profileSchema.validate(dataWithEmptyOptionals)).resolves.toBeDefined();
    });

    it('debe validar longitud máxima de biografía', async () => {
      const longBiografia = 'a'.repeat(501);
      const dataWithLongBio = { ...validProfileData, biografia: longBiografia };
      await expect(profileSchema.validate(dataWithLongBio)).rejects.toThrow('La biografía no puede tener más de 500 caracteres');
    });
  });

  describe('validateField', () => {
    it('debe validar campo individual válido', async () => {
      const error = await validateField(loginSchema, 'identifier', 'test@example.com');
      expect(error).toBeNull();
    });

    it('debe retornar error para campo inválido', async () => {
      const error = await validateField(loginSchema, 'identifier', 'invalid');
      expect(error).toBeTruthy();
    });

    it('debe manejar campos requeridos vacíos', async () => {
      const error = await validateField(loginSchema, 'password', '');
      expect(error).toBe('Este campo es obligatorio');
    });
  });

  describe('validateForm', () => {
    it('debe validar formulario completo válido', async () => {
      const validData = {
        identifier: 'test@example.com',
        password: 'password123',
        userType: 'candidato',
        remember: false
      };

      const errors = await validateForm(loginSchema, validData);
      expect(errors).toEqual({});
    });

    it('debe retornar errores para formulario inválido', async () => {
      const invalidData = {
        identifier: '',
        password: '',
        userType: '',
        remember: false
      };

      const errors = await validateForm(loginSchema, invalidData);
      expect(Object.keys(errors)).toContain('identifier');
      expect(Object.keys(errors)).toContain('password');
      expect(Object.keys(errors)).toContain('userType');
    });

    it('debe retornar múltiples errores', async () => {
      const invalidData = {
        identifier: 'invalid-email',
        password: '',
        userType: 'invalid-type',
        remember: false
      };

      const errors = await validateForm(loginSchema, invalidData);
      expect(Object.keys(errors).length).toBeGreaterThan(1);
    });
  });

  describe('sanitizeInput', () => {
    it('debe sanitizar email', () => {
      expect(sanitizeInput('  TEST@EXAMPLE.COM  ', 'email')).toBe('test@example.com');
    });

    it('debe sanitizar nombre', () => {
      expect(sanitizeInput('  Juan   Carlos  ', 'name')).toBe('Juan Carlos');
    });

    it('debe sanitizar teléfono', () => {
      expect(sanitizeInput('+1 (234) 567-8900 ext.123', 'phone')).toBe('+1 (234) 567-8900');
    });

    it('debe sanitizar documento', () => {
      expect(sanitizeInput('12.345.678-9', 'document')).toBe('12345678-9');
    });

    it('debe sanitizar URL', () => {
      expect(sanitizeInput('  HTTPS://EXAMPLE.COM  ', 'url')).toBe('https://example.com');
    });

    it('debe sanitizar texto general', () => {
      expect(sanitizeInput('  texto con espacios  ')).toBe('texto con espacios');
    });

    it('debe manejar valores no string', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe('Validaciones personalizadas', () => {
    it('debe validar documento con formato correcto', async () => {
      const validDocuments = ['12345678', 'ABC123456', '12345678-9', 'A1B2C3D4E5'];
      
      for (const doc of validDocuments) {
        const error = await validateField(registerSchema, 'documento', doc);
        expect(error).toBeNull();
      }
    });

    it('debe rechazar documentos con formato incorrecto', async () => {
      const invalidDocuments = ['123', '12345', 'abc', '!@#$%'];
      
      for (const doc of invalidDocuments) {
        const error = await validateField(registerSchema, 'documento', doc);
        expect(error).toBeTruthy();
      }
    });

    it('debe validar teléfonos con formato correcto', async () => {
      const validPhones = ['+1234567890', '(123) 456-7890', '123-456-7890', '+1 234 567 8900'];
      
      for (const phone of validPhones) {
        const error = await validateField(registerSchema, 'telefono', phone);
        expect(error).toBeNull();
      }
    });

    it('debe validar contraseñas seguras', async () => {
      const validPasswords = ['Password123!', 'MySecure1', 'Test123456'];
      
      for (const password of validPasswords) {
        const error = await validateField(registerSchema, 'password', password);
        expect(error).toBeNull();
      }
    });

    it('debe rechazar contraseñas débiles', async () => {
      const weakPasswords = ['password', '123456', 'PASSWORD', 'Pass1'];
      
      for (const password of weakPasswords) {
        const error = await validateField(registerSchema, 'password', password);
        expect(error).toBeTruthy();
      }
    });
  });
});
