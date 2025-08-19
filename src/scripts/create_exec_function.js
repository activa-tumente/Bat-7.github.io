// src/scripts/create_exec_function.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase environment variables not defined');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createExecFunction() {
  console.log('Creating exec function in Supabase...');

  const sqlFilePath = path.join(__dirname, '..', 'sql', 'crear_funcion_execute_sql.sql');
  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  const { error } = await supabase.rpc('exec', { sql });

  if (error) {
    console.error('Error creating exec function:', error.message);
    process.exit(1);
  }

  console.log('Exec function created successfully!');
}

createExecFunction();