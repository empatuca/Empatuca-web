const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const septStart = '2026-09-01T00:00:00Z';
  
  // Get all orders from Sept
  const { data: pData } = await supabase.from('pedidos')
    .select('total, created_at, estado')
    .gte('created_at', septStart)
    .not('estado', 'in', '("cancelado","rechazado","archivado")');
    
  // Get all expenses from Sept
  const { data: gData } = await supabase.from('gastos_diarios')
    .select('monto, created_at')
    .gte('created_at', septStart);

  // Group by day for orders
  const ordersByDay = {};
  pData.forEach(o => {
    // Adjust for UTC vs Local time. The user seems to be in GMT-5 (Ecuador) based on email `empatuca.ec`.
    // Let's just group by the YYYY-MM-DD string locally
    const date = new Date(o.created_at);
    date.setMinutes(date.getMinutes() - 300); // approx UTC-5
    const day = date.toISOString().split('T')[0];
    ordersByDay[day] = (ordersByDay[day] || 0) + Number(o.total);
  });

  const gastosByDay = {};
  gData.forEach(o => {
    const date = new Date(o.created_at);
    date.setMinutes(date.getMinutes() - 300);
    const day = date.toISOString().split('T')[0];
    gastosByDay[day] = (gastosByDay[day] || 0) + Number(o.monto);
  });

  console.log("=== ORDERS BY DAY ===");
  console.log(ordersByDay);
  console.log("Total Orders:", pData.reduce((s,o)=>s+Number(o.total),0));
  
  console.log("=== GASTOS BY DAY ===");
  console.log(gastosByDay);
  console.log("Total Gastos:", gData.reduce((s,o)=>s+Number(o.monto),0));
}
run();
