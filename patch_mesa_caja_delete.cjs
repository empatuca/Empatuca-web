const fs = require('fs');

const deleteFunc = `
  const deleteOrder = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('pedidos').delete().eq('id', id);
      } else {
        const index = localOrders.findIndex(o => o.id === id);
        if (index > -1) {
          localOrders.splice(index, 1);
          notifyLocalListeners();
        }
      }
    }
  };
`;

let mesa = fs.readFileSync('src/pages/Mesa.tsx', 'utf8');
if (!mesa.includes('const deleteOrder')) {
  mesa = mesa.replace("import { Button } from \"@/components/ui/button\";", "import { Button } from \"@/components/ui/button\";\nimport { Trash2 } from \"lucide-react\";\nimport { supabase, localOrders, notifyLocalListeners } from \"../lib/supabase\";");
  mesa = mesa.replace("const markAsReady = async", deleteFunc + "\n  const markAsReady = async");
  
  // Add delete button inside the card header
  mesa = mesa.replace(
    /<div className="flex justify-between items-start mb-4">([\s\S]*?)<\/div>/m,
    `<div className="flex justify-between items-start mb-4">$1
                      <button onClick={() => deleteOrder(order.id)} className="ml-3 text-red-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar/Rechazar Pedido">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>`
  );
  fs.writeFileSync('src/pages/Mesa.tsx', mesa);
}

let caja = fs.readFileSync('src/pages/Caja.tsx', 'utf8');
if (!caja.includes('const deleteOrder')) {
  caja = caja.replace("import { Button } from \"@/components/ui/button\";", "import { Button } from \"@/components/ui/button\";\nimport { Trash2 } from \"lucide-react\";\nimport { supabase, localOrders, notifyLocalListeners } from \"../lib/supabase\";");
  caja = caja.replace("const approveOrder = async", deleteFunc + "\n  const approveOrder = async");
  
  // Add delete button inside the card header for Caja (it has <div className="text-right">)
  caja = caja.replace(
    /<div className="text-right">([\s\S]*?)<\/div>/m,
    `<div className="text-right flex items-start gap-4">
                      <div>$1</div>
                      <button onClick={() => deleteOrder(order.id)} className="mt-1 text-red-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar/Rechazar Pedido">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>`
  );
  fs.writeFileSync('src/pages/Caja.tsx', caja);
}
