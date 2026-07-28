/**
 * backend/src/database/supabase/client.js
 * Supabase Client Initialization for Express Backend
 */
const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');

const supabaseKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

if (!config.supabase.serviceRoleKey) {
  console.warn(
    '[Supabase Client] WARNING: SUPABASE_SERVICE_ROLE_KEY is missing in env. ' +
    'Falling back to SUPABASE_ANON_KEY which causes RLS violations on backend database operations.'
  );
}

const supabase = createClient(config.supabase.url, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabase };

