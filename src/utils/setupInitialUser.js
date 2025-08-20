// src/utils/setupInitialUser.js
import supabase from '../api/supabaseClient';

/**
 * Función para verificar si existe algún usuario en la base de datos
 * y crear uno por defecto si es necesario
 */
export const setupInitialUser = async () => {
  try {
    console.log('[SetupInitialUser] Verificando si existen usuarios...');

    // Verificar si hay usuarios en la tabla auth.users
    // Nota: Esto requiere permisos especiales o usar RPC
    // Como alternativa, verificamos en la tabla 'usuarios'
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);

    if (error) {
      console.error('[SetupInitialUser] Error al verificar usuarios:', error);
      return { success: false, error };
    }

    // Si no hay usuarios, crear uno por defecto
    if (!usuarios || usuarios.length === 0) {
      console.log('[SetupInitialUser] No se encontraron usuarios. Creando usuario por defecto...');

      // Crear usuario en Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@example.com',
        password: 'Admin123!',
        options: {
          data: {
            nombre: 'Administrador',
            apellido: 'Sistema',
            role: 'admin'
          }
        }
      });

      if (signUpError) {
        console.error('[SetupInitialUser] Error al crear usuario por defecto:', signUpError);
        return { success: false, error: signUpError };
      }

      // Crear registro en tabla usuarios
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert([{
          id: data.user.id,
          tipo_usuario: 'Administrador',
          nombre: 'Administrador',
          apellido: 'Sistema',
          documento: '12345678',
          fecha_creacion: new Date().toISOString(),
          activo: true
        }]);

      if (insertError) {
        console.error('[SetupInitialUser] Error al crear registro en tabla usuarios:', insertError);
      }

      console.log('[SetupInitialUser] Usuario por defecto creado exitosamente');
      console.log('[SetupInitialUser] Email: admin@example.com, Password: Admin123!');

      return {
        success: true,
        message: 'Usuario por defecto creado. Email: admin@example.com, Password: Admin123!'
      };
    } else {
      console.log('[SetupInitialUser] Se encontraron usuarios existentes. No se creó uno nuevo.');
      return { success: true, message: 'Existen usuarios en la base de datos.' };
    }
  } catch (error) {
    console.error('[SetupInitialUser] Error inesperado:', error);
    return { success: false, error };
  }
};

export default setupInitialUser;
