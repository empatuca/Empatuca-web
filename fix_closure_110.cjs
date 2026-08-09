const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
  require('dotenv').config();
}

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function fix() {
  const { error: errUp } = await supabase.from('cierres_diarios').update({ total_ventas: 110 }).eq('fecha', '2026-08-08');
  if (errUp) {
    console.error(errUp);
  } else {
    console.log("Updated to 110");
  }
}

fix();
