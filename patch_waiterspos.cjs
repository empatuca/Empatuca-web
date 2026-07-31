const fs = require('fs');
let code = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

// add orderType and address state
code = code.replace(
  'const [tableNumber, setTableNumber] = useState("");',
  'const [tableNumber, setTableNumber] = useState("");\n  const [orderType, setOrderType] = useState<"mesa" | "llevar" | "delivery">("mesa");\n  const [address, setAddress] = useState("");'
);

// fix handleSubmit validation
code = code.replace(
  'if (items.length === 0 || !tableNumber) return;',
  'if (items.length === 0) return;\n    if (orderType === "mesa" && !tableNumber) return;\n    if (orderType === "delivery" && !address) return;'
);

// fix handleSubmit payload
code = code.replace(
  "tipo: 'mesa',\n      mesa: parseInt(tableNumber) || null,\n      direccion_delivery: `Mesa ${tableNumber}`,\n",
  "tipo: orderType,\n      mesa: orderType === 'mesa' ? parseInt(tableNumber) || null : null,\n      direccion_delivery: orderType === 'delivery' ? address : (orderType === 'mesa' ? `Mesa ${tableNumber}` : 'Para Llevar'),\n"
);

// fix JSX form
const oldForm = `<div className="space-y-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
             <div>
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mesa # *</Label>
                <Input type="number" value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="h-10 mt-1 font-bold" placeholder="Ej: 4" />
             </div>
             <div>
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cliente (Opcional)</Label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-10 mt-1" placeholder="Nombre" />
             </div>
           </div>`;

const newForm = `<div className="space-y-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
             <div>
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Tipo de Pedido</Label>
                <div className="flex gap-2">
                   <Button variant={orderType === 'mesa' ? 'default' : 'outline'} onClick={() => setOrderType('mesa')} className={\`flex-1 h-9 \${orderType === 'mesa' ? 'bg-[#5a0606] text-white hover:bg-[#4a0505]' : 'text-gray-600'}\`}>Mesa</Button>
                   <Button variant={orderType === 'llevar' ? 'default' : 'outline'} onClick={() => setOrderType('llevar')} className={\`flex-1 h-9 \${orderType === 'llevar' ? 'bg-[#5a0606] text-white hover:bg-[#4a0505]' : 'text-gray-600'}\`}>Llevar</Button>
                   <Button variant={orderType === 'delivery' ? 'default' : 'outline'} onClick={() => setOrderType('delivery')} className={\`flex-1 h-9 \${orderType === 'delivery' ? 'bg-[#5a0606] text-white hover:bg-[#4a0505]' : 'text-gray-600'}\`}>Delivery</Button>
                </div>
             </div>
             
             {orderType === 'mesa' && (
               <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mesa # *</Label>
                  <Input type="number" value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="h-10 mt-1 font-bold text-black" placeholder="Ej: 4" />
               </div>
             )}
             
             {orderType === 'delivery' && (
               <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dirección *</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} className="h-10 mt-1 font-bold text-black" placeholder="Dirección" />
               </div>
             )}
             
             <div>
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cliente {orderType === 'mesa' ? '(Opcional)' : '*'}</Label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-10 mt-1 text-black" placeholder="Nombre del cliente" />
             </div>
           </div>`;

code = code.replace(oldForm, newForm);

// update submit button disabled logic
code = code.replace(
  'disabled={items.length === 0 || !tableNumber || isSubmitting}',
  'disabled={items.length === 0 || isSubmitting || (orderType === "mesa" && !tableNumber) || (orderType === "delivery" && !address) || (orderType !== "mesa" && !customerName.trim())}'
);

fs.writeFileSync('src/components/home/WaitersPOS.tsx', code);
