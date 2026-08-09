const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fix() {
  const { data: allOrders } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: true });
    
  let byDate = {};
  
  for (const o of allOrders) {
    const date = new Date(o.created_at);
    date.setHours(date.getHours() - 5);
    const dateStr = date.toISOString().split('T')[0];
    
    if (!byDate[dateStr]) byDate[dateStr] = [];
    byDate[dateStr].push(o);
  }
  
  for (const dateStr of Object.keys(byDate)) {
    const orders = byDate[dateStr];
    let total = 0;
    orders.forEach(o => {
      if (o.estado !== 'rechazado' && o.estado !== 'cancelado') total += (o.total || 0);
    });
    
    console.log(`Closure ${dateStr}: ${total} (${orders.length} orders)`);
    
    // update or insert closure
    const payload = {
      fecha: dateStr,
      total_ventas: total,
      inventario: [],
      pedidos: orders
    };
    
    const { data: existing } = await supabase.from('cierres_diarios').select('id').eq('fecha', dateStr).single();
    if (existing) {
       await supabase.from('cierres_diarios').update(payload).eq('id', existing.id);
    } else {
       await supabase.from('cierres_diarios').insert([payload]);
    }
  }
}
fix();
