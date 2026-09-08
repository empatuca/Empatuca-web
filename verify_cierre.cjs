const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('cierres_diarios').select('fecha, total_ventas').eq('fecha', '2026-09-06').single();
  console.log("Cierre Sept 6:", data.total_ventas);
}
run();
