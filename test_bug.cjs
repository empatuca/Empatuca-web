const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: fetch1 } = await supabase.from('cierres_diarios').select('inventario').eq('id', '00000000-0000-0000-0000-000000000000').single();
  let inv = fetch1.inventario;
  
  // modify one item
  inv[0].initialStock = 10;
  inv[0].currentStock = 10;
  
  await supabase.from('cierres_diarios').upsert({ id: '00000000-0000-0000-0000-000000000000', fecha: '2099-12-31', inventario: inv, total_ventas: 0 });
  console.log("Updated DB with 10 for item 0");
}
run();
