const fs = require('fs');

let mesa = fs.readFileSync('src/pages/Mesa.tsx', 'utf8');

mesa = mesa.replace(
  /<div className="flex justify-between items-start mb-4">[\s\S]*?<h3 className="font-black text-3xl">#\{order\.numero_pedido\}<\/h3>[\s\S]*?<p className="text-sm font-bold text-gray-600 uppercase mt-1">\{order\.nombre_cliente\}<\/p>[\s\S]*?<button onClick=\{\(\) => deleteOrder\(order\.id\)\} className="ml-3 text-red-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar\/Rechazar Pedido">[\s\S]*?<Trash2 className="w-5 h-5" \/>[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?<span className=\{\`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase \\\$\{\s*order\.tipo === 'delivery' \? 'bg-purple-100 text-purple-800' :\s*order\.tipo === 'mesa' \? 'bg-blue-100 text-blue-800' :\s*'bg-\[#5a0606\] text-white'\s*\}\`\}>[\s\S]*?\{order\.tipo === 'delivery' \? 'DELIVERY' : order\.tipo === 'mesa' \? \`MESA \$\{order\.mesa\}\` : 'LLEVAR'\}[\s\S]*?<\/span>[\s\S]*?<\/div>/,
  `<div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-3xl">#{order.numero_pedido}</h3>
                          <button onClick={() => deleteOrder(order.id)} className="text-red-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar/Rechazar Pedido">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-gray-600 uppercase mt-1">{order.nombre_cliente}</p>
                      </div>
                      <span className={\`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase \${
                         order.tipo === 'delivery' ? 'bg-purple-100 text-purple-800' :
                         order.tipo === 'mesa' ? 'bg-blue-100 text-blue-800' :
                         'bg-[#5a0606] text-white'
                      }\`}>
                        {order.tipo === 'delivery' ? 'DELIVERY' : order.tipo === 'mesa' ? \`MESA \${order.mesa}\` : 'LLEVAR'}
                      </span>
                    </div>`
);

fs.writeFileSync('src/pages/Mesa.tsx', mesa);
