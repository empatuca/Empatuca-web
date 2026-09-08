const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: globalGastos } = await supabase
    .from('gastos_diarios')
    .select('*')
    .gte('created_at', '2026-09-01T05:00:00Z');
    
  const byDay = {};
  globalGastos.forEach(g => {
     const date = new Date(g.created_at);
     date.setMinutes(date.getMinutes() - 300);
     const day = date.toISOString().split('T')[0];
     byDay[day] = (byDay[day] || 0) + Number(g.monto);
  });
  console.log(byDay);
}
run();
