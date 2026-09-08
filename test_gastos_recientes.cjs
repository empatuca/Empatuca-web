const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: globalGastos } = await supabase
    .from('gastos_diarios')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log(globalGastos);
}
run();
