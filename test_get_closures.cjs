const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('cierres_diarios').select('*').order('fecha', { ascending: false });
  console.log('Error:', error);
  console.log('Data count:', data?.length);
  if (data?.length > 0) {
    console.log(data[0].fecha, data[0].total_ventas, data[0].pedidos?.length);
    console.log(data[1]?.fecha, data[1]?.total_ventas, data[1]?.pedidos?.length);
  }
}
test();
