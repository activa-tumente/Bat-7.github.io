require('dotenv').config({ path: 'c:\\Bat-7 version 3\\.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Key must be provided in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSqlFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });

    if (error) {
      console.error('Error executing SQL:', error);
    } else {
      console.log('SQL script executed successfully.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

const sqlFilePath = process.argv[2];

if (!sqlFilePath) {
  console.error('Please provide the path to the SQL file.');
  process.exit(1);
}

executeSqlFile(path.resolve(sqlFilePath));