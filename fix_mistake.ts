import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function run() {
  // Delete the recently injected orders
  const { data, error } = await supabase.from('pedidos')
    .delete()
    .gte('numero_pedido', 169013)
    .lte('numero_pedido', 169020)
    .select('id, numero_pedido');
    
  console.log("Deleted injected orders:", data?.length, error);
}

run();
