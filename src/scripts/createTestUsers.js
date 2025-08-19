import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Anon Key is missing. Make sure to set them in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testUsers = [
  {
    email: 'candidato1@example.com',
    password: 'password123',
    role: 'candidato',
    data: { nombre: 'Candidato', apellido: 'Uno', celular: '123456789' }
  },
  {
    email: 'psicologo1@example.com',
    password: 'password123',
    role: 'psicologo',
    data: { nombre: 'Psicologo', apellido: 'Uno', celular: '987654321' }
  }
];

async function createTestUsers() {
  for (const user of testUsers) {
    try {
      // 1. Create user in auth.users
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError.message);
        continue; // Skip to the next user
      }

      if (!authUser || !authUser.user) {
          console.error(`Failed to create auth user ${user.email}, no user data returned.`);
          continue;
      }

      console.log(`Successfully created auth user: ${authUser.user.email}`);
      const userId = authUser.user.id;

      // 2. Insert into corresponding profile table
      let tableName;
      let profileData;

      if (user.role === 'candidato') {
        tableName = 'pacientes'; // Assuming 'pacientes' is the table for candidates
        profileData = {
          id_usuario: userId,
          nombre: user.data.nombre,
          apellido: user.data.apellido,
          celular: user.data.celular,
          email: user.email
        };
      } else if (user.role === 'psicologo') {
        tableName = 'psicologos';
        profileData = {
          id_usuario: userId,
          nombre: user.data.nombre,
          apellido: user.data.apellido,
          email: user.email
        };
      }

      if (tableName) {
        const { error: profileError } = await supabase
          .from(tableName)
          .insert([profileData]);

        if (profileError) {
          console.error(`Error inserting profile for ${user.email} into ${tableName}:`, profileError.message);
        } else {
          console.log(`Successfully created profile for ${user.email} in ${tableName}`);
        }
      } else {
          console.log(`No profile table defined for role: ${user.role}`)
      }

    } catch (error) {
      console.error(`An unexpected error occurred for user ${user.email}:`, error.message);
    }
  }
}

createTestUsers();