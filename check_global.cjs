const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: pData } = await supabase.from('pedidos')
    .select('total, estado, created_at')
    .gte('created_at', '2026-09-01T00:00:00Z')
    .not('estado', 'in', '("cancelado","rechazado","archivado")');
  const sumP = pData.reduce((s, o) => s + Number(o.total), 0);
  
  const { data: gData } = await supabase.from('gastos_diarios')
    .select('monto, created_at')
    .gte('created_at', '2026-09-01T00:00:00Z');
  const sumG = gData.reduce((s, o) => s + Number(o.monto), 0);
  
  console.log("Sept Sales:", sumP, "Sept Expenses:", sumG);
}
run();
