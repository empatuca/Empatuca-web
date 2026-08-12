const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

// 1. Remove inventory reset
const resetTarget = `      // Reset inventory anyway so you can start fresh locally
      const resetInventory = inventory.map(item => ({ ...item, initialStock: 0, currentStock: 0 }));
      setInventory(resetInventory);
      updateLocalInventory(resetInventory);`;
code = code.replace(resetTarget, `      // Eliminado el reseteo automático para que las ventas cuadren con el inventario actual`);

// 2. Change closure rendering to compute sold quantities dynamically
const closureTarget = `                  <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-gray-800">
                        {new Date(closure.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </h3>
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-black text-lg">
                        Total: $\\{Number(closure.total_ventas || 0).toFixed(2)\\}
                      </div>
                    </div>`.replace(/\\/g, ''); // Fix escape for target

const closureReplacement = `                  <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-gray-800">
                        {new Date(closure.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </h3>
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-black text-lg">
                        Total: $\\{Number(closure.total_ventas || 0).toFixed(2)\\}
                      </div>
                    </div>
                    {\\(() => {
                       const soldMap: Record<string, number> = {};
                       if (Array.isArray(closure.pedidos)) {
                         closure.pedidos.forEach((order: any) => {
                           if (order.estado === 'rechazado' || order.estado === 'cancelado') return;
                           const prods = typeof order.productos === 'string' ? JSON.parse(order.productos) : order.productos;
                           if (Array.isArray(prods)) {
                             prods.forEach((p: any) => {
                               if (!p.isAdicional) {
                                 soldMap[p.id] = (soldMap[p.id] || 0) + p.quantity;
                               } else {
                                 soldMap[p.id] = (soldMap[p.id] || 0) + p.quantity;
                               }
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

code = code.replace(closureTarget, closureReplacement);

// 3. Update the mapping logic
const displayTarget = `                      {Array.isArray(closure.inventario) && closure.inventario.filter((i: any) => i.initialStock > 0).length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm mb-3">Resumen de Inventario (Vendidas / Sobraron)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {closure.inventario.filter((i: any) => i.initialStock > 0).map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                                <span className="text-gray-700 font-bold truncate pr-2">{item.name}</span>
                                <span className="font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                  {(item.initialStock - item.currentStock)} vendidas / {item.currentStock} sobraron
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}`;

const displayReplacement = `                      {invDetails.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm mb-3">Resumen de Inventario (Vendidas / Sobraron)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {invDetails.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                                <span className="text-gray-700 font-bold truncate pr-2">{item.name}</span>
                                <span className="font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                  {item.sold} vendidas / {item.initialStock > 0 ? Math.max(0, item.initialStock - item.sold) : 0} sobraron
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                         </>
                       );
                    })()}`;

code = code.replace(displayTarget, displayReplacement);
fs.writeFileSync('src/pages/Inventario.tsx', code);
