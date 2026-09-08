const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('cierres_diarios').select('fecha, pedidos').eq('fecha', '2026-09-06').single();
  let sum = 0;
  data.pedidos.forEach(p => {
      sum += Number(p.total);
      console.log(p.created_at, p.total, p.estado);
  });
  console.log("Total from JSON array:", sum);
}
run();
