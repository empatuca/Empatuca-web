const fs = require('fs');
let code = fs.readFileSync('src/pages/Cocina.tsx', 'utf8');

// Add confirmOrder state
code = code.replace(
  'const [viewMode, setViewMode] = useState<"activos" | "completados">("activos");',
  'const [viewMode, setViewMode] = useState<"activos" | "completados">("activos");\n  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);'
);

// Replace onClick to open modal
code = code.replace(
  'onClick={() => markAsReady(order.id, order.estado)}',
  'onClick={() => setConfirmOrder(order)}'
);

// Add markAsReady modified (no params needed if using confirmOrder.id, but let's keep params to be safe)

// Add the modal HTML before the closing </main>
const modalCode = `
      {confirmOrder && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 relative">
            <button 
              onClick={() => setConfirmOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-black uppercase text-gray-900 mb-2">Confirmar Pedido</h2>
            <p className="text-gray-500 font-bold mb-6">Revisa que todo esté completo antes de marcar como listo.</p>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 max-h-60 overflow-y-auto border border-gray-100">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                <span className="font-black text-xl text-gray-800">#{confirmOrder.numero_pedido}</span>
                <span className={\`px-2 py-1 rounded-full text-xs font-black tracking-wider uppercase \${
                  confirmOrder.tipo === 'delivery' ? 'bg-purple-100 text-purple-800' :
                  confirmOrder.tipo === 'mesa' ? 'bg-blue-100 text-blue-800' :
                  'bg-[#5a0606] text-white'
                }\`}>
                  {confirmOrder.tipo === 'delivery' ? 'DELIVERY' : confirmOrder.tipo === 'mesa' ? \`MESA \${confirmOrder.mesa}\` : 'LLEVAR'}
                </span>
              </div>
              <ul className="space-y-3">
                {confirmOrder.productos.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-black text-lg text-gray-800 shrink-0 w-6">{item.quantity}x</span>
                    <span className="font-bold text-gray-700 pt-0.5 leading-tight text-lg">
                      {item.name} {item.size && <span className="text-gray-500 font-medium text-sm block">{item.size}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              {confirmOrder.aderezos && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Aderezos Especiales:</p>
                  <div className="flex flex-wrap gap-2">
                    {typeof confirmOrder.aderezos === 'string' 
                      ? (() => {
                          try {
                            const parsed = JSON.parse(confirmOrder.aderezos);
                            return Object.entries(parsed).filter(([_, v]) => v).map(([k]) => (
                               <span key={k} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold uppercase">{k.replace('_', ' ')}</span>
                            ));
                          } catch(e) {
                            return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold uppercase">{confirmOrder.aderezos}</span>
                          }
                        })()
                      : Object.entries(confirmOrder.aderezos || {}).filter(([_, v]) => v).map(([k]) => (
                         <span key={k} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold uppercase">{k.replace('_', ' ')}</span>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setConfirmOrder(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold h-14 rounded-xl"
              >
                Volver
              </Button>
              <Button 
                onClick={() => {
                  markAsReady(confirmOrder.id, confirmOrder.estado);
                  setConfirmOrder(null);
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black h-14 rounded-xl"
              >
                <CheckCircle2 className="mr-2 h-6 w-6" />
                SÍ, ENVIAR
              </Button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  '      </main>\n    </div>',
  modalCode + '\n      </main>\n    </div>'
);

fs.writeFileSync('src/pages/Cocina.tsx', code);
