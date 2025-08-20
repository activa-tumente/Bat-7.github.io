import supabase from '../api/supabaseClient';
import { toast } from 'react-toastify';

/**
 * Servicio de autenticación para manejar usuarios con diferentes roles:
 * - pacientes (estudiantes)
 * - psicólogos
 * - administradores
 */
class AuthService {
  /**
   * Obtiene el usuario actual autenticado
   * @returns {Promise<Object|null>} Usuario con perfil completo o null
   */
  static async getCurrentUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      // Obtener perfil del usuario desde la tabla usuarios
      const { data: profile, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error al obtener perfil:', error);
        return session.user;
      }

      return { ...session.user, ...profile };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }

  /**
   * Inicia sesión con email/documento y contraseña
   * @param {Object} credentials - Credenciales de acceso
   * @param {string} credentials.identifier - Email o documento
   * @param {string} credentials.password - Contraseña
   * @returns {Promise<Object>} Resultado del login
   */
  static async login({ identifier, password }) {
    try {
      let loginData;
      
      // Determinar si es email o documento
      const isEmail = identifier.includes('@');
      
      if (isEmail) {
        // Login con email
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password
        });
        
        if (error) throw error;
        loginData = data;
      } else {
        // Login con documento - buscar el email asociado
        const { data: userProfile, error: profileError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('documento', identifier)
          .single();

        if (profileError || !userProfile) {
          throw new Error('Usuario no encontrado con ese documento');
        }

        // Obtener el email del usuario desde auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userProfile.id);
        
        if (authError || !authUser.user) {
          throw new Error('Error al obtener datos de autenticación');
        }

        // Hacer login con el email encontrado
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authUser.user.email,
          password
        });
        
        if (error) throw error;
        loginData = data;
      }

      // Obtener perfil completo
      const user = await this.getCurrentUser();
      
      // Actualizar último acceso
      if (user) {
        await supabase
          .from('usuarios')
          .update({ ultimo_acceso: new Date().toISOString() })
          .eq('id', user.id);
      }

      toast.success('Inicio de sesión exitoso');
      
      return {
        success: true,
        user,
        session: loginData.session
      };
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña
   * @param {string} userData.nombre - Nombre
   * @param {string} userData.apellido - Apellido
   * @param {string} userData.documento - Documento de identidad
   * @param {string} userData.rol - Rol (estudiante, psicologo, administrador)
   * @returns {Promise<Object>} Resultado del registro
   */
  static async register(userData) {
    try {
      const { email, password, nombre, apellido, documento, rol = 'estudiante' } = userData;

      // Validar que el documento no esté en uso
      if (documento) {
        const { data: existingUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('documento', documento)
          .single();

        if (existingUser) {
          throw new Error('Ya existe un usuario con ese documento');
        }
      }

      // Registrar en auth.users
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            apellido
          }
        }
      });

      if (error) throw error;

      // Crear perfil en la tabla usuarios
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: data.user.id,
            documento,
            nombre,
            apellido,
            rol,
            activo: true,
            fecha_creacion: new Date().toISOString()
          }
        ]);

      if (profileError) throw profileError;

      toast.success('Registro exitoso');
      
      return {
        success: true,
        user: data.user,
        message: 'Registro exitoso. Revisa tu email para confirmar tu cuenta.'
      };
    } catch (error) {
      console.error('Error de registro:', error);
      toast.error(error.message || 'Error al registrar usuario');
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Cierra la sesión del usuario
   * @returns {Promise<Object>} Resultado del logout
   */
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast.info('Sesión cerrada correctamente');
      
      return { success: true };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error(error.message || 'Error al cerrar sesión');
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Restablece la contraseña del usuario
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Resultado del reset
   */
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast.success('Se ha enviado un enlace para restablecer la contraseña');
      
      return { success: true };
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      toast.error(error.message || 'Error al restablecer contraseña');
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Actualiza la contraseña del usuario
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Resultado de la actualización
   */
  static async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Contraseña actualizada correctamente');
      
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      toast.error(error.message || 'Error al actualizar contraseña');
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {Object} user - Usuario
   * @param {string} role - Rol a verificar
   * @returns {boolean} True si tiene el rol
   */
  static hasRole(user, role) {
    if (!user) return false;
    const userRole = user.rol?.toLowerCase() || '';
    return userRole === role.toLowerCase();
  }

  /**
   * Verifica si el usuario es administrador
   * @param {Object} user - Usuario
   * @returns {boolean} True si es administrador
   */
  static isAdmin(user) {
    return this.hasRole(user, 'administrador');
  }

  /**
   * Verifica si el usuario es psicólogo
   * @param {Object} user - Usuario
   * @returns {boolean} True si es psicólogo
   */
  static isPsychologist(user) {
    return this.hasRole(user, 'psicologo');
  }

  /**
   * Verifica si el usuario es estudiante/paciente
   * @param {Object} user - Usuario
   * @returns {boolean} True si es estudiante
   */
  static isStudent(user) {
    return this.hasRole(user, 'estudiante');
  }
}

export default AuthService;
