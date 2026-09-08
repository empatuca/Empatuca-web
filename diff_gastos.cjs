const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('gastos_diarios')
    .select('*')
    .gte('created_at', '2026-09-01T00:00:00Z');
  
  let sum = 0;
  data.forEach(g => {
    sum += Number(g.monto);
    if (g.monto === 8 || g.monto === 10) console.log(g.created_at, g.monto, g.descripcion);
  });
  console.log("Total:", sum);
}
run();
