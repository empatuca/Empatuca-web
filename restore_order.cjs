const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const orderToRestore = {
    id: '6f4941fe-f376-4efe-8a23-fc0838e69109',
    mesa: 1,
    tipo: 'mesa',
    total: 3,
    estado: 'entregado',
    aderezos: '{"ensalada":true,"mayonesa":true,"aji":true,"salsa_rosada":true}',
    productos: JSON.stringify([
      { id: 'ev-carne-empatuca', name: '🥩 De Carne (Verde)', size: 'Empatuca', price: 1.25, quantity: 2, isAdicional: false },
      { id: 'beb-cafe-estandar', name: '☕ Café Tradicional (Bebidas)', size: 'Unidad', price: 0.5, quantity: 1, isAdicional: true }
    ]),
    created_at: '2026-09-06T22:30:22.068207+00:00',
    metodo_pago: 'efectivo',
    numero_pedido: 609005,
    nombre_cliente: 'Abuelos',
    direccion_delivery: 'Mesa 1'
  };

  const { data, error } = await supabase.from('pedidos').insert([orderToRestore]);
  if (error) {
     console.error("Error restoring:", error);
  } else {
     console.log("Successfully restored order 609005");
  }
}
run();
