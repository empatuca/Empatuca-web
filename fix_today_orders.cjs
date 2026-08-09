const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
  require('dotenv').config();
}

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.log("No Supabase URL/Key found");
  process.exit(1);
}

const supabase = createClient(url, key);

async function fixOrders() {
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  
  const { data: orders, error } = await supabase
    .from('pedidos')
    .select('*')
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Error fetching orders:", error);
    return;
  }
  
  console.log(`Found ${orders.length} orders for today.`);
  
  let i = 1;
  for (const order of orders) {
    const { error: updateError } = await supabase
      .from('pedidos')
      .update({ numero_pedido: i })
      .eq('id', order.id);
      
    if (updateError) {
      console.error(`Error updating order ${order.id}:`, updateError);
    } else {
      console.log(`Updated order ${order.id} to numero_pedido = ${i}`);
    }
    i++;
  }
  
  console.log("Done fixing today's orders.");
}

fixOrders();
