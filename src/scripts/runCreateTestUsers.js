// src/scripts/runCreateTestUsers.js
import supabase from '../api/supabaseClient';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Verificar que el cliente Supabase tenga la estructura esperada
if (!supabase || typeof supabase.from !== 'function' || !supabase.auth || typeof supabase.auth.getSession !== 'function') {
  console.error('Error: El cliente Supabase no tiene la estructura esperada');
  process.exit(1);
}

/**
 * Script para crear usuarios de prueba en Supabase
 */
const createTestUsers = async () => {
  console.log('Iniciando creación de usuarios de prueba...');

  const testUsers = [
    {
      email: 'admin.test.bat7@gmail.com',
      password: 'Admin123!',
      userData: {
        name: 'Administrador Test',
        role: 'admin',
        created_at: new Date().toISOString()
      }
    },
    {
      email: 'profesional.test.bat7@gmail.com',
      password: 'Prof123!',
      userData: {
        name: 'Profesional Test',
        role: 'professional',
        created_at: new Date().toISOString()
      }
    },
    {
      email: 'estudiante.test.bat7@gmail.com',
      password: 'Estud123!',
      userData: {
        name: 'Estudiante Test',
        role: 'student',
        created_at: new Date().toISOString()
      }
    }
  ];

  for (const user of testUsers) {
    try {
      console.log(`Creando usuario ${user.email}...`);

      // Crear usuario en Auth
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: user.userData
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`Usuario ${user.email} ya existe, actualizando metadatos...`);

          // Intentar iniciar sesión para obtener el ID del usuario
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          if (signInError) {
            console.error(`Error al iniciar sesión con ${user.email}:`, signInError.message);
            continue;
          }

          // Actualizar metadatos del usuario
          const { error: updateError } = await supabase.auth.updateUser({
            data: user.userData
          });

          if (updateError) {
            console.error(`Error al actualizar metadatos de ${user.email}:`, updateError.message);
          } else {
            console.log(`Metadatos de ${user.email} actualizados con éxito`);
          }

          // Cerrar sesión
          await supabase.auth.signOut();
        } else {
          console.error(`Error al crear usuario ${user.email}:`, error.message);
        }
      } else {
        console.log(`Usuario ${user.email} creado con éxito`);
      }
    } catch (error) {
      console.error(`Error inesperado al crear usuario ${user.email}:`, error.message);
    }
  }

  console.log('Proceso de creación de usuarios de prueba completado');
};

// Ejecutar la función
createTestUsers()
  .catch(error => {
    console.error('Error en el script:', error);
  })
  .finally(() => {
    console.log('Script finalizado');
    process.exit(0);
  });
