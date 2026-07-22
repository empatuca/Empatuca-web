import { useState, useEffect } from "react";
import { supabase, localOrders, localListeners } from "../lib/supabase";
import { Button } from "@/components/ui/button";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      setIsAuthenticated(true);
    } else {
      alert("PIN incorrecto");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

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
          setOrders(data);
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
  }, [isAuthenticated]);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-white rounded-3xl border-none shadow-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
               <div className="mx-auto flex h-12 w-12 items-center justify-center mb-4">
                 <img src="/logo_M.svg" alt="M" className="h-full w-auto" />
              </div>
              <h1 className="text-2xl font-bold text-[#0D0D0D]">Acceso Cocina</h1>
              <p className="text-gray-500 text-sm">Ingresa tu PIN de 4 dígitos (Prueba: 1234)</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center text-3xl tracking-[1em] h-16 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a0606]"
                maxLength={4}
                autoFocus
              />
              <Button type="submit" className="w-full h-14 bg-[#5a0606] hover:bg-[#4a0505] text-white font-bold text-lg rounded-xl">
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort orders: new/en_preparacion first, then listos
  const sortedOrders = [...orders].sort((a, b) => {
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
          <a href="/" className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">← Volver al sitio</a>
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
                order.estado === 'listo' 
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
                  {order.tipo === 'delivery' && (
                    <div className="mt-3 pt-2 border-t border-gray-100 text-xs">
                      <span className="font-bold">Dir:</span> {order.direccion_delivery}
                    </div>
                  )}
                </div>

                {order.estado !== 'listo' && (
                  <Button 
                    onClick={() => markAsReady(order.id, order.estado)}
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
      </main>
    </div>
  );
}
