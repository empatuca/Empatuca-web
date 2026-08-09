import React, { useState, useEffect } from "react";
import { siteConfig } from "../../siteConfig";
import { localInventory, updateLocalInventory, InventoryItem, inventoryListeners } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, DollarSign, ArrowLeft } from "lucide-react";
import { localOrders, supabase } from "../lib/supabase";

export default function Inventario() {
  const [inventory, setInventory] = useState<InventoryItem[]>(localInventory);

  const [closures, setClosures] = useState<any[]>([]);
  const [isSavingClosure, setIsSavingClosure] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  
  // Initialize inventory based on menu if empty
  useEffect(() => {
    if (inventory.length === 0) {
      const init: InventoryItem[] = [];
      siteConfig.menu.forEach(item => {
        if (item.prices.empatuca !== undefined) {
          init.push({ id: `${item.id}-empatuca`, name: `${item.name} (Empatuca)`, initialStock: 0, currentStock: 0 });
        }
        if (item.prices.empanita !== undefined) {
          init.push({ id: `${item.id}-empanita`, name: `${item.name} (Empanita)`, initialStock: 0, currentStock: 0 });
        }
        if (item.prices.estandar !== undefined) {
          init.push({ id: `${item.id}-estandar`, name: item.name, initialStock: 0, currentStock: 0 });
        }
      });
      updateLocalInventory(init);
    }

    const listener = (newInv: InventoryItem[]) => setInventory([...newInv]);
    inventoryListeners.push(listener);
    return () => {
      const idx = inventoryListeners.indexOf(listener);
      if (idx > -1) inventoryListeners.splice(idx, 1);
    }
  }, []);

  const handleUpdateInitial = (id: string, value: number) => {
    const soldMap: Record<string, number> = {};
    todayOrders.forEach(order => {
      if (order.estado === 'rechazado' || order.estado === 'cancelado') return;
      const prods = typeof order.productos === 'string' ? JSON.parse(order.productos) : order.productos;
      if (Array.isArray(prods)) {
        prods.forEach((p: any) => {
          soldMap[p.id] = (soldMap[p.id] || 0) + p.quantity;
        });
      }
    });

    const updated = inventory.map(item => {
      if (item.id === id) {
        return { ...item, initialStock: value, currentStock: Math.max(0, value - (soldMap[id] || 0)) };
      }
      return item;
    });
    updateLocalInventory(updated);
  };

  
  const [orders, setOrders] = useState<any[]>([]);
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const fetchOrders = async () => {
        // Obtenemos solo los pedidos de hoy para el inventario
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .gte('created_at', today.toISOString());
          
        if (!error && data) {
          setOrders(data);
        }
      };
      fetchOrders();

      const fetchClosures = async () => {
        const { data, error } = await supabase
          .from('cierres_diarios')
          .select('*')
          .order('fecha', { ascending: false });
        if (!error && data) {
          setClosures(data);
        }
      };
      fetchClosures();

      const channel = supabase
        .channel('schema-db-changes-inv')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pedidos' },
          () => fetchOrders()
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } else {
      setOrders([...localOrders]);
      const handleLocalUpdate = () => setOrders([...localOrders]);
      window.addEventListener('localOrdersUpdated', handleLocalUpdate);
      return () => window.removeEventListener('localOrdersUpdated', handleLocalUpdate);
    }
  }, [isSupabaseConfigured]);

  // Calculate daily sales from localOrders (or supabase if we want, but localOrders is easier for daily)

  // Let's assume all orders in localOrders are for today.
  const todayOrders = orders.filter(o => o.estado === 'entregado' || o.estado === 'listo' || o.estado === 'pendiente_caja' || o.estado === 'en_preparacion' || o.estado === 'nuevo'); // basically all active/completed orders today
  
  const totalVentas = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const handleSaveClosure = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert('Se necesita conectar a Supabase para guardar el cierre del día.');
      return;
    }
    setIsSavingClosure(true);
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const payload = {
      fecha: today,
      total_ventas: totalVentas,
      inventario: inventory,
      pedidos: todayOrders
    };
    
    try {
      const { data: existing, error: errExist } = await supabase.from('cierres_diarios').select('id').eq('fecha', today).single();
      let error = null;
      if (existing) {
        const { error: errUp } = await supabase.from('cierres_diarios').update(payload).eq('id', existing.id);
        error = errUp;
      } else {
        const { error: errIns } = await supabase.from('cierres_diarios').insert([payload]);
        error = errIns;
      }
      
      if (error) {
        alert('Error al guardar en Supabase. Asegúrate de ejecutar el código SQL para crear la tabla cierres_diarios.\nDetalle: ' + error.message);
      } else {
        alert('Cierre guardado correctamente.');
        const { data } = await supabase.from('cierres_diarios').select('*').order('fecha', { ascending: false });
        if (data) setClosures(data);
      }
      // Reset inventory anyway so you can start fresh locally
      const resetInventory = inventory.map(item => ({ ...item, initialStock: 0, currentStock: 0 }));
      setInventory(resetInventory);
      updateLocalInventory(resetInventory);
    } catch (err) {
      alert('Error inesperado: ' + err.message);
    }
    setIsSavingClosure(false);
  };


  // Recalculate current stock based on orders
  useEffect(() => {
    if (inventory.length === 0) return;
    
    // Create a map to subtract quantities
    const soldMap: Record<string, number> = {};
    todayOrders.forEach(order => {
      if (order.estado === 'rechazado' || order.estado === 'cancelado') return;
      const prods = typeof order.productos === 'string' ? JSON.parse(order.productos) : order.productos;
      if (Array.isArray(prods)) {
        prods.forEach((p: any) => {
          soldMap[p.id] = (soldMap[p.id] || 0) + p.quantity;
        });
      }
    });

    const updated = inventory.map(item => {
      const sold = soldMap[item.id] || 0;
      return {
        ...item,
        currentStock: Math.max(0, item.initialStock - sold)
      };
    });
    
    // Only update if currentStock changed to avoid infinite loop
    const hasChanges = updated.some((u, i) => u.currentStock !== inventory[i]?.currentStock);
    if (hasChanges) {
      updateLocalInventory(updated);
    }
  }, [orders]); 

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900">
      <header className="bg-green-800 text-white p-4 shadow-xl border-b border-green-900 sticky top-0 z-50">
        <div className="flex flex-wrap items-center justify-between container mx-auto gap-y-3 gap-x-2">
          <div className="flex items-center gap-2">
             <Package className="w-6 h-6 text-green-300" />
             <h1 className="text-xl font-black uppercase tracking-tight">Inventario & Ventas</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
<a onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/caja'); window.dispatchEvent(new Event('popstate')); }} href="/caja" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors flex items-center gap-1">
               <ArrowLeft className="w-3 h-3" /> Caja
            </a>
            <a onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/personal'); window.dispatchEvent(new Event('popstate')); }} href="/personal" className="text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors font-black py-2 px-4 rounded-xl border border-white/10 hover:bg-white/10">Roles</a>
            <a href="/personal" className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-black py-2 px-4 rounded-xl border border-red-500/20 hover:bg-red-500/10" onClick={(e) => { e.preventDefault(); window.history.pushState(null, "", "/personal"); window.dispatchEvent(new Event("popstate")); 
              localStorage.removeItem('empatuca_staff_auth');
              localStorage.removeItem('empatuca_staff_role');
              sessionStorage.removeItem('empatuca_staff_auth');
            }}>Salir</a>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8 space-y-8">
        
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-gray-500 font-bold uppercase tracking-widest text-sm">Ventas del Día (Aprox)</h2>
            <p className="text-4xl font-black text-green-700 mt-1">${totalVentas.toFixed(2)}</p>
          </div>
          <div className="flex flex-wrap justify-end items-center gap-4">
            <Button onClick={() => setShowHistory(!showHistory)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold h-12 px-6 rounded-xl">
              {showHistory ? 'Volver a Inventario' : 'Ver Historial'}
            </Button>
            <Button onClick={handleSaveClosure} disabled={isSavingClosure} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-xl">
              {isSavingClosure ? 'Guardando...' : 'Guardar Cierre'}
            </Button>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>


        {!showHistory ? (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100">
           <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Producción del Día</h2>
           
           {Array.from(new Set(siteConfig.menu.map(i => i.category))).map(cat => {
             const catItems = inventory.filter(item => {
               const product = siteConfig.menu.find(p => item.id.startsWith(p.id));
               return product?.category === cat;
             });

             if (catItems.length === 0) return null;

             return (
               <div key={cat} className="mb-8 last:mb-0">
                 <h3 className="text-lg font-bold text-gray-700 uppercase tracking-widest mb-4 border-b pb-2">{cat}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {catItems.map(item => {
                     const percentage = item.initialStock > 0 ? (item.currentStock / item.initialStock) * 100 : 0;
                     const isLow = percentage > 0 && percentage < 20;
                     const isOut = item.initialStock > 0 && item.currentStock <= 0;
                     return (
                       <div key={item.id} className={`p-4 rounded-xl border-2 ${isOut ? 'border-red-200 bg-red-50' : isLow ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}`}>
                         <p className="font-bold text-gray-800 mb-3">{item.name}</p>
                         
                         <div className="flex items-center gap-4 mb-3">
                           <div className="flex-1">
                             <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Producción</label>
                             <Input 
                               type="number" 
                               value={item.initialStock === 0 ? '' : item.initialStock}
                               placeholder="0" 
                               onChange={(e) => handleUpdateInitial(item.id, e.target.value === '' ? 0 : parseInt(e.target.value))}
                               className="h-10 text-lg font-black"
                               min="0"
                             />
                           </div>
                           <div className="flex-1 text-center">
                             <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Disponible</label>
                             <span className={`text-2xl font-black ${isOut ? 'text-red-600' : 'text-[#fac124]'}`}>{item.currentStock}</span>
                           </div>
                         </div>
                         {item.initialStock > 0 && (
                           <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${percentage}%` }}></div>
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               </div>
             );
           })}
        </div>

        ) : (
        closures.length > 0 ? (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8">
             <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Historial de Cierres</h2>
             <div className="space-y-6">
                {closures.map(closure => (
                   <div key={closure.id} className="border-2 border-gray-100 rounded-2xl p-6 bg-gray-50">
                      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                        <h3 className="text-2xl font-black">{closure.fecha}</h3>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-500 uppercase">Total Ventas</p>
                          <p className="text-3xl font-black text-green-700">${Number(closure.total_ventas).toFixed(2)}</p>
                        </div>
                      </div>
                      
                      {closure.pedidos && closure.pedidos.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm mb-3">Pedidos del Día</h4>
                          <div className="max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl p-3">
                            {closure.pedidos.map((pedido: any) => (
                              <div key={pedido.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <div>
                                  <span className="font-black text-gray-800">#{pedido.numero_pedido}</span>
                                  <span className="text-gray-500 text-sm ml-2">{pedido.nombre_cliente}</span>
                                </div>
                                <span className="font-bold text-green-600">${Number(pedido.total || 0).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm mb-3">Resumen de Inventario (Vendidas / Sobraron)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Array.isArray(closure.inventario) && closure.inventario.filter((i: any) => i.initialStock > 0).map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                              <span className="text-gray-700 font-bold truncate pr-2">{item.name}</span>
                              <span className="font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                {(item.initialStock - item.currentStock)} vendidas / {item.currentStock} sobraron
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8 text-center text-gray-500 font-bold">No hay cierres registrados.</div>
        )
      )}
      </div>
    </div>
  );
}
