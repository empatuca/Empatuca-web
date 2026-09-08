const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: cData } = await supabase.from('cierres_diarios')
    .select('*')
    .gte('fecha', '2026-09-01')
    .order('fecha');
    
  console.log("CIERRES DIARIOS:");
  cData.forEach(c => console.log(c.fecha, c.total_ingresos));

  // Let's get all orders for Sept 6 to see what could add up to 84.50 vs 77.50
  const { data: pData } = await supabase.from('pedidos')
    .select('id, total, created_at, estado')
    .gte('created_at', '2026-09-06T00:00:00Z')
    .lt('created_at', '2026-09-07T00:00:00Z');
    
  console.log("\nPEDIDOS ON SEPT 6 (UTC):");
  let sum = 0;
  pData.forEach(o => {
      console.log(o.created_at, o.total, o.estado);
      if (o.estado !== 'cancelado' && o.estado !== 'rechazado') {
          sum += Number(o.total);
      }
  });
  console.log("Total Sept 6 (UTC, valid):", sum);
  
  // What about UTC-5?
  const { data: pDataLocal } = await supabase.from('pedidos')
    .select('id, total, created_at, estado')
    .gte('created_at', '2026-09-06T05:00:00Z')
    .lt('created_at', '2026-09-07T05:00:00Z');
    
  console.log("\nPEDIDOS ON SEPT 6 (Local):");
  let sumLocal = 0;
  pDataLocal.forEach(o => {
      console.log(o.created_at, o.total, o.estado);
      if (o.estado !== 'cancelado' && o.estado !== 'rechazado') {
          sumLocal += Number(o.total);
      }
  });
  console.log("Total Sept 6 (Local, valid):", sumLocal);
}
run();
