import React, { useState, useEffect } from "react";
import { supabase, localOrders, localListeners } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { requestNotificationPermission, sendNotification } from "../lib/notification";
import { BellRing } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock } from "lucide-react";

interface Order {
  id: string;
  numero_pedido: number;
  nombre_cliente: string;
  tipo: 'mesa' | 'delivery' | 'llevar';
  mesa: number | null;
  direccion_delivery: string | null;
  productos: any[];
  estado: string;
  created_at: string;
}

export default function Cocina() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"activos" | "completados">("activos");
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);


  useEffect(() => {

    if (supabase) {
      setLoading(true);
      // Fetch initial orders
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

      // Setup Realtime subscription
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pedidos',
          },
          (payload) => {
            fetchOrders(); // Reload orders on any change to stay simple and sync
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Fallback local state listener
      setOrders([...localOrders]);
      const listener = (newOrders: Order[]) => {
        setOrders([...newOrders]);
      };
      localListeners.push(listener);
      return () => {
        const index = localListeners.indexOf(listener);
        if (index > -1) localListeners.splice(index, 1);
      };
    }
  }, []);

  const markAsReady = async (id: string, currentStatus: string) => {
    if (currentStatus === 'listo') return;

    // Optimistic update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estado: 'listo' } : o));

    if (supabase) {
      await supabase
        .from('pedidos')
        .update({ estado: 'listo' })
        .eq('id', id);
    } else {
      const order = localOrders.find(o => o.id === id);
      if (order) order.estado = 'listo';
    }
  };



  // Sort orders: new/en_preparacion first, then listos
  const filteredOrders = orders.filter(o => viewMode === "activos" ? (o.estado !== 'listo' && o.estado !== 'entregado') : (o.estado === 'listo' || o.estado === 'entregado'));
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a.estado === 'listo' && b.estado !== 'listo') return 1;
    if (a.estado !== 'listo' && b.estado === 'listo') return -1;
    // Newest first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      <header className="bg-[#0D0D0D] text-white p-4 shadow-xl border-b border-white/5 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="flex h-8 w-8 items-center justify-center">
               <img src="/logo_M.svg" alt="M" className="h-full w-auto" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight">Vista de Cocina</h1>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setViewMode("activos")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'activos' ? 'bg-[#fac124] text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>Activos</button>
             <button onClick={() => setViewMode("completados")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'completados' ? 'bg-[#fac124] text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>Completados</button>
          </div>
          <div className="flex items-center gap-4">
            <a href="#personal" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors font-bold">Roles</a>
            <a href="#personal" className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-bold" onClick={() => {
              localStorage.removeItem('empatuca_staff_auth');
              localStorage.removeItem('empatuca_staff_role');
              sessionStorage.removeItem('empatuca_staff_auth');
            }}>Salir</a>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
        {loading && <p className="text-center text-white/40 py-10 font-bold uppercase tracking-widest">Cargando pedidos...</p>}
        
        {!loading && sortedOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="h-24 w-24 bg-[#0D0D0D] border border-white/5 rounded-full flex items-center justify-center shadow-xl">
              <Clock className="h-10 w-10 text-[#fac124]" />
            </div>
            <p className="text-xl text-white/40 font-black uppercase tracking-widest">No hay pedidos activos</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedOrders.map(order => (
            <Card 
              key={order.id} 
              className={`rounded-2xl border-none shadow-sm transition-all overflow-hidden ${
                order.estado === 'pendiente_caja'
                ? 'bg-gray-200 opacity-50'
                : order.estado === 'listo' 
                ? 'bg-gray-50 opacity-60' 
                : 'bg-[#fac124]' // Amarillo alerta para nuevos pedidos
              }`}
            >
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-2xl font-black ${order.estado === 'listo' ? 'text-gray-600' : 'text-[#0D0D0D]'}`}>
                      #{order.numero_pedido}
                    </h3>
                    <p className={`font-semibold ${order.estado === 'listo' ? 'text-gray-500' : 'text-[#5a0606]'}`}>
                      {order.nombre_cliente}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.estado === 'listo' 
                    ? 'bg-gray-200 text-gray-600' 
                    : 'bg-[#5a0606] text-white'
                  }`}>
                    {order.tipo === 'mesa' ? `Mesa ${order.mesa}` : order.tipo === 'delivery' ? 'Delivery' : 'Llevar'}
                  </div>
                </div>

                <div className={`p-3 rounded-xl ${order.estado === 'listo' ? 'bg-gray-200/50' : 'bg-white'}`}>
                  <ul className="space-y-2">
                    {order.productos.map((item, i) => (
                      <li key={i} className={`flex justify-between items-center text-sm font-bold ${order.estado === 'listo' ? 'text-gray-600' : 'text-[#0D0D0D]'}`}>
                        <span className="flex gap-2 items-center">
                          <span className={`h-5 w-5 rounded flex items-center justify-center text-xs text-white ${order.estado === 'listo' ? 'bg-gray-400' : 'bg-[#5a0606]'}`}>
                            {item.quantity}
                          </span>
                          {item.name} ({item.size})
                        </span>
                      </li>
                    ))}
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
                    <div className="mt-3 pt-2 border-t border-gray-100 text-xs">
                      <span className="font-bold">Dir:</span> {order.direccion_delivery}
                    </div>
                  )}
                </div>

                {order.estado === 'pendiente_caja' ? (
                  <div className="w-full h-14 bg-gray-300 text-gray-500 font-bold text-sm rounded-xl flex items-center justify-center uppercase tracking-widest">
                    Esperando Pago...
                  </div>
                ) : order.estado !== 'listo' && (
                  <Button 
                    onClick={() => setConfirmOrder(order)}
                    className="w-full h-14 bg-[#0D0D0D] hover:bg-gray-800 text-white font-bold text-lg rounded-xl shadow-lg"
                  >
                    <CheckCircle2 className="mr-2 h-6 w-6 text-[#25D366]" />
                    Listo
                  </Button>
                )}
                {order.estado === 'listo' && (
                  <div className="flex justify-center items-center h-10 text-gray-400 font-semibold gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Completado
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

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
                <span className={`px-2 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                  confirmOrder.tipo === 'delivery' ? 'bg-purple-100 text-purple-800' :
                  confirmOrder.tipo === 'mesa' ? 'bg-blue-100 text-blue-800' :
                  'bg-[#5a0606] text-white'
                }`}>
                  {confirmOrder.tipo === 'delivery' ? 'DELIVERY' : confirmOrder.tipo === 'mesa' ? `MESA ${confirmOrder.mesa}` : 'LLEVAR'}
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

      </main>
    </div>
  );
}
