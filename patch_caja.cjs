const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

const approveOrderMatch = `  const approveOrder = async (id: string) => {
     if (isSupabaseConfigured && supabase) {
         await supabase.from('pedidos').update({ estado: 'nuevo' }).eq('id', id);
     } else {
         const idx = localOrders.findIndex(o => o.id === id);
         if (idx > -1) localOrders[idx].estado = 'nuevo';
         notifyLocalListeners();
     }
  };`;

const newApproveOrder = `  const approveOrder = async (id: string) => {
     const order = orders.find(o => o.id === id);
     if (!order) return;
     const isTablePending = order.tipo === 'mesa' && order.metodo_pago === 'pendiente';
     const newEstado = isTablePending ? order.estado : 'nuevo';
     const newMetodoPago = isTablePending ? 'efectivo' : order.metodo_pago;
     
     if (isSupabaseConfigured && supabase) {
         await supabase.from('pedidos').update({ estado: newEstado, metodo_pago: newMetodoPago }).eq('id', id);
     } else {
         const idx = localOrders.findIndex(o => o.id === id);
         if (idx > -1) {
             localOrders[idx].estado = newEstado;
             localOrders[idx].metodo_pago = newMetodoPago;
         }
         notifyLocalListeners();
     }
  };`;

code = code.replace(approveOrderMatch, newApproveOrder);

const filterMatch = `orders.filter(o => o.estado === 'pendiente_caja')`;
const newFilter = `orders.filter(o => o.estado === 'pendiente_caja' || (o.tipo === 'mesa' && o.metodo_pago === 'pendiente'))`;

code = code.replace(new RegExp(filterMatch, 'g'), newFilter);

fs.writeFileSync('src/pages/Caja.tsx', code);
