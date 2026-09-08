const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const septStart = '2026-09-01T05:00:00Z'; // 00:00 in UTC-5 (Ecuador)
  const { data: globalPedidos } = await supabase
    .from('pedidos')
    .select('total')
    .gte('created_at', septStart)
    .not('estado', 'in', '("cancelado","rechazado")');
  const sumGlobalPedidos = (globalPedidos || []).reduce((sum, o) => sum + Number(o.total || 0), 0);

  const { data: globalGastos } = await supabase
    .from('gastos_diarios')
    .select('monto')
    .gte('created_at', septStart);
  const sumGlobalGastos = (globalGastos || []).reduce((sum, o) => sum + Number(o.monto || 0), 0);
  
  console.log("sumGlobalPedidos (Pedidos):", sumGlobalPedidos);
  console.log("sumGlobalGastos (Gastos):", sumGlobalGastos);
  console.log("globalBalance (Total):", 336.25 + sumGlobalPedidos - sumGlobalGastos);
}
run();
