const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

const target = `                    {order.productos?.map((item: any, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="font-black bg-gray-200 text-gray-600 w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                          {item.quantity}
                        </span>
                        <span className="font-medium text-gray-700 leading-tight pt-0.5">
                          {item.name} ({item.size})
                        </span>
                      </li>
                    ))}`;

const replacement = `                    {(order.productos?.filter((i: any) => !i.isAdicional) || []).map((item: any, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="font-black bg-gray-200 text-gray-600 w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                          {item.quantity}
                        </span>
                        <span className="font-medium text-gray-700 leading-tight pt-0.5">
                          {item.name} ({item.size})
                        </span>
                      </li>
                    ))}
                    {order.productos?.some((i: any) => i.isAdicional) && (
                       <>
                         <li className="pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-gray-200 mt-2">
                           Adicionales
                         </li>
                         {order.productos.filter((i: any) => i.isAdicional).map((item: any, i: number) => (
                           <li key={\`adic-\${i}\`} className="flex items-start gap-2 text-sm">
                             <span className="font-black bg-gray-200 text-gray-600 w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                               {item.quantity}
                             </span>
                             <span className="font-medium text-gray-700 leading-tight pt-0.5">
                               {item.name} ({item.size})
                             </span>
                           </li>
                         ))}
                       </>
                    )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/Caja.tsx', code);
