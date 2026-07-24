const fs = require('fs');
let code = fs.readFileSync('src/pages/Cocina.tsx', 'utf8');

const aderezosStr = `
                    {order.productos.map((item, i) => (
                      <li key={i} className={\`flex justify-between items-center text-sm font-bold \${order.estado === 'listo' ? 'text-gray-600' : 'text-[#0D0D0D]'}\`}>
                        <span className="flex gap-2 items-center">
                          <span className={\`h-5 w-5 rounded flex items-center justify-center text-xs text-white \${order.estado === 'listo' ? 'bg-gray-400' : 'bg-[#5a0606]'}\`}>
                            {item.quantity}
                          </span>
                          {item.name} ({item.size})
                        </span>
                      </li>
                    ))}
                  </ul>
                  {order.aderezos && (
                    <div className="mt-2 text-xs font-medium text-gray-500 bg-white/50 p-2 rounded-lg">
                      <p className="font-bold mb-1">Aderezos:</p>
                      <p>
                        {order.aderezos.ensalada ? '✅ Ensalada ' : '❌ Ensalada '}
                        {order.aderezos.mayonesa ? '✅ Mayonesa ' : '❌ Mayonesa '}
                        <br/>
                        {order.aderezos.aji ? '✅ Ají ' : '❌ Ají '}
                        {order.aderezos.salsa ? '✅ Salsa' : '❌ Salsa'}
                      </p>
                    </div>
                  )}
`;

code = code.replace(/\{order\.productos\.map\(\(item, i\) => \([\s\S]*?\)\)\} \n                  <\/ul>/, aderezosStr);
fs.writeFileSync('src/pages/Cocina.tsx', code);
