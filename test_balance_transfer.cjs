const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const septStart = '2026-09-01T00:00:00Z';
  
  const { data: pData } = await supabase.from('pedidos')
    .select('id, total, created_at, estado, numero_pedido, metodo_pago')
    .gte('created_at', septStart)
    .not('estado', 'in', '("cancelado","rechazado","archivado")');
    
  let methodSums = {};
  
  pData.forEach(o => {
    methodSums[o.metodo_pago] = (methodSums[o.metodo_pago] || 0) + Number(o.total);
  });
  console.log("By Payment Method:", methodSums);
}
run();
