import React, { useState } from "react";
import { siteConfig } from "../../../siteConfig";
import { Button } from "@/components/ui/button";
import { Plus, Minus, CheckCircle2, ShoppingCart, Info, Check, Trash2, X, ChevronUp } from "lucide-react";
import { supabase, localOrders, notifyLocalListeners } from "../../lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface OrderItem {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export function WaitersPOS({ onCancel }: { onCancel: () => void }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState<"mesa" | "llevar" | "delivery">("mesa");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [aderezos, setAderezos] = useState({ ensalada: true, mayonesa: true, aji: true, salsa_rosada: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const updateQuantity = (id: string, name: string, size: string, price: number, delta: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        const next = existing.quantity + delta;
        if (next <= 0) return prev.filter(i => i.id !== id);
        return prev.map(i => i.id === id ? { ...i, quantity: next } : i);
      }
      if (delta > 0) return [...prev, { id, name, size, price, quantity: delta }];
      return prev;
    });
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    if (items.length === 0) return;
    if (orderType === "mesa" && !tableNumber) return;
    if (orderType === "delivery" && !address) return;
    setIsSubmitting(true);
    const orderIdValue = Math.floor(Math.random() * 1000);
    
    const aderezosList = [
      aderezos.ensalada && 'Ensalada', 
      aderezos.mayonesa && 'Mayonesa', 
      aderezos.aji && 'Ají', 
      aderezos.salsa_rosada && 'Rosada'
    ].filter(Boolean).join(', ');

    const orderData = {
      numero_pedido: orderIdValue,
      nombre_cliente: customerName || "Mesa",
      tipo: orderType,
      mesa: orderType === 'mesa' ? parseInt(tableNumber) || null : null,
      direccion_delivery: orderType === 'delivery' ? address : (orderType === 'mesa' ? `Mesa ${tableNumber}` : 'Para Llevar'),
      productos: items,
      estado: 'nuevo',
      aderezos: items.some(i => i.name.includes('Verde') || i.name.includes('Harina')) ? JSON.stringify(aderezos) : null,
      total: total,
      metodo_pago: 'pendiente',
    };

    if (supabase && !!import.meta.env.VITE_SUPABASE_URL) {
      const payload = { ...orderData };
      let { error } = await supabase.from('pedidos').insert([payload]);
      if (error && error.message && error.message.includes('invalid input syntax')) {
         payload.productos = JSON.stringify(payload.productos) as any;
         await supabase.from('pedidos').insert([payload]);
      }
    } else {
      localOrders.push({
        id: Math.random().toString(36).substr(2, 9),
        ...orderData,
        created_at: new Date().toISOString()
      });
      notifyLocalListeners();
    }
    setSuccess(true);
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
           <Check className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-2xl font-black text-[#0D0D0D]">¡Orden enviada a cocina!</h3>
        <Button onClick={onCancel} className="mt-8 h-14 bg-[#fac124] text-black font-bold px-8 rounded-xl">
           Volver al Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
      {/* MENU LIST */}
      <div className="flex-[2] overflow-y-auto pr-4 space-y-8 pb-32">
        {Array.from(new Set(siteConfig.menu.map(i => i.category))).map(cat => (
          <div key={cat} className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight text-[#5a0606] border-b-2 border-[#5a0606] pb-2 inline-block">{cat}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {siteConfig.menu.filter(i => i.category === cat).map(product => (
                <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                  <span className="font-bold text-gray-800">{product.name}</span>
                  {product.prices.empatuca !== undefined && (
                    <div className="flex items-center justify-between border-t border-dashed pt-2">
                      <span className="text-sm font-semibold text-gray-600">Empatuca (${product.prices.empatuca.toFixed(2)})</span>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 border-none" onClick={() => updateQuantity(`${product.id}-empatuca`, `${product.name} (${product.category.replace('Empanadas de ', '')})`, "Empatuca", product.prices.empatuca, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-lg w-6 text-center text-black">{items.find(i => i.id === `${product.id}-empatuca`)?.quantity || 0}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#fac124] text-black border-none" onClick={() => updateQuantity(`${product.id}-empatuca`, `${product.name} (${product.category.replace('Empanadas de ', '')})`, "Empatuca", product.prices.empatuca, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {product.prices.empanita !== undefined && (
                    <div className="flex items-center justify-between border-t border-dashed pt-2">
                      <span className="text-sm font-semibold text-gray-600">Empanita (${product.prices.empanita.toFixed(2)})</span>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 border-none" onClick={() => updateQuantity(`${product.id}-empanita`, `${product.name} (${product.category.replace('Empanadas de ', '')})`, "Empanita", product.prices.empanita, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-lg w-6 text-center text-black">{items.find(i => i.id === `${product.id}-empanita`)?.quantity || 0}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#fac124] text-black border-none" onClick={() => updateQuantity(`${product.id}-empanita`, `${product.name} (${product.category.replace('Empanadas de ', '')})`, "Empanita", product.prices.empanita, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {product.prices.estandar !== undefined && (
                    <div className="flex items-center justify-between border-t border-dashed pt-2">
                      <span className="text-sm font-semibold text-gray-600">Unidad (${product.prices.estandar.toFixed(2)})</span>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 border-none" onClick={() => updateQuantity(`${product.id}-estandar`, `${product.name} (${product.category.replace('Empanadas de ', '')})`, "Unidad", product.prices.estandar, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-lg w-6 text-center text-black">{items.find(i => i.id === `${product.id}-estandar`)?.quantity || 0}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#fac124] text-black border-none" onClick={() => updateQuantity(`${product.id}-estandar`, `${product.name} (${product.category.replace('Empanadas de ', '')})`, "Unidad", product.prices.estandar, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

            {/* MOBILE CART OVERLAY */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* CART */}
      <div className={`fixed md:relative bottom-0 left-0 right-0 z-50 md:z-auto w-full md:w-[350px] bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-xl border-t-2 md:border-2 border-gray-100 flex flex-col shrink-0 transition-transform duration-300 ${isCartOpen ? 'translate-y-0 h-[85vh]' : 'translate-y-[calc(100%-72px)]'} md:translate-y-0 md:h-auto`}>
        <div 
          className="bg-[#5a0606] text-white p-4 h-[72px] font-black uppercase flex items-center justify-between cursor-pointer md:cursor-default shrink-0"
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
           <div className="flex items-center gap-3">
             <ShoppingCart className="h-6 w-6" />
             <div className="flex flex-col leading-tight">
               <span>Orden</span>
               <span className="text-[10px] text-white/70 md:hidden normal-case">{items.length} productos</span>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-xl">${total.toFixed(2)}</span>
             <ChevronUp className={`h-5 w-5 md:hidden transition-transform ${isCartOpen ? 'rotate-180' : ''}`} />
           </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto bg-gray-50 space-y-4">
           {items.length === 0 ? (
             <div className="text-center text-gray-400 py-10 font-bold uppercase tracking-widest text-xs">
               Ningún producto
             </div>
           ) : (
             <ul className="space-y-3">
               {items.map(item => (
                 <li key={item.id} className="flex justify-between items-center text-sm font-semibold bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex-1 flex flex-wrap items-center gap-1">
                      <span className="font-black text-[#5a0606] mr-2">{item.quantity}x</span>
                      <span className="text-gray-800 break-words">{item.name}</span> 
                      <span className="text-xs text-gray-400 whitespace-nowrap">({item.size})</span>
                    </div>
                    <button onClick={() => updateQuantity(item.id, item.name, item.size, item.price, -item.quantity)} className="text-red-300 hover:text-red-500 transition-colors">
                       <X className="h-4 w-4" />
                    </button>
                 </li>
               ))}
             </ul>
           )}

           {items.some(i => i.name.includes('Verde') || i.name.includes('Harina')) && (
             <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
               <Label className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-2 block">Aderezos</Label>
               <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
                  {Object.keys(aderezos).map((key) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={key} 
                        checked={aderezos[key as keyof typeof aderezos]} 
                        onCheckedChange={(c) => setAderezos({ ...aderezos, [key]: c === true })}
                      />
                      <label htmlFor={key} className="capitalize text-gray-700">{key.replace('_', ' ')}</label>
                    </div>
                  ))}
               </div>
             </div>
           )}
           
           <div className="space-y-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
             <div>
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Tipo de Pedido</Label>
                <div className="flex gap-2">
                   <Button variant={orderType === 'mesa' ? 'default' : 'outline'} onClick={() => setOrderType('mesa')} className={`flex-1 h-9 ${orderType === 'mesa' ? 'bg-[#5a0606] text-white hover:bg-[#4a0505]' : 'text-gray-600'}`}>Mesa</Button>
                   <Button variant={orderType === 'llevar' ? 'default' : 'outline'} onClick={() => setOrderType('llevar')} className={`flex-1 h-9 ${orderType === 'llevar' ? 'bg-[#5a0606] text-white hover:bg-[#4a0505]' : 'text-gray-600'}`}>Llevar</Button>
                   <Button variant={orderType === 'delivery' ? 'default' : 'outline'} onClick={() => setOrderType('delivery')} className={`flex-1 h-9 ${orderType === 'delivery' ? 'bg-[#5a0606] text-white hover:bg-[#4a0505]' : 'text-gray-600'}`}>Delivery</Button>
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
           </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <Button 
            onClick={handleSubmit} 
            disabled={items.length === 0 || isSubmitting || (orderType === "mesa" && !tableNumber) || (orderType === "delivery" && !address) || (orderType !== "mesa" && !customerName.trim())}
            className="w-full h-14 bg-[#fac124] hover:bg-[#eab308] text-black font-black text-lg rounded-xl shadow-lg"
          >
            {isSubmitting ? "Enviando..." : "MANDAR A COCINA"}
          </Button>
        </div>
      </div>
    </div>
  );
}
