const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data } = await supabase.from('cierres_diarios').select('*').eq('fecha', '2026-08-08').single();
  console.log(data.inventario);
}
test();
