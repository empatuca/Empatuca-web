const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const septStart = '2026-09-01T05:00:00Z'; // Sept 1 00:00 ECT
  
  const { data: pData } = await supabase.from('pedidos')
    .select('id, total, created_at, estado, numero_pedido')
    .gte('created_at', septStart)
    .not('estado', 'in', '("cancelado","rechazado","archivado")');
    
  console.log("PEDIDOS", pData);
}
run();
