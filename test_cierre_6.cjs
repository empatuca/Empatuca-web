const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('cierres_diarios').select('id, fecha, total_ventas, pedidos').eq('fecha', '2026-09-06').single();
  console.log("Cierre Sept 6 ID:", data.id);
  console.log("Total Ventas in DB:", data.total_ventas);
  
  // Filter out the 'Casa' order if it's there
  let newPedidos = data.pedidos.filter(p => p.id !== '1e75531a-a02f-4acc-8e82-320fefe3b41c');
  let newTotal = newPedidos.reduce((s, p) => s + Number(p.total), 0);
  console.log("New Total should be:", newTotal);
  
  // Update the closure
  await supabase.from('cierres_diarios').update({
     total_ventas: newTotal,
     pedidos: newPedidos
  }).eq('id', data.id);
  console.log("Updated cierre successfully to", newTotal);
}
run();
