const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fix() {
  const { data } = await supabase.from('cierres_diarios').select('*').eq('fecha', '2026-08-08').single();
  
  if (data && data.pedidos) {
    const soldMap = {};
    data.pedidos.forEach(order => {
      if (order.estado !== 'rechazado' && order.estado !== 'cancelado') {
        const prods = typeof order.productos === 'string' ? JSON.parse(order.productos) : order.productos;
        if (Array.isArray(prods)) {
          prods.forEach(p => {
            soldMap[p.id] = (soldMap[p.id] || 0) + p.quantity;
            soldMap[p.id + '_name'] = p.name; // Keep name
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
          initialStock: soldMap[k], // Fake initial stock to equal what was sold
          currentStock: 0 // Assume 0 left for history
        });
      }
    });
    
    await supabase.from('cierres_diarios').update({ inventario: inv }).eq('id', data.id);
    console.log("Updated 08-08 inventory!");
  }
}
fix();
