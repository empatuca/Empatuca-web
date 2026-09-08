const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const septStart = '2026-09-01T00:00:00Z';
  
  const { data: gData } = await supabase.from('gastos_diarios')
    .select('*')
    .gte('created_at', septStart);
    
  let sums = {};
  
  gData.forEach(o => {
     let cat = o.categoria || 'unknown';
     sums[cat] = (sums[cat] || 0) + Number(o.monto);
  });
  console.log("Gastos by Category:", sums);
}
run();
