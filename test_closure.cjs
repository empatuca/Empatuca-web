const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
  require('dotenv').config();
}

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('cierres_diarios').select('*');
  console.log(data);
}

test();
