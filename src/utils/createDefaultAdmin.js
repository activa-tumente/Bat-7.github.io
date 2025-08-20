// src/utils/createDefaultAdmin.js
import supabase from '../api/supabaseClient';

/**
 * Crea un usuario administrador predeterminado si no existe ninguno
 * Esto es útil para entornos de desarrollo y pruebas
 */
export const createDefaultAdmin = async () => {
  console.log('[AdminSetup] Verificando si existe un usuario administrador...');

  try {
    // Primero, verificar si podemos conectar con Supabase
    const { error: connectionError } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('[AdminSetup] Error al conectar con Supabase:', connectionError);
      return {
        success: false,
        error: 'No se pudo conectar con Supabase: ' + connectionError.message
      };
    }

    // Intentar obtener todos los usuarios con rol de administrador
    const { data: admins, error: adminsError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tipo_usuario', 'admin');

    if (adminsError) {
      console.error('[AdminSetup] Error al buscar administradores:', adminsError);
      return {
        success: false,
        error: 'Error al buscar administradores: ' + adminsError.message
      };
    }

    // Si ya hay administradores, no hacer nada
    if (admins && admins.length > 0) {
      console.log(`[AdminSetup] Ya existen ${admins.length} administradores en el sistema.`);
      return {
        success: true,
        message: `Ya existen ${admins.length} administradores en el sistema.`,
        admins
      };
    }

    // Si no hay administradores, crear uno predeterminado
    console.log('[AdminSetup] No se encontraron administradores. Creando administrador predeterminado...');

    // Datos del administrador predeterminado
    const defaultAdmin = {
      email: 'admin@example.com',
      password: 'Admin123!',
      nombre: 'Administrador',
      apellido: 'Sistema',
      tipo_usuario: 'admin',
      documento: '12345678'
    };

    // Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: defaultAdmin.email,
      password: defaultAdmin.password,
      options: {
        data: {
          nombre: defaultAdmin.nombre,
          apellido: defaultAdmin.apellido,
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.error('[AdminSetup] Error al crear usuario en Auth:', authError);

      // Si el error es que el usuario ya existe, intentar continuar
      if (authError.message.includes('already exists')) {
        console.log('[AdminSetup] El usuario ya existe en Auth. Intentando encontrarlo...');

        // Intentar iniciar sesión para obtener el ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: defaultAdmin.email,
          password: defaultAdmin.password
        });

        if (signInError) {
          console.error('[AdminSetup] Error al iniciar sesión con el usuario existente:', signInError);
          return {
            success: false,
            error: 'Error al iniciar sesión con el usuario existente: ' + signInError.message
          };
        }

        // Usar el ID del usuario existente
        authData = signInData;
      } else {
        return {
          success: false,
          error: 'Error al crear usuario en Auth: ' + authError.message
        };
      }
    }

    // Si tenemos un usuario, crear el registro en la tabla 'usuarios'
    if (authData && authData.user) {
      const { error: userError } = await supabase
        .from('usuarios')
        .insert([{
          id: authData.user.id,
          nombre: defaultAdmin.nombre,
          apellido: defaultAdmin.apellido,
          tipo_usuario: defaultAdmin.tipo_usuario,
          documento: defaultAdmin.documento,
          email: defaultAdmin.email,
          fecha_creacion: new Date().toISOString(),
          activo: true
        }]);

      if (userError) {
        console.error('[AdminSetup] Error al crear registro en tabla usuarios:', userError);

        // Si el error es que el usuario ya existe, no es un problema crítico
        if (userError.code === '23505') { // unique_violation
          console.log('[AdminSetup] El usuario ya existe en la tabla usuarios.');
          return {
            success: true,
            message: 'El administrador ya existe en el sistema.',
            credentials: {
              email: defaultAdmin.email,
              password: defaultAdmin.password
            }
          };
        }

        return {
          success: false,
          error: 'Error al crear registro en tabla usuarios: ' + userError.message
        };
      }

      console.log('[AdminSetup] Administrador predeterminado creado exitosamente.');
      return {
        success: true,
        message: 'Administrador predeterminado creado exitosamente.',
        credentials: {
          email: defaultAdmin.email,
          password: defaultAdmin.password
        }
      };
    }

    return {
      success: false,
      error: 'No se pudo crear el administrador por razones desconocidas.'
    };
  } catch (error) {
    console.error('[AdminSetup] Error inesperado:', error);
    return {
      success: false,
      error: 'Error inesperado: ' + error.message
    };
  }
};

export default createDefaultAdmin;
