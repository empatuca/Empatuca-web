const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: pData } = await supabase.from('pedidos')
    .select('id, total, created_at, estado, numero_pedido, metodo_pago')
    .not('estado', 'in', '("cancelado","rechazado")');
    
  const { data: gData } = await supabase.from('gastos_diarios')
    .select('monto, created_at');

  const ordersByDay = {};
  pData.forEach(o => {
     const date = new Date(o.created_at);
     date.setMinutes(date.getMinutes() - 300); // UTC-5
     const day = date.toISOString().split('T')[0];
     ordersByDay[day] = (ordersByDay[day] || 0) + Number(o.total);
  });
  
  const gastosByDay = {};
  gData.forEach(o => {
     const date = new Date(o.created_at);
     date.setMinutes(date.getMinutes() - 300); // UTC-5
     const day = date.toISOString().split('T')[0];
     gastosByDay[day] = (gastosByDay[day] || 0) + Number(o.monto);
  });

  console.log("ALL ORDERS BY DAY (INC ARCHIVED):", ordersByDay);
  console.log("ALL GASTOS BY DAY:", gastosByDay);
}
run();
