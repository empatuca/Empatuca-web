const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
supabase.from('cierres_diarios').select('*').order('fecha', { ascending: false }).limit(2).then(({data}) => {
  data.forEach((closure, idx) => {
     console.log(`=== CLOSURE ${idx}: ${closure.fecha} ===`);
     const soldMap = {};
     closure.pedidos.forEach(order => {
       if (order.estado === 'rechazado' || order.estado === 'cancelado') return;
       const prods = typeof order.productos === 'string' ? JSON.parse(order.productos) : order.productos;
       if (Array.isArray(prods)) {
         prods.forEach(p => {
           soldMap[p.id] = (soldMap[p.id] || 0) + p.quantity;
         });
       }
     });
     console.log('Sold Map:', soldMap);
     const invMap = closure.inventario.map(i => ({ id: i.id, initial: i.initialStock, current: i.currentStock }));
     console.log('Inventory Snapshot IDs:', invMap.map(i => i.id).join(', '));
  });
});
