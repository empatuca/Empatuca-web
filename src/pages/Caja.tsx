import React, { useState, useEffect } from "react";
import { supabase, localOrders, notifyLocalListeners } from "../lib/supabase";
import { Clock, CheckCircle2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Caja() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const approveOrder = async (id: string) => {
     const order = orders.find(o => o.id === id);
     if (!order) return;
     const isTablePending = order.tipo === 'mesa' && order.metodo_pago === 'pendiente';
     const newEstado = isTablePending ? order.estado : 'nuevo';
     const newMetodoPago = isTablePending ? 'efectivo' : order.metodo_pago;
     
     if (isSupabaseConfigured && supabase) {
         await supabase.from('pedidos').update({ estado: newEstado, metodo_pago: newMetodoPago }).eq('id', id);
     } else {
         const idx = localOrders.findIndex(o => o.id === id);
         if (idx > -1) {
             localOrders[idx].estado = newEstado;
             localOrders[idx].metodo_pago = newMetodoPago;
         }
         notifyLocalListeners();
     }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white p-4 shadow-xl border-b border-green-900 sticky top-0 z-50">
        <div className="flex items-center justify-between container mx-auto">
          <div className="flex items-center gap-2">
             <DollarSign className="w-6 h-6 text-green-300" />
             <h1 className="text-xl font-black uppercase tracking-tight">Caja</h1>
          </div>
          <a href="#personal" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors" onClick={() => {
            localStorage.removeItem('empatuca_staff_auth');
            localStorage.removeItem('empatuca_staff_role');
            sessionStorage.removeItem('empatuca_staff_auth');
          }}>Salir</a>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold uppercase tracking-widest">Cargando caja...</p>
          </div>
        ) : orders.filter(o => o.estado === 'pendiente_caja').length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-400 uppercase">Sin pagos pendientes</h3>
            <p className="text-gray-400 text-sm mt-2">Todos los pedidos han sido verificados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.filter(o => o.estado === 'pendiente_caja').map(order => (
              <div 
                key={order.id} 
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-green-400 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-3xl">#{order.numero_pedido}</h3>
                    <p className="text-sm font-bold text-gray-600 uppercase mt-1 mb-2">{order.nombre_cliente}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                         order.tipo === 'delivery' ? 'bg-purple-100 text-purple-800' :
                         order.tipo === 'mesa' ? 'bg-blue-100 text-blue-800' :
                         'bg-[#5a0606] text-white'
                      }`}>
                        {order.tipo === 'delivery' ? 'DELIVERY' : order.tipo === 'mesa' ? `MESA ${order.mesa}` : 'LLEVAR'}
                    </span>
                  </div>
                  <div className="text-right">
                     <span className="block font-black text-xl text-green-700">${order.total}</span>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{order.metodo_pago}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex-grow">
                  <ul className="space-y-3">
                    {order.productos?.map((item: any, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="font-black bg-gray-200 text-gray-600 w-6 h-6 rounded-md flex items-center justify-center shrink-0">
                          {item.quantity}
                        </span>
                        <span className="font-medium text-gray-700 leading-tight pt-0.5">
                          {item.name} ({item.size})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  onClick={() => approveOrder(order.id)}
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg"
                >
                  <CheckCircle2 className="mr-2 h-6 w-6" />
                  Confirmar Pago
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Recientes confirmados o completados */}
        <div className="mt-16">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Últimos Pedidos Confirmados</h3>
           <div className="overflow-x-auto">
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
                    {orders.filter(o => o.estado !== 'pendiente_caja' && !(o.tipo === 'mesa' && o.metodo_pago === 'pendiente')).slice(0, 10).map(order => (
                       <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-3 font-bold">#{order.numero_pedido}</td>
                          <td className="py-3 text-gray-600">{order.nombre_cliente}</td>
                          <td className="py-3 font-bold text-green-700">${order.total}</td>
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
    </div>
  );
}
