const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: pData } = await supabase.from('pedidos')
    .select('total, estado, metodo_pago')
    .gte('created_at', '2026-09-01T00:00:00Z');
    
  let sums = {};
  pData.forEach(o => {
    if (o.estado !== 'cancelado' && o.estado !== 'rechazado') {
       sums[o.metodo_pago] = (sums[o.metodo_pago] || 0) + Number(o.total);
    }
  });
  console.log("PAYMENT METHODS:", sums);
}
run();
