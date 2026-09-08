const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('pedidos')
    .select('id, numero_pedido, total, estado, created_at')
    .not('estado', 'in', '("cancelado","rechazado","archivado")');
  console.log("Unarchived orders:", data);
  const total = data.reduce((sum, o) => sum + Number(o.total), 0);
  console.log("Total:", total);
}
run();
