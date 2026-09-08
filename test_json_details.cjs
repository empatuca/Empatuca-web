const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('cierres_diarios').select('fecha, pedidos').eq('fecha', '2026-09-06').single();
  data.pedidos.forEach(p => {
      if (p.created_at === '2026-09-06T22:30:22.068207+00:00' || p.created_at === '2026-09-07T02:18:34.492929+00:00') {
          console.log(p);
      }
  });
}
run();
