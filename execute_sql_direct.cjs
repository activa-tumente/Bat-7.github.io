require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.VITE_SUPABASE_DATABASE_URL;

if (!connectionString) {
  console.error('Database connection string must be provided in environment variables.');
  process.exit(1);
}

async function executeSqlFile(filePath) {
  // Supabase suele requerir SSL
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to the database.');

    const sql = fs.readFileSync(filePath, 'utf8');
    await client.query(sql);

    console.log('SQL script executed successfully.');
  } catch (err) {
    if (err && (err.code === 'ENOTFOUND' || /getaddrinfo.*ENOTFOUND/i.test(String(err)))) {
      console.error('DNS resolution error (ENOTFOUND). Please verify the database host resolves from this machine.');
      console.error('- Tip: Try nslookup on the host in VITE_SUPABASE_DATABASE_URL.');
      console.error('- If using Supabase, consider using the pooled connection host (e.g., aws-*.pooler.supabase.com:6543) in DATABASE_URL.');
    }
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
    console.log('Connection to the database has been closed.');
  }
}

const sqlFilePath = process.argv[2];

if (!sqlFilePath) {
  console.error('Please provide the path to the SQL file.');
  process.exit(1);
}

executeSqlFile(path.resolve(sqlFilePath));