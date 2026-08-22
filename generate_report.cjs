const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: orders, error } = await supabase.from('pedidos').select('created_at, total, estado').order('created_at', { ascending: true });
  if (error) { console.error(error); return; }
  
  const report = {};
  orders.forEach(o => {
     if (o.estado === 'rechazado' || o.estado === 'cancelado') return;
     
     // Convert UTC to Ecuador time (UTC-5)
     const date = new Date(o.created_at);
     const ecTime = new Date(date.getTime() - (5 * 60 * 60 * 1000));
     const day = ecTime.toISOString().split('T')[0];
     
     if (!report[day]) {
        report[day] = { count: 0, total: 0 };
     }
     report[day].count += 1;
     report[day].total += Number(o.total || 0);
  });
  
  console.log("--- REPORTE POR DIA ---");
  Object.keys(report).sort().forEach(day => {
     console.log(`${day}: ${report[day].count} pedidos - $${report[day].total.toFixed(2)}`);
  });
}
run();
