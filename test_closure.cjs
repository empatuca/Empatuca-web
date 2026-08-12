const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
supabase.from('cierres_diarios').select('*').limit(1).then(({data}) => {
  const closure = data[0];
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
  console.log(soldMap);
});
