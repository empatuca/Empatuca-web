const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: orders, error } = await supabase.from('pedidos').select('created_at, total, estado').order('created_at', { ascending: true });
  if (error) { console.error(error); return; }
  
  const report = {};
  let totalOverall = 0;
  let countOverall = 0;

  orders.forEach(o => {
     if (o.estado === 'rechazado' || o.estado === 'cancelado') return;
     
     // Convert UTC to Ecuador time (UTC-5)
     const date = new Date(o.created_at);
     const ecTime = new Date(date.getTime() - (5 * 60 * 60 * 1000));
     
     const monthStr = ecTime.toISOString().slice(0, 7); // YYYY-MM
     const dayStr = ecTime.toISOString().split('T')[0];
     
     if (!report[monthStr]) {
        report[monthStr] = { count: 0, total: 0, days: {} };
     }
     
     if (!report[monthStr].days[dayStr]) {
        report[monthStr].days[dayStr] = { count: 0, total: 0 };
     }
     
     report[monthStr].count += 1;
     report[monthStr].total += Number(o.total || 0);
     
     report[monthStr].days[dayStr].count += 1;
     report[monthStr].days[dayStr].total += Number(o.total || 0);
     
     countOverall += 1;
     totalOverall += Number(o.total || 0);
  });
  
  console.log("--- REPORTE MENSUAL ---");
  Object.keys(report).sort().forEach(month => {
     console.log(`Mes: ${month}`);
     console.log(`Total Pedidos: ${report[month].count}`);
     console.log(`Ingresos Totales: $${report[month].total.toFixed(2)}\n`);
     
     console.log("--- Desglose por dia ---");
     Object.keys(report[month].days).sort().forEach(day => {
         console.log(`  ${day}: ${report[month].days[day].count} pedidos - $${report[month].days[day].total.toFixed(2)}`);
     });
     console.log("-----------------------\n");
  });
  
  console.log(`--- GRAN TOTAL GLOBAL ---`);
  console.log(`Total Pedidos: ${countOverall}`);
  console.log(`Ingresos Totales: $${totalOverall.toFixed(2)}`);
}
run();
