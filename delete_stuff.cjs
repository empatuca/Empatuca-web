const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: order, error: orderErr } = await supabase.from('pedidos').select('id, numero_pedido, nombre_cliente');
  const matched = (order || []).filter(o => {
     const n = String(o.numero_pedido);
     const c = String(o.nombre_cliente);
     return n.includes('609') || c.includes('609') || c.includes('26Casa');
  });
  console.log("Matched:", matched);
  if (matched.length > 0) {
    const { error: delErr } = await supabase.from('pedidos').delete().eq('id', matched[0].id);
    console.log("Deleted:", delErr);
  }
}
run();
