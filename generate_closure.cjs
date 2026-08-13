const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  // Fetch orders from August 12, 2026 (local time or UTC? The current date is Aug 13)
  // Let's use UTC bounds for August 12 in Ecuador time (UTC-5). 
  // 2026-08-12T00:00:00-05:00 to 2026-08-12T23:59:59-05:00
  // which is 2026-08-12T05:00:00Z to 2026-08-13T04:59:59Z
  
  const start = new Date('2026-08-12T00:00:00-05:00').toISOString();
  const end = new Date('2026-08-12T23:59:59-05:00').toISOString();
  
  console.log("Fetching orders from", start, "to", end);

  const { data: orders, error: ordersError } = await supabase
    .from('pedidos')
    .select('*')
    .gte('created_at', start)
    .lte('created_at', end);
    
  if (ordersError) {
    console.error("Error fetching orders:", ordersError);
    return;
  }
  
  console.log(`Found ${orders.length} orders on August 12.`);
  
  // Calculate total
  let totalVentas = 0;
  orders.forEach(o => {
     if (o.estado !== 'rechazado' && o.estado !== 'cancelado') {
         totalVentas += Number(o.total || 0);
     }
  });
  
  console.log("Total Ventas:", totalVentas);
  
  // Get current inventory to use as snapshot
  const { data: invData } = await supabase.from('inventario').select('*');
  const inventorySnapshot = invData ? invData.map(i => ({
      id: i.id,
      name: i.name,
      initialStock: i.stock || 0, // Using current stock as initial for the snapshot if initial isn't available
      currentStock: i.stock || 0
  })) : [];
  
  if (orders.length > 0) {
      // Create closure
      const closure = {
         fecha: '12/08/2026', // Standard local format DD/MM/YYYY
         pedidos: orders,
         inventario: inventorySnapshot,
         total_ventas: totalVentas
      };
      
      const { data: insData, error: insError } = await supabase
        .from('cierres_diarios')
        .insert([closure])
        .select();
        
      if (insError) {
         console.error("Error inserting closure:", insError);
      } else {
         console.log("Closure inserted successfully:", insData);
      }
  } else {
      console.log("No orders found for this date. No closure created.");
  }
}

run();
