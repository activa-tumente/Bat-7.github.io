// src/scripts/create_exec_function_direct.js
import 'dotenv/config';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.VITE_SUPABASE_DATABASE_URL;

if (!connectionString) {
  console.error('Error: Supabase database URL not defined');
  process.exit(1);
}

const client = new Client({
  connectionString,
});

async function createExecFunction() {
  try {
    await client.connect();
    console.log('Connected to the database');

    const sqlFilePath = path.join(__dirname, '..', 'sql', 'crear_funcion_execute_sql.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    await client.query(sql);
    console.log('Exec function created successfully!');
  } catch (error) {
    console.error('Error creating exec function:', error.message);
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

createExecFunction();