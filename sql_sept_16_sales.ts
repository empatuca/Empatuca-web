import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(url, key);

async function run() {
  const fakeDate = new Date('2026-09-16T20:00:00-05:00').toISOString(); // Use evening time to be safe in Ecuador timezone
  
  const { data, error } = await supabase.from('pedidos').insert([
    { total: 50.00, estado: 'entregado', items: [], metodo_pago: 'Efectivo', created_at: fakeDate, info_cliente: { nombre: "Manual Cierre" } },
    { total: 45.50, estado: 'entregado', items: [], metodo_pago: 'Transferencia', created_at: fakeDate, info_cliente: { nombre: "Manual Cierre" } }
  ]).select();
  
  console.log("Insert result:", error || data);
}

run();
