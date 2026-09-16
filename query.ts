import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function run() {
  const { count, error } = await supabase.from('pedidos').select('*', { count: 'exact', head: true });
  console.log('Total orders:', count, error);
}
run();
