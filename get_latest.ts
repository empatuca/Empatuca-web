import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function run() {
  const { data } = await supabase.from('pedidos')
    .select('id, numero_pedido, nombre_cliente, total, created_at')
    .order('created_at', { ascending: false })
    .limit(30);
    
  console.log("Latest orders overall:", data);
}

run();
