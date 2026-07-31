const fs = require('fs');
let code = fs.readFileSync('src/pages/Cocina.tsx', 'utf8');

const oldCode1 = `                  {order.aderezos && (
                    <div className="mt-2 text-xs font-medium text-gray-500 bg-black/5 p-2 rounded-lg">
                      <p className="font-bold mb-1">Aderezos:</p>
                      <p>
                        {order.aderezos.ensalada ? '✅ Ensalada ' : '❌ Ensalada '}
                        {order.aderezos.mayonesa ? '✅ Mayonesa ' : '❌ Mayonesa '}
                        <br/>
                        {order.aderezos.aji ? '✅ Ají ' : '❌ Ají '}
                        {order.aderezos.salsa_pina ? '✅ Salsa de Piña ' : '❌ Salsa de Piña '}
                        <br/>
                        {order.aderezos.salsa_rosada ? '✅ Salsa Rosada' : '❌ Salsa Rosada'}
                      </p>
                    </div>
                  )}`;

const newCode1 = `                  {order.aderezos && (
                    <div className="mt-2 text-xs font-medium text-gray-700 bg-black/5 p-2 rounded-lg">
                      <p className="font-bold mb-1">Aderezos:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(order.aderezos).map(([key, value]) => {
                          if (value) {
                            const name = key === 'salsa_rosada' ? 'Salsa Rosada' : key.charAt(0).toUpperCase() + key.slice(1);
                            return <span key={key} className="bg-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">{name}</span>;
                          }
                          return null;
                        })}
                        {Object.values(order.aderezos).every(v => !v) && <span className="text-gray-400">Sin aderezos</span>}
                      </div>
                    </div>
                  )}`;

code = code.replace(oldCode1, newCode1);
fs.writeFileSync('src/pages/Cocina.tsx', code);
