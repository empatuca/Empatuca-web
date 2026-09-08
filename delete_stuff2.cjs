const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { error: delErr } = await supabase.from('pedidos').delete().eq('numero_pedido', 609026);
  console.log("Deleted Casa:", delErr);
}
run();
