const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: pData } = await supabase.from('pedidos')
    .select('id, total, created_at, estado')
    .gte('created_at', '2026-09-05T00:00:00Z')
    .lt('created_at', '2026-09-08T00:00:00Z')
    .not('estado', 'in', '("cancelado","rechazado")');
    
  pData.forEach(o => {
     console.log(o.created_at, o.total);
  });
}
run();
