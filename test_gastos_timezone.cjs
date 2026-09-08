const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: globalGastos } = await supabase
    .from('gastos_diarios')
    .select('*')
    .gte('created_at', '2026-08-30T00:00:00Z')
    .lte('created_at', '2026-09-06T00:00:00Z');
    
  globalGastos.forEach(g => {
     console.log(g.created_at, g.monto, g.descripcion);
  });
}
run();
