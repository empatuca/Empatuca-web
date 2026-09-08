const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: pData } = await supabase.from('pedidos')
    .select('id, total, created_at, estado, numero_pedido, metodo_pago')
    .not('estado', 'in', '("cancelado","rechazado","archivado")');
    
  let byDay = {};
  pData.forEach(o => {
     const date = new Date(o.created_at);
     date.setMinutes(date.getMinutes() - 300);
     const day = date.toISOString().split('T')[0];
     byDay[day] = (byDay[day] || 0) + Number(o.total);
  });
  console.log("ALL UNARCHIVED ORDERS BY DAY:", byDay);
  console.log("Total:", pData.reduce((s,o)=>s+Number(o.total),0));
}
run();
