const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
  require('dotenv').config();
}

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function check() {
  const { data: allOrders } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: true });
    
  let total = 0;
  allOrders.forEach(o => {
    if (o.estado !== 'cancelado' && o.estado !== 'rechazado') {
      total += o.total || 0;
    }
  });
  console.log("Total excluding canceled:", total);
  
  const closurePayload = {
    fecha: '2026-08-08',
    total_ventas: total,
    inventario: [],
    pedidos: allOrders
  };
  
  const { error } = await supabase.from('cierres_diarios').update(closurePayload).eq('fecha', '2026-08-08');
  console.log("Update error:", error);
}
check();
