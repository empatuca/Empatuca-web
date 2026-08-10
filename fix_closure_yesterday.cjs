const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fix() {
  const { data: allOrders } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: true });
    
  const dateStr = '2026-08-09';
  
  const ordersYesterday = allOrders.filter(o => {
    const date = new Date(o.created_at);
    date.setHours(date.getHours() - 5); // Ecuador time
    return date.toISOString().split('T')[0] === dateStr;
  });
  
  let total = 0;
  ordersYesterday.forEach(o => {
    if (o.estado !== 'rechazado' && o.estado !== 'cancelado') total += (o.total || 0);
  });
  
  console.log(`Closure ${dateStr}: ${total} (${ordersYesterday.length} orders)`);
  
  if (ordersYesterday.length > 0) {
    const soldMap = {};
    ordersYesterday.forEach(order => {
      if (order.estado !== 'rechazado' && order.estado !== 'cancelado') {
        const prods = typeof order.productos === 'string' ? JSON.parse(order.productos) : order.productos;
        if (Array.isArray(prods)) {
          prods.forEach(p => {
            soldMap[p.id] = (soldMap[p.id] || 0) + p.quantity;
            soldMap[p.id + '_name'] = p.name;
          });
        }
      }
    });
    
    const inv = [];
    Object.keys(soldMap).forEach(k => {
      if (!k.endsWith('_name')) {
        inv.push({
          id: k,
          name: soldMap[k + '_name'],
          initialStock: soldMap[k],
          currentStock: 0
        });
      }
    });

    const payload = {
      fecha: dateStr,
      total_ventas: total,
      inventario: inv,
      pedidos: ordersYesterday
    };
    
    const { data: existing } = await supabase.from('cierres_diarios').select('id').eq('fecha', dateStr).single();
    if (existing) {
       await supabase.from('cierres_diarios').update(payload).eq('id', existing.id);
       console.log('Updated existing closure');
    } else {
       await supabase.from('cierres_diarios').insert([payload]);
       console.log('Inserted new closure');
    }
  }
}
fix();
