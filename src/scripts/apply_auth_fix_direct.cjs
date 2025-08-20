const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const sql = fs.readFileSync(path.resolve(__dirname, '../../sql/fix_auth_config_simple.sql')).toString();

const client = new Client({
  connectionString: process.env.VITE_SUPABASE_DATABASE_URL,
});

async function applyFix() {
  try {
    await client.connect();
    console.log('Connected to the database');
    await client.query(sql);
    console.log('Authentication fix applied successfully');
  } catch (err) {
    console.error('Error applying auth fix:', err);
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

applyFix();