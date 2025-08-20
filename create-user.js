// Script para crear un nuevo usuario en Supabase
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://ydglduxhgwajqdseqzpy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZ2xkdXhoZ3dhanFkc2VxenB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMTI4NDEsImV4cCI6MjA2MTg4ODg0MX0.HEFdJm5qnXU1PQFbF-HkZ-bLez9LuPi3LepirU0nz4c';

// Crear cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para crear un nuevo usuario
async function createUser(email, password, userData) {
  try {
    console.log(`Creando nuevo usuario con email: ${email}`);
    
    // Registrar usuario en Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) {
      console.error('Error al crear usuario:', error);
      return { success: false, error };
    }
    
    console.log('Usuario creado exitosamente:', data.user);
    
    // Crear registro en tabla usuarios si es necesario
    if (data.user) {
      const { error: userError } = await supabase
        .from('usuarios')
        .insert([{
          id: data.user.id,
          tipo_usuario: 'Administrador', // Puedes ajustar según tus necesidades
          nombre: userData.nombre || 'Nuevo',
          apellido: userData.apellido || 'Usuario',
          documento: userData.documento || '',
          fecha_creacion: new Date().toISOString(),
          activo: true
        }]);
      
      if (userError) {
        console.error('Error al crear registro en tabla usuarios:', userError);
      } else {
        console.log('Registro creado en tabla usuarios');
      }
    }
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error };
  }
}

// Ejecutar la creación del usuario
async function run() {
  // Datos del nuevo usuario (reemplaza con los datos reales)
  const nuevoUsuario = {
    email: 'admin@example.com',
    password: 'Admin123!',
    userData: {
      nombre: 'Administrador',
      apellido: 'Sistema',
      documento: '12345678',
      role: 'admin'
    }
  };
  
  const result = await createUser(nuevoUsuario.email, nuevoUsuario.password, nuevoUsuario.userData);
  console.log('Resultado de la creación del usuario:', result);
}

// Ejecutar
run();
