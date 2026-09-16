import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function run() {
  const { count } = await supabase.from('gastos_diarios').select('*', { count: 'exact', head: true });
  console.log('Total gastos:', count);
}
run();
