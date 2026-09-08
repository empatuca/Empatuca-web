const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('pedidos').select('id, estado').gte('created_at', '2026-09-07T05:00:00Z');
  if (data) {
    const unarchived = data.filter(d => d.estado !== 'archivado' && d.estado !== 'cancelado' && d.estado !== 'rechazado').map(d => d.id);
    if (unarchived.length > 0) {
      console.log("Archiving", unarchived.length, "orders");
      await supabase.from('pedidos').update({ estado: 'archivado' }).in('id', unarchived);
      console.log("Done");
    } else {
      console.log("None to archive");
    }
  }
}
run();
