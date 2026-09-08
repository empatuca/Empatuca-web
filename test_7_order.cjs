const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: pData } = await supabase.from('pedidos')
    .select('id, total, created_at, estado, numero_pedido')
    .eq('total', 7);
  console.log("Orders with total 7:", pData);
}
run();
