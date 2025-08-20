import { createClient } from '@supabase/supabase-js';

// Obtener las variables de entorno (usando import.meta.env para Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Variables de entorno de Supabase no definidas');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[DEFINIDA]' : '[NO DEFINIDA]');
  console.error('Asegúrate de tener un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
} else {
  console.log('✅ Supabase configurado correctamente');
  console.log('URL:', supabaseUrl);
  console.log('Anon Key:', supabaseAnonKey ? '[DEFINIDA]' : '[NO DEFINIDA]');
}

// Crear el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export { supabase };
export default supabase;
