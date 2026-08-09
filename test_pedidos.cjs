const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
  require('dotenv').config();
}

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('pedidos').select('*');
  console.log('Total orders:', data?.length);
  
  const old = data.filter(o => new Date(o.created_at).getTime() < new Date().setHours(0,0,0,0));
  console.log('Old orders:', old.length);
  console.log('Old Total:', old.reduce((sum, o) => sum + (o.total || 0), 0));
}

test();
