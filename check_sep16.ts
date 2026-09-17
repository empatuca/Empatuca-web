import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function run() {
  const { data } = await supabase.from('pedidos')
    .select('*')
    .gte('created_at', '2026-09-16T00:00:00Z')
    .lt('created_at', '2026-09-16T23:59:59Z');
    
  console.log('Orders on Sep 16:', data?.length, data);
}

run();
