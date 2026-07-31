const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

const oldCode1 = `                  <div>
                    <h3 className="font-black text-3xl">#{order.numero_pedido}</h3>
                    <p className="text-sm font-bold text-gray-600 uppercase mt-1">{order.nombre_cliente}</p>
                  </div>`;
                  
const newCode1 = `                  <div>
                    <h3 className="font-black text-3xl">#{order.numero_pedido}</h3>
                    <p className="text-sm font-bold text-gray-600 uppercase mt-1 mb-2">{order.nombre_cliente}</p>
                    <span className={\`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase \${
                         order.tipo === 'delivery' ? 'bg-purple-100 text-purple-800' :
                         order.tipo === 'mesa' ? 'bg-blue-100 text-blue-800' :
                         'bg-[#5a0606] text-white'
                      }\`}>
                        {order.tipo === 'delivery' ? 'DELIVERY' : order.tipo === 'mesa' ? \`MESA \${order.mesa}\` : 'LLEVAR'}
                    </span>
                  </div>`;

code = code.replace(oldCode1, newCode1);
fs.writeFileSync('src/pages/Caja.tsx', code);
