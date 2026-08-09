const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function del() {
  const { error } = await supabase.from('cierres_diarios').delete().eq('fecha', '2026-08-07');
  console.log("Delete 2026-08-07 error:", error);
}
del();
