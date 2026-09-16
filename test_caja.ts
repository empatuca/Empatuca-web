import { getEcuadorDayRange } from './src/lib/utils';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function run() {
  const { data: allOData } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000);

  const orders = allOData || [];
  
  const refDateStr = '2026-08-08';
  const { startOfDayUTC, endOfDayUTC } = getEcuadorDayRange(refDateStr);
  const startDate = new Date(startOfDayUTC);
  const endDate = new Date(endOfDayUTC);

  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  const validOrders = orders.filter(o => {
    if (o.estado === 'cancelado' || o.estado === 'rechazado') return false;
    const t = new Date(o.created_at || Date.now()).getTime();
    if (t < startMs) return false;
    if (t > endMs) return false;
    return true;
  });
  
  console.log(`Found ${orders.length} total orders`);
  console.log(`Found ${validOrders.length} valid orders for Aug 8`);
}
run();
