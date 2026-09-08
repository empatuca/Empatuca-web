const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const septStart = '2026-09-01T00:00:00Z';
  
  const { data: pData } = await supabase.from('pedidos')
    .select('id, total, created_at, estado, numero_pedido, metodo_pago')
    .gte('created_at', septStart)
    .not('estado', 'in', '("cancelado","rechazado","archivado")');
    
  let cashOrders = 0;
  let nonCashOrders = 0;
  
  pData.forEach(o => {
    if (o.metodo_pago === 'pendiente' || o.estado === 'pendiente_caja') {
       nonCashOrders += Number(o.total);
    } else {
       cashOrders += Number(o.total);
    }
  });
  console.log("Total Orders:", pData.reduce((s,o)=>s+Number(o.total),0));
  console.log("Cash Orders:", cashOrders);
  console.log("Non-Cash Orders:", nonCashOrders);
}
run();
