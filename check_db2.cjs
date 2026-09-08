const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data, error } = await supabase.from('pedidos').select('id, numero_pedido, estado, total').gte('created_at', today.toISOString());
  console.log("Orders today:", data);
}
run();
