const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: pData } = await supabase.from('pedidos')
    .select('id, total, created_at, estado, numero_pedido, metodo_pago')
    .gte('created_at', '2026-08-31T00:00:00Z');
    
  let archivedTotal = 0;
  pData.forEach(o => {
    if (o.estado === 'archivado') {
      archivedTotal += Number(o.total);
      console.log("Archived Order:", o.created_at, o.total);
    }
  });
  console.log("Total Archived:", archivedTotal);
}
run();
