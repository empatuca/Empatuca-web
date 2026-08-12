const fs = require('fs');
let code = fs.readFileSync('src/pages/Cocina.tsx', 'utf8');

const t1 = `                    {order.productos.map((item, i) => (
                      <li key={i} className={\`flex justify-between items-center text-sm font-bold \${order.estado === 'listo' ? 'text-gray-600' : 'text-[#0D0D0D]'}\`}>
                        <span className="flex gap-2 items-center">
                          <span className={\`h-5 w-5 rounded flex items-center justify-center text-xs text-white \${order.estado === 'listo' ? 'bg-gray-400' : 'bg-[#5a0606]'}\`}>
                            {item.quantity}
                          </span>
                          {item.name} ({item.size})
                        </span>
                      </li>
                    ))}`;

const r1 = `                    {(order.productos.filter((i: any) => !i.isAdicional)).map((item, i) => (
                      <li key={i} className={\`flex justify-between items-center text-sm font-bold \${order.estado === 'listo' ? 'text-gray-600' : 'text-[#0D0D0D]'}\`}>
                        <span className="flex gap-2 items-center">
                          <span className={\`h-5 w-5 rounded flex items-center justify-center text-xs text-white \${order.estado === 'listo' ? 'bg-gray-400' : 'bg-[#5a0606]'}\`}>
                            {item.quantity}
                          </span>
                          {item.name} ({item.size})
                        </span>
                      </li>
                    ))}
                    {order.productos.some((i: any) => i.isAdicional) && (
                       <>
                         <li className="pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider border-t border-gray-200 mt-2">
                           Adicionales
                         </li>
                         {order.productos.filter((i: any) => i.isAdicional).map((item: any, i: number) => (
                           <li key={\`adic-\${i}\`} className={\`flex justify-between items-center text-sm font-bold \${order.estado === 'listo' ? 'text-gray-600' : 'text-[#0D0D0D]'}\`}>
                             <span className="flex gap-2 items-center">
                               <span className={\`h-5 w-5 rounded flex items-center justify-center text-xs text-white \${order.estado === 'listo' ? 'bg-gray-400' : 'bg-[#5a0606]'}\`}>
                                 {item.quantity}
                               </span>
                               {item.name} ({item.size})
                             </span>
                           </li>
                         ))}
                       </>
                    )}`;

const t2 = `                {confirmOrder.productos.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-black text-lg text-gray-800 shrink-0 w-6">{item.quantity}x</span>
                    <span className="font-bold text-gray-700 pt-0.5 leading-tight text-lg">
                      {item.name} {item.size && <span className="text-gray-500 font-medium text-sm block">{item.size}</span>}
                    </span>
                  </li>
                ))}`;

const r2 = `                {(confirmOrder.productos.filter((i: any) => !i.isAdicional)).map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-black text-lg text-gray-800 shrink-0 w-6">{item.quantity}x</span>
                    <span className="font-bold text-gray-700 pt-0.5 leading-tight text-lg">
                      {item.name} {item.size && <span className="text-gray-500 font-medium text-sm block">{item.size}</span>}
                    </span>
                  </li>
                ))}
                {confirmOrder.productos.some((i: any) => i.isAdicional) && (
                   <>
                     <li className="pt-3 pb-1 text-sm font-bold text-gray-400 uppercase tracking-wider border-t border-gray-200 mt-3">
                       Adicionales
                     </li>
                     {confirmOrder.productos.filter((i: any) => i.isAdicional).map((item: any, idx: number) => (
                       <li key={\`adic-\${idx}\`} className="flex items-start gap-3">
                         <span className="font-black text-lg text-gray-800 shrink-0 w-6">{item.quantity}x</span>
                         <span className="font-bold text-gray-700 pt-0.5 leading-tight text-lg">
                           {item.name} {item.size && <span className="text-gray-500 font-medium text-sm block">{item.size}</span>}
                         </span>
                       </li>
                     ))}
                   </>
                )}`;

code = code.replace(t1, r1);
code = code.replace(t2, r2);
fs.writeFileSync('src/pages/Cocina.tsx', code);
