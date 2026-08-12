const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

// 1. We need to inject the IIFE opening AFTER the header
const targetOpen = `                   <div key={closure.id} className="border-2 border-gray-100 rounded-2xl p-6 bg-gray-50">
                      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                        <h3 className="text-2xl font-black">{closure.fecha}</h3>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-500 uppercase">Total Ventas</p>
                          <p className="text-3xl font-black text-green-700">$\\{Number(closure.total_ventas).toFixed(2)\\}</p>
                        </div>
                      </div>`.replace(/\\/g, '');

const replaceOpen = targetOpen + `\n                      {\\(() => {
                         const soldMap: Record<string, number> = {};
                         if (Array.isArray(closure.pedidos)) {
                           closure.pedidos.forEach((order: any) => {
                             if (order.estado === 'rechazado' || order.estado === 'cancelado') return;
                             const prods = typeof order.productos === 'string' ? JSON.parse(order.productos) : order.productos;
                             if (Array.isArray(prods)) {
                               prods.forEach((p: any) => {
                                 soldMap[p.id] = (soldMap[p.id] || 0) + p.quantity;
                               });
                             }
                           });
                         }
                         const invDetails = Array.isArray(closure.inventario) 
                           ? closure.inventario.map((item: any) => ({
                               ...item,
                               sold: soldMap[item.id] || 0
                             })).filter((i: any) => i.initialStock > 0 || i.sold > 0)
                           : [];
                         return (
                           <>\\`.replace(/\\/g, '');

code = code.replace(targetOpen, replaceOpen);
fs.writeFileSync('src/pages/Inventario.tsx', code);
