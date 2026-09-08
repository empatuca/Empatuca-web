import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, DollarSign, X, Receipt, Upload, ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestNotificationPermission, sendNotification } from "../lib/notification";
import { BellRing } from "lucide-react";
import { supabase, localOrders, notifyLocalListeners } from "../lib/supabase";
import { Trash2, Package } from "lucide-react";
import { formatOrderNumber } from "../lib/utils";

export default function Caja() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingresos' | 'gastos'>('ingresos');
  
  const [gastos, setGastos] = useState<any[]>([]);
  const [isAddingGasto, setIsAddingGasto] = useState(false);
  const [gastoForm, setGastoForm] = useState({
    descripcion: '',
    monto: '',
    categoria: 'Operativo',
    socio: 'Socio 1',
    fecha: new Date().toISOString().split('T')[0]
  });
  
  // Date filter for UI
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [ingresosDelDia, setIngresosDelDia] = useState(0);
  const [globalBalance, setGlobalBalance] = useState(0);
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [hasNotifPermission, setHasNotifPermission] = useState(false);
  const [prevOrdersCount, setPrevOrdersCount] = useState(0);
  const isInitialLoad = React.useRef(true);

  useEffect(() => {
    if ('Notification' in window) {
      setHasNotifPermission(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    const pendingOrders = orders.filter(o => o.estado === 'pendiente_caja' || (o.metodo_pago === 'pendiente' && o.estado !== 'cancelado' && o.estado !== 'rechazado' && o.estado !== 'archivado')).length;
    if (pendingOrders > prevOrdersCount && !isInitialLoad.current) {
      sendNotification('¡Nuevo Pedido!', { body: 'Tienes un nuevo pedido esperando en caja.' });
    }
    setPrevOrdersCount(pendingOrders);
    if (orders.length > 0) isInitialLoad.current = false;
  }, [orders]);

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setHasNotifPermission(granted);
    if (granted) {
      sendNotification('¡Notificaciones activadas!', { body: 'Recibirás alertas cuando lleguen pedidos nuevos.' });
    } else {
      alert("Debes permitir las notificaciones en tu navegador.");
    }
  };

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
      
      const fetchData = async () => {
        if (!selectedDate) return;
        const startOfDay = new Date(selectedDate);
        if (isNaN(startOfDay.getTime())) return;
        // Correct timezone offset issues for local date
        startOfDay.setMinutes(startOfDay.getMinutes() + startOfDay.getTimezoneOffset());
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);

        // 1. Fetch Gastos for selected date
        const { data: gastosData, error } = await supabase
          .from('gastos_diarios')
          .select('*')
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });
        if (!error && gastosData) {
          setGastos(gastosData);
        }

        // 2. Fetch Ingresos for selected date
        const { data: ingresosData } = await supabase
          .from('pedidos')
          .select('total')
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .not('estado', 'in', '("cancelado","rechazado")'); // Include archivado as valid income
        const sumIngresos = (ingresosData || []).reduce((sum, o) => sum + Number(o.total || 0), 0);
        setIngresosDelDia(sumIngresos);

        // 3. Fetch Global Balance (from Sept 1 + 336.25 base)
        const septStart = '2026-09-01T05:00:00Z'; // 00:00 in UTC-5 (Ecuador)
        const { data: globalPedidos } = await supabase
          .from('pedidos')
          .select('total')
          .gte('created_at', septStart)
          .not('estado', 'in', '("cancelado","rechazado")'); // Include archivado
        const sumGlobalPedidos = (globalPedidos || []).reduce((sum, o) => sum + Number(o.total || 0), 0);

        const { data: globalGastos } = await supabase
          .from('gastos_diarios')
          .select('monto')
          .gte('created_at', septStart);
        const sumGlobalGastos = (globalGastos || []).reduce((sum, o) => sum + Number(o.monto || 0), 0);
        
        setGlobalBalance(336.25 + sumGlobalPedidos - sumGlobalGastos);
      };
      fetchData();

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
  }, [isSupabaseConfigured, selectedDate]);

  
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

  const approveOrder = async (id: string) => {
     const order = orders.find(o => o.id === id);
     if (!order) return;
     
     let newEstado = order.estado;
     let newMetodoPago = order.metodo_pago;

     if (order.estado === 'pendiente_caja') {
         newEstado = 'nuevo';
     }
     if (order.metodo_pago === 'pendiente') {
         newMetodoPago = 'efectivo';
     }
     
     if (isSupabaseConfigured && supabase) {
         const { error } = await supabase.from('pedidos').update({ estado: newEstado, metodo_pago: newMetodoPago }).eq('id', id);
         if (error) {
             alert('Error al confirmar pago: ' + error.message);
         }
     } else {
         const idx = localOrders.findIndex(o => o.id === id);
         if (idx > -1) {
             localOrders[idx].estado = newEstado;
             localOrders[idx].metodo_pago = newMetodoPago;
         }
         notifyLocalListeners();
     }
  };

  const handleAddGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gastoForm.descripcion || !gastoForm.monto) return;
    
    setIsUploading(true);
    let comprobante_url = '';
    
    try {
      if (comprobanteFile && supabase) {
        const fileExt = comprobanteFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `gastos/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(filePath, comprobanteFile);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('comprobantes')
          .getPublicUrl(filePath);
          
        comprobante_url = urlData.publicUrl;
      }
      

      // Build a correct date based on selected date + current time to avoid timezone offset shifts to the wrong day
      const now = new Date();
      const expenseDate = new Date(gastoForm.fecha || new Date().toISOString().split('T')[0]);
      if (!isNaN(expenseDate.getTime())) {
        expenseDate.setMinutes(expenseDate.getMinutes() + expenseDate.getTimezoneOffset());
        expenseDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      }

      const payload = {
        descripcion: gastoForm.descripcion,
        monto: parseFloat(gastoForm.monto),
        categoria: gastoForm.categoria === 'Pago Socios' ? `Pago Socios (${gastoForm.socio})` : gastoForm.categoria,
        comprobante_url,
        created_at: !isNaN(expenseDate.getTime()) ? expenseDate.toISOString() : new Date().toISOString()
      };
      
      if (supabase) {
        const { data, error } = await supabase.from('gastos_diarios').insert([payload]).select();
        if (error) throw error;
        if (data) setGastos([data[0], ...gastos]);
      } else {
         setGastos([{...payload, id: Math.random().toString(), created_at: new Date().toISOString()}, ...gastos]);
      }
      
      setIsAddingGasto(false);
      setGastoForm({ descripcion: '', monto: '', categoria: 'Operativo', socio: 'Socio 1', fecha: new Date().toISOString().split('T')[0] });
      setComprobanteFile(null);
    } catch (err: any) {
      alert("Error al guardar gasto. Es posible que debas crear la tabla 'gastos_diarios' en Supabase. Detalles: " + err.message);
    }
    setIsUploading(false);
  };

  const getCategoryColor = (cat: string) => {
    if (cat.includes('Operativo')) return 'bg-slate-100 text-slate-700 border-slate-300';
    if (cat.includes('Servicios Básicos')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (cat.includes('Producción')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (cat.includes('Socios')) return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300';
    return 'bg-gray-100 text-gray-700';
  };

  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
  const saldoNeto = ingresosDelDia - totalGastos;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-green-800 text-white p-4 shadow-xl border-b border-green-900 sticky top-0 z-50">
        <div className="flex flex-wrap items-center justify-between container mx-auto gap-y-3 gap-x-2">
          <div className="flex items-center gap-2">
             <DollarSign className="w-6 h-6 text-green-300" />
             <h1 className="text-xl font-black uppercase tracking-tight">Caja</h1>
          </div>
          
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
{!hasNotifPermission && (
              <button onClick={enableNotifications} className="text-amber-400 hover:text-amber-300 transition-colors mr-4" title="Activar Notificaciones">
                <BellRing className="w-5 h-5 animate-bounce" />
              </button>
            )}
            <a onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/inventario'); window.dispatchEvent(new Event('popstate')); }} href="/inventario" className="text-sm bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg flex items-center gap-2 mr-4 text-white font-bold">
               <Package className="w-4 h-4" /> Inventario & Ventas
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

      <div className="container mx-auto p-4 md:p-8">
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('ingresos')}
            className={`flex-1 py-4 px-6 rounded-2xl font-black text-lg tracking-wide uppercase transition-all ${activeTab === 'ingresos' ? 'bg-green-600 text-white shadow-xl shadow-green-200' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowUpCircle className="w-6 h-6" /> Ingresos (Pedidos)
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('gastos')}
            className={`flex-1 py-4 px-6 rounded-2xl font-black text-lg tracking-wide uppercase transition-all ${activeTab === 'gastos' ? 'bg-red-500 text-white shadow-xl shadow-red-200' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowDownCircle className="w-6 h-6" /> Egresos (Gastos)
            </div>
          </button>
        </div>

        {activeTab === 'ingresos' && (
          <div>
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold uppercase tracking-widest">Cargando caja...</p>
          </div>
        ) : orders.filter(o => o.estado === 'pendiente_caja' || (o.metodo_pago === 'pendiente' && o.estado !== 'cancelado' && o.estado !== 'rechazado' && o.estado !== 'archivado')).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-400 uppercase">Sin pagos pendientes</h3>
            <p className="text-gray-400 text-sm mt-2">Todos los pedidos han sido verificados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.filter(o => o.estado === 'pendiente_caja' || (o.metodo_pago === 'pendiente' && o.estado !== 'cancelado' && o.estado !== 'rechazado' && o.estado !== 'archivado')).map(order => (
              <div 
                key={order.id} 
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-green-400 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-3xl text-gray-900">#{formatOrderNumber(order.numero_pedido)}</h3>
                    <p className="text-sm font-bold text-gray-600 uppercase mt-1 mb-2">{order.nombre_cliente}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                         order.tipo === 'delivery' ? 'bg-purple-100 text-purple-800' :
                         order.tipo === 'mesa' ? 'bg-blue-100 text-blue-800' :
                         'bg-[#5a0606] text-white'
                      }`}>
                        {order.tipo === 'delivery' ? 'DELIVERY' : order.tipo === 'mesa' ? `MESA ${order.mesa}` : 'LLEVAR'}
                    </span>
                  </div>
                  <div className="text-right flex items-start gap-4">
                      <div>
                     <span className="block font-black text-xl text-green-700">${order.total}</span>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{order.metodo_pago}</span>
                  </div>
                      <button onClick={() => deleteOrder(order.id)} className="mt-1 text-red-300 hover:text-red-500 transition-colors shrink-0" title="Eliminar/Rechazar Pedido">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex-grow">
                  <ul className="space-y-3">
                    {(order.productos?.filter((i: any) => !i.isAdicional) || []).map((item: any, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="font-black bg-gray-200 text-gray-600 w-6 h-6 rounded-md flex items-center justify-center shrink-0">
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
                             <span className="font-black bg-gray-200 text-gray-600 w-6 h-6 rounded-md flex items-center justify-center shrink-0">
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
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Últimos Pedidos Confirmados</h3>
             <Button variant="outline" size="sm" onClick={() => setShowAllOrders(true)} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800">Ver todos</Button>
           </div>
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
                    {orders.filter(o => o.estado !== 'archivado' && o.estado !== 'pendiente_caja' && !(o.metodo_pago === 'pendiente')).slice(0, 10).map(order => (
                       <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-3 font-black text-black">#{formatOrderNumber(order.numero_pedido)}</td>
                          <td className="py-3 font-bold text-gray-800">{order.nombre_cliente}</td>
                          <td className="py-3 font-black text-green-700">${order.total}</td>
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
        )}

        {activeTab === 'gastos' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                 {/* GLOBAL BALANCE CARD */}
                 <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-xl border border-gray-700 text-white">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> Saldo General Acumulado
                    </h3>
                    <p className="text-[10px] text-gray-400 mb-4 leading-tight">Calculado desde Sept 1, incluyendo base de $336.25</p>
                    <div className="flex items-center gap-3">
                       <span className={`font-black text-4xl ${globalBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                         ${globalBalance.toFixed(2)}
                       </span>
                    </div>
                 </div>

                 {/* BALANCE CARD */}
                 <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Balance del día: {selectedDate}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Ingresos (Ventas)</span>
                        <span className="text-green-600 font-black text-xl">+${ingresosDelDia.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Egresos (Gastos)</span>
                        <span className="text-red-500 font-black text-xl">-${totalGastos.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-800 font-black uppercase">Saldo Diario</span>
                        <span className={`font-black text-3xl ${saldoNeto >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                          ${saldoNeto.toFixed(2)}
                        </span>
                      </div>
                    </div>
                 </div>

                 {/* ADD GASTO FORM */}
                 <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-red-500" /> Registrar Gasto
                      </h3>
                    </div>
                    <form onSubmit={handleAddGasto} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Descripción</label>
                        <input required value={gastoForm.descripcion} onChange={e => setGastoForm({...gastoForm, descripcion: e.target.value})} placeholder="Ej. Compra de harina" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Monto ($)</label>
                        <input required type="number" step="0.01" min="0" value={gastoForm.monto} onChange={e => setGastoForm({...gastoForm, monto: e.target.value})} placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-black text-red-600 text-xl" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Fecha del Gasto</label>
                        <input required type="date" value={gastoForm.fecha} onChange={e => setGastoForm({...gastoForm, fecha: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-700" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Categoría</label>
                        <select value={gastoForm.categoria} onChange={e => setGastoForm({...gastoForm, categoria: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                          <option value="Operativo">Gasto Operativo (Normal)</option>
                          <option value="Producción">Producción e Insumos</option>
                          <option value="Servicios Básicos">Servicios Básicos</option>
                          <option value="Pago Socios">Pago a Socios</option>
                        </select>
                      </div>
                      {gastoForm.categoria === 'Pago Socios' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Seleccionar Socio</label>
                          <select value={gastoForm.socio} onChange={e => setGastoForm({...gastoForm, socio: e.target.value})} className="w-full bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-900 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
                            <option value="Socio 1">Socio 1</option>
                            <option value="Socio 2">Socio 2</option>
                            <option value="Socio 3">Socio 3</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Comprobante / Factura (Opcional)</label>
                        <label className="flex items-center justify-center gap-2 w-full bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl px-4 py-4 text-sm font-bold text-gray-500 cursor-pointer transition-colors">
                           <Upload className="w-5 h-5" />
                           {comprobanteFile ? comprobanteFile.name : 'Subir imagen o PDF'}
                           <input type="file" accept="image/*,.pdf" onChange={e => setComprobanteFile(e.target.files?.[0] || null)} className="hidden" />
                        </label>
                      </div>
                      <Button type="submit" disabled={isUploading} className="w-full h-12 mt-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-md flex items-center justify-center">
                        {isUploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Guardar Gasto'}
                      </Button>
                    </form>
                 </div>
              </div>

              <div className="lg:col-span-2">
                 <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 h-full min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Historial de Gastos</h3>
                      <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none" />
                    </div>
                    {gastos.length === 0 ? (
                      <div className="text-center py-20">
                        <Wallet className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-gray-400 uppercase">Sin Gastos</h4>
                        <p className="text-gray-400 text-sm mt-2">Aún no has registrado egresos el día de hoy.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {gastos.map(gasto => (
                          <div key={gasto.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow bg-gray-50">
                            <div className="flex flex-col gap-2">
                               <div className="flex items-center gap-3">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getCategoryColor(gasto.categoria)}`}>
                                   {gasto.categoria}
                                 </span>
                                 <span className="text-xs text-gray-400 font-bold">
                                   {gasto.created_at && !isNaN(new Date(gasto.created_at).getTime()) ? new Date(gasto.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                 </span>
                               </div>
                               <p className="font-bold text-gray-800 text-lg leading-tight">{gasto.descripcion}</p>
                               {gasto.comprobante_url && (
                                 <a href={gasto.comprobante_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 w-fit">
                                   <Receipt className="w-3 h-3" /> Ver comprobante
                                 </a>
                               )}
                            </div>
                            <div className="text-right pl-4">
                               <span className="font-black text-2xl text-red-600 block">-${Number(gasto.monto).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAllOrders && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="font-black text-2xl text-gray-900">Todos los pedidos del día</h3>
                <button onClick={() => setShowAllOrders(false)} className="text-gray-400 hover:bg-gray-100 hover:text-gray-900 p-2 rounded-full transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>
             <div className="p-6 overflow-y-auto">
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
                    {orders.filter(o => o.estado !== 'archivado' && o.estado !== 'pendiente_caja' && !(o.metodo_pago === 'pendiente')).map(order => (
                       <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-3 font-black text-black">#{formatOrderNumber(order.numero_pedido)}</td>
                          <td className="py-3 font-bold text-gray-800">{order.nombre_cliente}</td>
                          <td className="py-3 font-black text-green-700">${order.total}</td>
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
      )}
    </div>
  );
}
