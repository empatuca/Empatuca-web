const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

// add import for X
code = code.replace('import { Clock, CheckCircle2, DollarSign } from "lucide-react";', 'import { Clock, CheckCircle2, DollarSign, X } from "lucide-react";');

// add state
code = code.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n  const [showAllOrders, setShowAllOrders] = useState(false);');

// replace title with title + button
const targetTitle = `<h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Últimos Pedidos Confirmados</h3>`;
const replaceTitle = `<div className="flex items-center justify-between mb-6">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Últimos Pedidos Confirmados</h3>
             <Button variant="outline" size="sm" onClick={() => setShowAllOrders(true)} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800">Ver todos</Button>
           </div>`;

code = code.replace(targetTitle, replaceTitle);

// add modal at the end before </div></div>
const targetEnd = `      </div>
    </div>
  );
}`;

const replaceEnd = `      </div>

      {showAllOrders && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="font-black text-2xl text-gray-900">Todos los pedidos del día</h3>
                <button onClick={() => setShowAllOrders(false)} className="text-gray-400 hover:bg-gray-100 hover:text-gray-900 p-2 rounded-full transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>
             <div className="p-6 overflow-y-auto">
               <table className="w-full text-left text-sm">
                 <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                       <th className="py-3 font-bold">Pedido</th>
                       <th className="py-3 font-bold">Cliente</th>
                       <th className="py-3 font-bold">Total</th>
                       <th className="py-3 font-bold">Método</th>
                       <th className="py-3 font-bold">Estado</th>
                    </tr>
                 </thead>
                 <tbody>
                    {orders.filter(o => o.estado !== 'pendiente_caja' && !(o.metodo_pago === 'pendiente')).map(order => (
                       <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-3 font-black text-black">#{formatOrderNumber(order.numero_pedido)}</td>
                          <td className="py-3 font-bold text-gray-800">{order.nombre_cliente}</td>
                          <td className="py-3 font-black text-green-700">\${order.total}</td>
                          <td className="py-3 text-gray-500 capitalize">{order.metodo_pago}</td>
                          <td className="py-3">
                             <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600 uppercase">
                                {order.estado}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(targetEnd, replaceEnd);
fs.writeFileSync('src/pages/Caja.tsx', code);
