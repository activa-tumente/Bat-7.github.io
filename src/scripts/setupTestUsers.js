// src/scripts/setupTestUsers.js
import { supabase } from '../api/supabaseClient';
import { toast } from 'react-toastify';

/**
 * Script para verificar y crear usuarios de prueba en Supabase
 * 
 * Este script verifica si los usuarios de prueba existen y los crea si es necesario.
 * Los usuarios creados coinciden con los utilizados en supabaseAuth.js
 */
export const setupTestUsers = async () => {
  console.log('Verificando usuarios de prueba...');
  
  const testUsers = [
    {
      email: 'admin@test.local',
      password: 'Admin123!',
      userData: {
        name: 'Administrador Test',
        role: 'administrador',
        created_at: new Date().toISOString()
      }
    },
    {
      email: 'psicologo@test.local',
      password: 'Psico123!',
      userData: {
        name: 'Psicólogo Test',
        role: 'psicologo',
        created_at: new Date().toISOString()
      }
    },
    {
      email: 'paciente@test.local',
      password: 'Paciente123!',
      userData: {
        name: 'Paciente Test',
        role: 'paciente',
        created_at: new Date().toISOString()
      }
    }
  ];
  
  const results = [];
  
  for (const user of testUsers) {
    try {
      // Verificar si el usuario ya existe intentando iniciar sesión
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });
      
      // Si el inicio de sesión es exitoso, el usuario ya existe
      if (!signInError) {
        console.log(`✅ Usuario ${user.email} ya existe y las credenciales son válidas`);
        results.push({
          email: user.email,
          exists: true,
          created: false,
          success: true,
          message: 'Usuario ya existe y las credenciales son válidas'
        });
        continue;
      }
      
      // Si el error es diferente a credenciales inválidas, podría ser otro problema
      if (signInError.message !== 'Invalid login credentials') {
        console.error(`❌ Error al verificar usuario ${user.email}:`, signInError.message);
        results.push({
          email: user.email,
          exists: false,
          created: false,
          success: false,
          message: `Error al verificar: ${signInError.message}`
        });
        continue;
      }
      
      // El usuario no existe o la contraseña es incorrecta, intentamos crearlo
      console.log(`Usuario ${user.email} no existe o tiene credenciales incorrectas, intentando crear...`);
      
      // Validar formato de correo electrónico antes de intentar crear el usuario
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        console.error(`❌ Formato de correo inválido para ${user.email}`);
        results.push({
          email: user.email,
          exists: false,
          created: false,
          success: false,
          message: `Error: Formato de correo electrónico inválido`
        });
        continue;
      }

      // Crear usuario en Auth
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: user.userData
        }
      });
      
      if (error) {
        console.error(`❌ Error al crear usuario ${user.email}:`, error.message);
        // Proporcionar un mensaje más descriptivo según el tipo de error
        let errorMessage = `Error al crear: ${error.message}`;
        if (error.message.includes("invalid") && error.message.includes("email")) {
          errorMessage = `El correo ${user.email} no es aceptado por Supabase. Intente con un dominio diferente.`;
        }
        
        results.push({
          email: user.email,
          exists: false,
          created: false,
          success: false,
          message: errorMessage
        });

      } else {
        console.log(`✅ Usuario ${user.email} creado con éxito`);
        results.push({
          email: user.email,
          exists: false,
          created: true,
          success: true,
          message: 'Usuario creado con éxito'
        });
        
        // Crear entrada en la tabla de usuarios personalizada si es necesario
        // Nota: Ajusta esto según la estructura de tu base de datos
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: user.email,
                name: user.userData.name,
                role: user.userData.role,
                created_at: user.userData.created_at
              }
            ]);
          
          if (profileError) {
            console.warn(`⚠️ Error al crear perfil para ${user.email}:`, profileError.message);
          } else {
            console.log(`✅ Perfil para ${user.email} creado con éxito`);
          }
        } catch (profileError) {
          console.warn(`⚠️ Error inesperado al crear perfil para ${user.email}:`, profileError.message);
        }
      }
    } catch (error) {
      console.error(`❌ Error inesperado al procesar usuario ${user.email}:`, error.message);
      results.push({
        email: user.email,
        exists: false,
        created: false,
        success: false,
        message: `Error inesperado: ${error.message}`
      });
    }
  }
  
  console.log('Proceso de verificación/creación de usuarios de prueba completado');
  return results;
};

/**
 * Función para verificar si los usuarios de prueba existen y mostrar notificaciones
 * Esta función es útil para llamarla desde componentes de React
 */
export const verifyTestUsers = async () => {
  try {
    const results = await setupTestUsers();
    
    // Contar resultados
    const existingUsers = results.filter(r => r.exists).length;
    const createdUsers = results.filter(r => r.created).length;
    const failedUsers = results.filter(r => !r.success).length;
    
    if (failedUsers > 0) {
      toast.error(`No se pudieron verificar/crear ${failedUsers} usuarios de prueba`);
    }
    
    if (existingUsers > 0 || createdUsers > 0) {
      toast.success(
        `Usuarios de prueba listos: ${existingUsers} existentes, ${createdUsers} creados`
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error al verificar usuarios de prueba:', error);
    toast.error('Error al verificar usuarios de prueba');
    return [];
  }
};

// Exportar función principal
export default setupTestUsers;
