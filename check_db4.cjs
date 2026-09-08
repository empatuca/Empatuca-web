const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('pedidos').select('*').gte('created_at', '2026-09-07T07:00:00Z');
  console.log("Orders since 2026-09-07T07:00:00Z:", data);
}
run();
