const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const t1 = `                      <div>
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
                      </div>`;

const r1 = `                      {Array.isArray(closure.inventario) && closure.inventario.filter((i: any) => i.initialStock > 0).length > 0 && (
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

code = code.replace(t1, r1);
fs.writeFileSync('src/pages/Inventario.tsx', code);
