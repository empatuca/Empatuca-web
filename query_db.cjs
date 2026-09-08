const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('cierres_diarios').select('*').eq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}
run();
