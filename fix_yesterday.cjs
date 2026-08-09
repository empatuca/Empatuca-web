const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
  require('dotenv').config();
}

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

async function fix() {
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  
  const { data: oldOrders, error } = await supabase
    .from('pedidos')
    .select('*')
    .lt('created_at', todayStart.toISOString());
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${oldOrders.length} orders from before today.`);
  
  if (oldOrders.length > 0) {
    const total = oldOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const dateStr = oldOrders[0].created_at.split('T')[0]; // Just use the date of the first order
    
    console.log(`Total: ${total}, Date: ${dateStr}`);
    
    const payload = {
      fecha: dateStr,
      total_ventas: total,
      inventario: [],
      pedidos: oldOrders
    };
    
    const { error: insErr } = await supabase.from('cierres_diarios').insert([payload]);
    if (insErr) {
       console.error("Insert error:", insErr);
    } else {
       console.log("Inserted closure for", dateStr);
    }
  } else {
    console.log("No orders found to create a closure.");
  }
}

fix();
