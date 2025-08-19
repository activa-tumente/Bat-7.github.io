
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase URL or service key. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseConnection() {
  try {
    console.log('Connecting to Supabase...');

    // 1. List all tables
    console.log('\n--- 1. Listing tables ---');
    const { data: tables, error: tablesError } = await supabase.rpc('get_table_names');
    if (tablesError) {
      console.error('Error listing tables:', tablesError.message);
      console.log('Please ensure you have executed the `get_table_names.sql` script in your Supabase SQL Editor.');
      return;
    }
    console.log('Tables found:', tables.map(t => t.table_name));

    // 2. Create a test table
    console.log('\n--- 2. Creating test table ---');
    const testTableName = `gemini_test_${Date.now()}`;
    const { error: createError } = await supabase.rpc('execute_sql', { 
      sql_query: `CREATE TABLE ${testTableName} (id SERIAL PRIMARY KEY, name TEXT);` 
    });
    console.log(`Table '${testTableName}' created successfully.`);

    // 3. Insert data
    console.log('\n--- 3. Inserting data ---');
    const { data: insertData, error: insertError } = await supabase
      .from(testTableName)
      .insert({ name: 'test-insertion' })
      .select();
    if (insertError) {
      console.error('Error inserting data:', insertError.message);
      return;
    }
    console.log('Data inserted:', insertData);
    const recordId = insertData[0].id;

    // 4. Query data
    console.log('\n--- 4. Querying data ---');
    const { data: selectData, error: selectError } = await supabase
      .from(testTableName)
      .select('*')
      .eq('id', recordId);
    if (selectError) {
      console.error('Error querying data:', selectError.message);
      return;
    }
    console.log('Data queried:', selectData);

    // 5. Delete data
    console.log('\n--- 5. Deleting data ---');
    const { error: deleteError } = await supabase
      .from(testTableName)
      .delete()
      .eq('id', recordId);
    if (deleteError) {
      console.error('Error deleting data:', deleteError.message);
      return;
    }
    console.log('Data deleted successfully.');

    // 6. Drop the test table
    console.log('\n--- 6. Dropping test table ---');
    const { error: dropError } = await supabase.rpc('execute_sql', { 
      sql_query: `DROP TABLE ${testTableName};` 
    });
    if (dropError) {
      console.error('Error dropping table:', dropError.message);
      return;
    }
    console.log(`Table '${testTableName}' dropped successfully.`);


    console.log('\n\n--- Test finished successfully! ---');

  } catch (error) {
    console.error('An unexpected error occurred:', error);
  } finally {
    // In a real script, you might want to close the connection if the library supports it.
    // supabase-js manages connections automatically.
  }
}

testDatabaseConnection();
