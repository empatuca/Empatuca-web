import React, { useState, useEffect } from "react";
import { PlusCircle, Clock, CheckCircle2 } from "lucide-react";
import { WaitersPOS } from "../components/home/WaitersPOS";
import { Button } from "@/components/ui/button";
import { supabase, localOrders, notifyLocalListeners } from "../lib/supabase";
import { Trash2, Edit } from "lucide-react";

export default function Mesa() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'pedidos' | 'nuevo'>('pedidos');
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      setLoading(true);
      const fetchOrders = async () => {
        const { data, error } = await supabase
          .from('pedidos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (!error && data) {
          const parsedData = data.map(order => {
            let parsedAderezos = order.aderezos;
            if (typeof parsedAderezos === 'string') {
              try { parsedAderezos = JSON.parse(parsedAderezos); } catch (e) {}
            }
            let parsedProductos = order.productos;
            if (typeof parsedProductos === 'string') {
               try { parsedProductos = JSON.parse(parsedProductos); } catch (e) {}
            }
            return { ...order, aderezos: parsedAderezos, productos: parsedProductos };
          });
          setOrders(parsedData);
        }
        setLoading(false);
      };

      fetchOrders();

      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'pedidos' },
          () => fetchOrders()
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } else {
      setOrders([...localOrders].reverse());
      setLoading(false);
      const handleLocalUpdate = () => setOrders([...localOrders].reverse());
      window.addEventListener('localOrdersUpdated', handleLocalUpdate);
      return () => window.removeEventListener('localOrdersUpdated', handleLocalUpdate);
    }
  }, [isSupabaseConfigured]);

  
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

  const markAsReady = async (id: string, currentStatus: string) => {
     // Mesa doesn't mark as ready, they just see it? 
     // Or if it's 'listo', they mark it as 'entregado'?
     if (currentStatus === 'listo') {
         if (isSupabaseConfigured && supabase) {
             await supabase.from('pedidos').update({ estado: 'entregado' }).eq('id', id);
         } else {
             const idx = localOrders.findIndex(o => o.id === id);
             if (idx > -1) localOrders[idx].estado = 'entregado';
             notifyLocalListeners();
         }
     }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-[#0D0D0D] text-white p-4 shadow-xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex flex-wrap items-center justify-between container mx-auto gap-y-3 gap-x-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
<h1 className="text-xl font-black uppercase tracking-tight leading-tight">Mesa <span className="text-sm text-gray-400 block sm:inline">(Meseros)</span></h1>
             </div>
<div className="flex flex-wrap items-center gap-3 sm:gap-6">
{view === 'nuevo' ? (
                <button onClick={() => { setView('pedidos'); setEditingOrder(null); }} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                   Ver Pedidos
                </button>
             ) : (
                <button onClick={() => { setEditingOrder(null); setView('nuevo'); }} className="bg-[#fac124] hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                   <PlusCircle className="w-4 h-4" /> Nuevo Pedido
                </button>
             )}
<a onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/personal'); window.dispatchEvent(new Event('popstate')); }} href="/personal" className="text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors font-black py-2 px-4 rounded-xl border border-white/10 hover:bg-white/10">Roles</a>
            <a href="/personal" className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-black py-2 px-4 rounded-xl border border-red-500/20 hover:bg-red-500/10" onClick={(e) => { e.preventDefault(); window.history.pushState(null, "", "/personal"); window.dispatchEvent(new Event("popstate")); 
              localStorage.removeItem('empatuca_staff_auth');
              localStorage.removeItem('empatuca_staff_role');
              sessionStorage.removeItem('empatuca_staff_auth');
            }}>Salir</a>
          </div>
        </div>
      </header>

      {view === 'nuevo' ? (
         <WaitersPOS initialOrder={editingOrder} onCancel={() => { setView('pedidos'); setEditingOrder(null); }} />
      ) : (
         <div className="container mx-auto p-4 md:p-8">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin w-12 h-12 border-4 border-[#fac124] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 font-bold uppercase tracking-widest">Cargando pedidos...</p>
              </div>
            ) : orders.filter(o => o.estado !== 'entregado').length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-400 uppercase">No hay pedidos activos</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orders.filter(o => o.estado !== 'entregado').map(order => (
                  <div 
                    key={order.id} 
                    className={`bg-white rounded-3xl p-6 shadow-xl border-2 flex flex-col \${
                      order.estado === 'pendiente_caja' 
                        ? 'border-gray-200 opacity-60' 
                        : order.estado === 'listo' 
                          ? 'border-[#25D366]' 
                          : 'border-[#fac124]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-3xl text-gray-900">#{order.numero_pedido || 'N/A'}</h3>
                          <button onClick={() => { setEditingOrder(order); setView('nuevo'); }} className="text-blue-400 hover:text-blue-600 transition-colors shrink-0" title="Editar Pedido">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => deleteOrder(order.id)} className="text-red-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar/Rechazar Pedido">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-gray-600 uppercase mt-1">{order.nombre_cliente}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                         order.tipo === 'delivery' ? 'bg-purple-100 text-purple-800' :
                         order.tipo === 'mesa' ? 'bg-blue-100 text-blue-800' :
                         'bg-[#5a0606] text-white'
                      }`}>
                        {order.tipo === 'delivery' ? 'DELIVERY' : order.tipo === 'mesa' ? `MESA ${order.mesa}` : 'LLEVAR'}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex-grow">
                      <ul className="space-y-3 mb-4">
                        {(order.productos?.filter((i: any) => !i.isAdicional) || []).map((item: any, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="font-black bg-[#fac124] w-6 h-6 rounded-md flex items-center justify-center shrink-0">
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
                               <li key={`adic-${i}`} className="flex items-start gap-2 text-sm">
                                 <span className="font-black bg-[#fac124] w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                                   {item.quantity}
                                 </span>
                                 <span className="font-medium text-gray-700 leading-tight pt-0.5">
                                   {item.name} ({item.size})
                                 </span>
                               </li>
                             ))}
                           </>
                        )}
                      </ul>

                      {order.aderezos && (
                        <div className="mt-2 text-xs font-medium text-gray-700 bg-black/5 p-2 rounded-lg">
                          <p className="font-bold mb-1">Aderezos:</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(order.aderezos).map(([key, value]) => {
                              if (value) {
                                const name = key === 'salsa_rosada' ? 'Salsa Rosada' : key.charAt(0).toUpperCase() + key.slice(1);
                                return <span key={key} className="bg-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">{name}</span>;
                              }
                              return null;
                            })}
                            {Object.values(order.aderezos).every(v => !v) && <span className="text-gray-400">Sin aderezos</span>}
                          </div>
                        </div>
                      )}
                      
                      {order.tipo === 'delivery' && (
                        <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-600">
                          <span className="font-bold">Dir:</span> {order.direccion_delivery}
                        </div>
                      )}
                    </div>

                    {order.estado === 'pendiente_caja' ? (
                       <div className="w-full h-12 bg-gray-100 text-gray-400 font-bold text-sm rounded-xl flex items-center justify-center uppercase tracking-widest border border-gray-200">
                          Esperando Pago (Caja)
                       </div>
                    ) : order.estado === 'listo' ? (
                      <Button 
                        onClick={() => markAsReady(order.id, order.estado)}
                        className="w-full h-14 bg-[#25D366] hover:bg-[#1fae54] text-white font-bold text-lg rounded-xl shadow-lg animate-pulse"
                      >
                        <CheckCircle2 className="mr-2 h-6 w-6" />
                        Entregar
                      </Button>
                    ) : (
                      <div className="w-full h-12 bg-amber-50 text-amber-700 font-bold text-sm rounded-xl flex items-center justify-center uppercase tracking-widest border border-amber-200">
                         Preparando en Cocina...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
         </div>
      )}
    </div>
  );
}
