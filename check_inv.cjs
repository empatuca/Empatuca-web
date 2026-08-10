const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data } = await supabase.from('cierres_diarios').select('*').order('fecha', { ascending: false });
  console.log(JSON.stringify(data.map(d => ({ fecha: d.fecha, inv_len: d.inventario?.length, first_inv: d.inventario?.[0] })), null, 2));
}
check();
