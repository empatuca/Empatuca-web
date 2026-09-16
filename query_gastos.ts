import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('gastos_diarios').select('id, descripcion').gte('created_at', '2026-08-08T00:00:00Z').lt('created_at', '2026-08-08T23:59:59Z');
  console.log('Aug 8 gastos:', data?.length);
}
run();
