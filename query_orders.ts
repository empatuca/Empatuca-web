import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('pedidos')
    .select('created_at, total')
    .gte('created_at', '2026-08-09T05:00:00Z')
    .lt('created_at', '2026-08-15T05:00:00Z')
    .order('created_at', { ascending: true });
    
  console.log('Orders found:', data?.length);
}
run();
