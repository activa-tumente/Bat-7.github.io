import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://ydglduxhgwajqdseqzpy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZ2xkdXhoZ3dhanFkc2VxenB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMTI4NDEsImV4cCI6MjA2MTg4ODg0MX0.HEFdJm5qnXU1PQFbF-HkZ-bLez9LuPi3LepirU0nz4c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Usuarios de prueba
const testUsers = [
  {
    email: 'admin@bat7.test',
    password: 'Admin123!',
    documento: '12345678',
    expectedRole: 'administrador'
  },
  {
    email: 'psicologo@bat7.test',
    password: 'Psico123!',
    documento: '87654321',
    expectedRole: 'psicologo'
  },
  {
    email: 'candidato@bat7.test',
    password: 'Candidato123!',
    documento: '11223344',
    expectedRole: 'estudiante'
  }
];

async function testLogin() {
  console.log('🧪 Iniciando pruebas de login...\n');

  for (const testUser of testUsers) {
    console.log(`📧 Probando login con email: ${testUser.email}`);
    
    try {
      // Probar login con email
      const { data: emailLogin, error: emailError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });

      if (emailError) {
        console.error(`❌ Error login con email: ${emailError.message}`);
      } else {
        console.log(`✅ Login exitoso con email`);
        
        // Obtener perfil
        const { data: profile, error: profileError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', emailLogin.user.id)
          .single();

        if (profileError) {
          console.error(`❌ Error obteniendo perfil: ${profileError.message}`);
        } else {
          console.log(`✅ Perfil obtenido: ${profile.nombre} ${profile.apellido} (${profile.rol})`);
          
          if (profile.rol === testUser.expectedRole) {
            console.log(`✅ Rol correcto: ${profile.rol}`);
          } else {
            console.log(`❌ Rol incorrecto. Esperado: ${testUser.expectedRole}, Obtenido: ${profile.rol}`);
          }
        }

        // Logout
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error(`💥 Error inesperado: ${error.message}`);
    }

    console.log(`\n📄 Probando login con documento: ${testUser.documento}`);
    
    try {
      // Probar función RPC para obtener email por documento
      const { data: emailFromDoc, error: rpcError } = await supabase.rpc(
        'get_email_by_documento',
        { p_documento: testUser.documento }
      );

      if (rpcError) {
        console.error(`❌ Error RPC: ${rpcError.message}`);
      } else if (!emailFromDoc) {
        console.error(`❌ No se encontró email para documento: ${testUser.documento}`);
      } else {
        console.log(`✅ Email encontrado por documento: ${emailFromDoc}`);
        
        // Probar login con el email obtenido
        const { data: docLogin, error: docError } = await supabase.auth.signInWithPassword({
          email: emailFromDoc,
          password: testUser.password
        });

        if (docError) {
          console.error(`❌ Error login con documento: ${docError.message}`);
        } else {
          console.log(`✅ Login exitoso con documento`);
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      console.error(`💥 Error inesperado con documento: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');
  }

  console.log('🎉 Pruebas de login completadas');
}

// Ejecutar las pruebas
testLogin().catch(console.error);
