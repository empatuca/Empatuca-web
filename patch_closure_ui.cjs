const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const newUI = `
        {closures.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8">
             <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Historial de Cierres</h2>
             <div className="space-y-6">
                {closures.map(closure => (
                   <div key={closure.id} className="border-2 border-gray-100 rounded-2xl p-6 bg-gray-50">
                      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                        <h3 className="text-2xl font-black">{closure.fecha}</h3>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-500 uppercase">Total Ventas</p>
                          <p className="text-3xl font-black text-green-700">\${closure.total_ventas.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      {closure.pedidos && closure.pedidos.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm mb-3">Pedidos del Día</h4>
                          <div className="max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl p-3">
                            {closure.pedidos.map((pedido: any) => (
                              <div key={pedido.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <div>
                                  <span className="font-black text-gray-800">#{pedido.numero_pedido}</span>
                                  <span className="text-gray-500 text-sm ml-2">{pedido.nombre_cliente}</span>
                                </div>
                                <span className="font-bold text-green-600">\${pedido.total?.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm mb-3">Resumen de Inventario (Vendidas / Sobraron)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Array.isArray(closure.inventario) && closure.inventario.filter((i: any) => i.initialStock > 0).map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                              <span className="text-gray-700 font-bold truncate pr-2">{item.name}</span>
                              <span className="font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                {(item.initialStock - item.currentStock)} vendidas / {item.currentStock} sobraron
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}
`;

code = code.replace(/\{closures\.length > 0 && \([\s\S]*?<\/[tT]able>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\}/, newUI.trim());

fs.writeFileSync('src/pages/Inventario.tsx', code);
