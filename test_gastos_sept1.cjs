const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('gastos_diarios')
    .select('*')
    .gte('created_at', '2026-09-01T00:00:00Z')
    .lt('created_at', '2026-09-01T05:00:00Z');
  console.log("Gastos in that window:", data);
}
run();
