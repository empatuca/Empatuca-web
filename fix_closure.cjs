const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('cierres_diarios')
    .update({ fecha: '2026-08-12' })
    .eq('id', '895ad2d7-13c9-4bec-8239-a43a76cbea4d')
    .select();
  console.log(data, error);
}
run();
