const fs = require('fs');

// Patch WaitersPOS.tsx
let posCode = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

posCode = posCode.replace(
  'export function WaitersPOS({ onCancel }: { onCancel: () => void }) {',
  'export function WaitersPOS({ onCancel, initialOrder }: { onCancel: () => void, initialOrder?: any }) {'
);

posCode = posCode.replace(
  'const [items, setItems] = useState<OrderItem[]>([]);\n  const [tableNumber, setTableNumber] = useState("");',
  `const [items, setItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  
  React.useEffect(() => {
    if (initialOrder) {
      setItems(initialOrder.productos || []);
      setOrderType(initialOrder.tipo || 'mesa');
      setTableNumber(initialOrder.mesa ? String(initialOrder.mesa) : "");
      setAddress(initialOrder.direccion_delivery || "");
      setCustomerName(initialOrder.nombre_cliente !== 'Mesa' ? initialOrder.nombre_cliente : "");
      if (initialOrder.aderezos) {
        try {
          const parsed = typeof initialOrder.aderezos === 'string' ? JSON.parse(initialOrder.aderezos) : initialOrder.aderezos;
          if (parsed && typeof parsed === 'object') setAderezos(parsed);
        } catch(e){}
      }
    }
  }, [initialOrder]);`
);

posCode = posCode.replace(
  '    const orderIdValue = Math.floor(Math.random() * 1000);',
  '    const orderIdValue = initialOrder ? initialOrder.numero_pedido : Math.floor(Math.random() * 1000);'
);

posCode = posCode.replace(
  `      let { error } = await supabase.from('pedidos').insert([payload]);
      if (error && error.message && error.message.includes('invalid input syntax')) {
         payload.productos = JSON.stringify(payload.productos) as any;
         await supabase.from('pedidos').insert([payload]);
      }`,
  `      if (initialOrder) {
        let { error } = await supabase.from('pedidos').update(payload).eq('id', initialOrder.id);
        if (error && error.message && error.message.includes('invalid input syntax')) {
           payload.productos = JSON.stringify(payload.productos) as any;
           await supabase.from('pedidos').update(payload).eq('id', initialOrder.id);
        }
      } else {
        let { error } = await supabase.from('pedidos').insert([payload]);
        if (error && error.message && error.message.includes('invalid input syntax')) {
           payload.productos = JSON.stringify(payload.productos) as any;
           await supabase.from('pedidos').insert([payload]);
        }
      }`
);

posCode = posCode.replace(
  `      localOrders.push({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...orderData
      });`,
  `      if (initialOrder) {
        const idx = localOrders.findIndex(o => o.id === initialOrder.id);
        if (idx > -1) {
          localOrders[idx] = { ...localOrders[idx], ...orderData };
        }
      } else {
        localOrders.push({
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...orderData
        });
      }`
);

posCode = posCode.replace(
  `"MANDAR A COCINA"`,
  `initialOrder ? "GUARDAR CAMBIOS" : "MANDAR A COCINA"`
);

// Ensure React is imported if we use React.useEffect
if (!posCode.includes('import React')) {
  posCode = 'import React, { useState } from "react";\n' + posCode;
} else if (posCode.includes('import React, { useState }') && !posCode.includes('useEffect')) {
  posCode = posCode.replace('import React, { useState }', 'import React, { useState, useEffect }');
  posCode = posCode.replace('React.useEffect', 'useEffect');
}

fs.writeFileSync('src/components/home/WaitersPOS.tsx', posCode);

// Patch Mesa.tsx
let mesaCode = fs.readFileSync('src/pages/Mesa.tsx', 'utf8');

mesaCode = mesaCode.replace(
  "import { Trash2 } from \"lucide-react\";",
  "import { Trash2, Edit } from \"lucide-react\";"
);

mesaCode = mesaCode.replace(
  "const [view, setView] = useState<'pedidos' | 'nuevo'>('pedidos');",
  "const [view, setView] = useState<'pedidos' | 'nuevo'>('pedidos');\n  const [editingOrder, setEditingOrder] = useState<any>(null);"
);

mesaCode = mesaCode.replace(
  "                <button onClick={() => setView('pedidos')} className=\"bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors\">\n                   Ver Pedidos\n                </button>",
  "                <button onClick={() => { setView('pedidos'); setEditingOrder(null); }} className=\"bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors\">\n                   Ver Pedidos\n                </button>"
);

mesaCode = mesaCode.replace(
  "                <button onClick={() => setView('nuevo')} className=\"bg-[#fac124] hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2\">\n                   <PlusCircle className=\"w-4 h-4\" /> Nuevo Pedido\n                </button>",
  "                <button onClick={() => { setEditingOrder(null); setView('nuevo'); }} className=\"bg-[#fac124] hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2\">\n                   <PlusCircle className=\"w-4 h-4\" /> Nuevo Pedido\n                </button>"
);

mesaCode = mesaCode.replace(
  "<WaitersPOS onCancel={() => setView('pedidos')} />",
  "<WaitersPOS initialOrder={editingOrder} onCancel={() => { setView('pedidos'); setEditingOrder(null); }} />"
);

mesaCode = mesaCode.replace(
  `                          <button onClick={() => deleteOrder(order.id)} className="text-red-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar/Rechazar Pedido">
                            <Trash2 className="w-5 h-5" />
                          </button>`,
  `                          <button onClick={() => { setEditingOrder(order); setView('nuevo'); }} className="text-blue-400 hover:text-blue-600 transition-colors shrink-0" title="Editar Pedido">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => deleteOrder(order.id)} className="text-red-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar/Rechazar Pedido">
                            <Trash2 className="w-5 h-5" />
                          </button>`
);

// Fix the numero_pedido text if it's undefined
mesaCode = mesaCode.replace(
  `<h3 className="font-black text-3xl">#{order.numero_pedido}</h3>`,
  `<h3 className="font-black text-3xl">#{order.numero_pedido || 'N/A'}</h3>`
);

fs.writeFileSync('src/pages/Mesa.tsx', mesaCode);
