const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
  require('dotenv').config();
}

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function check() {
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);

  const { data: oldOrders } = await supabase
    .from('pedidos')
    .select('*')
    .lt('created_at', todayStart.toISOString())
    .order('created_at', { ascending: true });
    
  console.log("Old orders:");
  oldOrders.forEach(o => console.log(o.numero_pedido, o.nombre_cliente, o.total, o.created_at));
}

check();
