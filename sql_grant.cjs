const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
  require('dotenv').config();
}

// We can't execute RAW SQL from the regular client without an RPC, so I'll just check if there is data.
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function checkClosures() {
  const { data, error } = await supabase.from('cierres_diarios').select('*');
  console.log('Error:', error);
  console.log('Data:', data?.length);
}
checkClosures();
