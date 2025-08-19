// src/scripts/apply_auth_fix.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase environment variables not defined');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyAuthFix() {
  console.log('Applying auth fix to Supabase...');

  const {
    error
  } = await supabase.rpc('execute_sql', {
    sql_query: `
        INSERT INTO auth.config (key, value)
        VALUES ('DISABLE_EMAIL_DOMAIN_RESTRICTIONS', 'true')
        ON CONFLICT (key) DO UPDATE SET value = 'true';

        INSERT INTO auth.config (key, value)
        VALUES ('DISABLE_EMAIL_VERIFICATION', 'true')
        ON CONFLICT (key) DO UPDATE SET value = 'true';
      `
  });

  if (error) {
    console.error('Error applying auth fix:', error.message);
    process.exit(1);
  }

  console.log('Auth fix applied successfully!');
}

applyAuthFix();