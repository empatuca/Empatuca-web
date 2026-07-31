const fs = require('fs');
let code = fs.readFileSync('src/pages/Cocina.tsx', 'utf8');

const oldCode1 = `              className={\`rounded-2xl border-none shadow-sm transition-all overflow-hidden \${
                order.estado === 'listo' 
                ? 'bg-gray-50 opacity-60' 
                : 'bg-[#fac124]' // Amarillo alerta para nuevos pedidos
              }\`}`;

const newCode1 = `              className={\`rounded-2xl border-none shadow-sm transition-all overflow-hidden \${
                order.estado === 'pendiente_caja'
                ? 'bg-gray-200 opacity-50'
                : order.estado === 'listo' 
                ? 'bg-gray-50 opacity-60' 
                : 'bg-[#fac124]' // Amarillo alerta para nuevos pedidos
              }\`}`;

code = code.replace(oldCode1, newCode1);

const oldCode2 = `                  <Badge variant="secondary" className="bg-[#5a0606] text-white hover:bg-[#4a0505] font-black uppercase">
                    {order.tipo === 'delivery' ? 'DELIVERY' : 'LLEVAR'}
                  </Badge>`;
                  
const newCode2 = `                  <Badge variant="secondary" className={\`font-black uppercase \${order.tipo === 'delivery' ? 'bg-purple-800 text-white' : order.tipo === 'mesa' ? 'bg-blue-800 text-white' : 'bg-[#5a0606] text-white'}\`}>
                    {order.tipo === 'delivery' ? 'DELIVERY' : order.tipo === 'mesa' ? \`MESA \${order.mesa}\` : 'LLEVAR'}
                  </Badge>`;

code = code.replace(oldCode2, newCode2);

const oldCode3 = `                {order.estado !== 'listo' && (
                  <Button 
                    onClick={() => markAsReady(order.id, order.estado)}
                    className="w-full h-14 bg-[#0D0D0D] hover:bg-gray-800 text-white font-bold text-lg rounded-xl shadow-lg"
                  >
                    <CheckCircle2 className="mr-2 h-6 w-6 text-[#25D366]" />
                    Listo
                  </Button>
                )}`;
                
const newCode3 = `                {order.estado === 'pendiente_caja' ? (
                  <div className="w-full h-14 bg-gray-300 text-gray-500 font-bold text-sm rounded-xl flex items-center justify-center uppercase tracking-widest">
                    Esperando Pago...
                  </div>
                ) : order.estado !== 'listo' && (
                  <Button 
                    onClick={() => markAsReady(order.id, order.estado)}
                    className="w-full h-14 bg-[#0D0D0D] hover:bg-gray-800 text-white font-bold text-lg rounded-xl shadow-lg"
                  >
                    <CheckCircle2 className="mr-2 h-6 w-6 text-[#25D366]" />
                    Listo
                  </Button>
                )}`;

code = code.replace(oldCode3, newCode3);

fs.writeFileSync('src/pages/Cocina.tsx', code);
