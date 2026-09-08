const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('cierres_diarios').select('*').order('fecha');
  console.log("Cierres Diarios:", data);
}
run();
