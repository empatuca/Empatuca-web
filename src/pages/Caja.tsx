import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, DollarSign, X, Receipt, Upload, ArrowDownCircle, ArrowUpCircle, Wallet, Share2, Download, Calendar, TrendingUp, Boxes, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestNotificationPermission, sendNotification } from "../lib/notification";
import { BellRing } from "lucide-react";
import { supabase, localOrders, notifyLocalListeners } from "../lib/supabase";
import { Trash2, Package } from "lucide-react";
import { 
  formatOrderNumber, 
  getEcuadorDateString, 
  formatEcuadorDate, 
  formatEcuadorTime, 
  formatEcuadorDateTime, 
  getEcuadorDayRange 
} from "../lib/utils";
import html2canvas from "html2canvas-pro";
import { siteConfig } from "../../siteConfig";
import CajaDashboard from "../components/caja/CajaDashboard";
import InsumosStockManager from "../components/caja/InsumosStockManager";
import { ProduccionManager } from "../components/ProduccionManager";
import { getLocalInsumos, registerPurchaseInsumo } from "../lib/insumosStorage";
import { InsumoItem, InsumoCategory } from "../types";

export default function Caja() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingresos' | 'gastos' | 'dashboard' | 'insumos' | 'produccion'>('ingresos');
  const [selectedMethods, setSelectedMethods] = useState<Record<string, string>>({});
  const [receiptModalOrder, setReceiptModalOrder] = useState<any | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [whatsappPhones, setWhatsappPhones] = useState<Record<string, string>>({});
  const [cashModalOrder, setCashModalOrder] = useState<any | null>(null);
  const [cashReceived, setCashReceived] = useState('');
  
  const [gastos, setGastos] = useState<any[]>([]);
  const [allGastos, setAllGastos] = useState<any[]>([]);
  const [allOrdersList, setAllOrdersList] = useState<any[]>([]);
  const [isAddingGasto, setIsAddingGasto] = useState(false);
  const [gastoForm, setGastoForm] = useState({
    descripcion: '',
    monto: '',
    categoria: 'Operativo',
    socio: 'Socio 1',
    fecha: getEcuadorDateString(),
    vincularInsumo: false,
    insumoId: '',
    nuevoInsumoNombre: '',
    cantidad: '',
    unidad: 'libras',
    destino: 'stock_direct0' as 'stock_directo' | 'produccion_inmediata'
  });
  const [disponiblesInsumos, setDisponiblesInsumos] = useState<InsumoItem[]>([]);

  useEffect(() => {
    setDisponiblesInsumos(getLocalInsumos());
  }, []);
  
  // Date filter for UI (strictly in Ecuador timezone America/Guayaquil)
  const [selectedDate, setSelectedDate] = useState(getEcuadorDateString());
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
        const { startOfDayUTC, endOfDayUTC } = getEcuadorDayRange(selectedDate);

        // 1. Fetch Gastos for selected date in Ecuador
        const { data: gastosData, error } = await supabase
          .from('gastos_diarios')
          .select('*')
          .gte('created_at', startOfDayUTC)
          .lte('created_at', endOfDayUTC)
          .order('created_at', { ascending: false });
        if (!error && gastosData) {
          setGastos(gastosData);
        }

        // 1.b Fetch All Gastos for Dashboard historical analysis
        const { data: allGData } = await supabase
          .from('gastos_diarios')
          .select('*')
          .order('created_at', { ascending: false });
        if (allGData) {
          setAllGastos(allGData);
        }

        // 2. Fetch Ingresos for selected date in Ecuador
        const { data: ingresosData } = await supabase
          .from('pedidos')
          .select('total')
          .gte('created_at', startOfDayUTC)
          .lte('created_at', endOfDayUTC)
          .not('estado', 'in', '("cancelado","rechazado")'); // Include archivado as valid income
        const sumIngresos = (ingresosData || []).reduce((sum, o) => sum + Math.round(Number(o.total || 0) * 100), 0) / 100;
        setIngresosDelDia(sumIngresos);

        // 2.b Fetch All Orders for Dashboard
        const { data: allOData } = await supabase
          .from('pedidos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);
        if (allOData) {
          setAllOrdersList(allOData);
        }

        // 3. Fetch Global Balance (from Sept 1 + 346.75 base)
        const septStart = '2026-09-01T05:00:00Z'; // 00:00 in UTC-5 (Ecuador)
        const { data: globalPedidos } = await supabase
          .from('pedidos')
          .select('total')
          .gte('created_at', septStart)
          .not('estado', 'in', '("cancelado","rechazado")'); // Include archivado
        const sumGlobalPedidos = (globalPedidos || []).reduce((sum, o) => sum + Math.round(Number(o.total || 0) * 100), 0) / 100;

        const { data: globalGastos } = await supabase
          .from('gastos_diarios')
          .select('monto')
          .gte('created_at', septStart);
        const sumGlobalGastos = (globalGastos || []).reduce((sum, o) => sum + Math.round(Number(o.monto || 0) * 100), 0) / 100;
        
        setGlobalBalance((34675 + Math.round(sumGlobalPedidos * 100) - Math.round(sumGlobalGastos * 100)) / 100);
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
      setAllOrdersList([...localOrders]);
      setLoading(false);
      
      // Load all gastos from localStorage or seed initial realistic gastos
      const stored = localStorage.getItem('empatuca_all_gastos');
      let currentLocalGastos: any[] = [];
      if (stored) {
        try { currentLocalGastos = JSON.parse(stored); } catch (e) {}
      } else {
        currentLocalGastos = [
          {
            id: 'gasto-demo-1',
            descripcion: 'Compra de aceite, fundas y tarrinas para empanadas',
            monto: 35.50,
            categoria: 'Insumos / Producción',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'gasto-demo-2',
            descripcion: 'Pago de gas y suministros de limpieza',
            monto: 22.00,
            categoria: 'Operativo',
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'gasto-demo-3',
            descripcion: 'Retiro utilidades semana',
            monto: 60.00,
            categoria: 'Pago Socios (Socio 1)',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'gasto-demo-4',
            descripcion: 'Retiro utilidades semana',
            monto: 60.00,
            categoria: 'Pago Socios (Socio 2)',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'gasto-demo-5',
            descripcion: 'Retiro utilidades semana',
            monto: 60.00,
            categoria: 'Pago Socios (Socio 3)',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'gasto-demo-6',
            descripcion: 'Compra de queso manaba y verde para masa',
            monto: 45.00,
            categoria: 'Insumos / Producción',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        localStorage.setItem('empatuca_all_gastos', JSON.stringify(currentLocalGastos));
      }
      setAllGastos(currentLocalGastos);

      const updateLocalIncome = () => {
        const { startOfDayUTC, endOfDayUTC } = getEcuadorDayRange(selectedDate);
        const startTs = new Date(startOfDayUTC).getTime();
        const endTs = new Date(endOfDayUTC).getTime();
        const dayLocalOrders = localOrders.filter(o => {
          const t = new Date(o.created_at || Date.now()).getTime();
          return t >= startTs && t <= endTs && o.estado !== 'cancelado' && o.estado !== 'rechazado';
        });
        const sum = dayLocalOrders.reduce((s, o) => s + Math.round(Number(o.total || 0) * 100), 0) / 100;
        setIngresosDelDia(sum);

        const dayGastos = currentLocalGastos.filter(g => {
          const t = new Date(g.created_at || Date.now()).getTime();
          return t >= startTs && t <= endTs;
        });
        setGastos(dayGastos);
      };

      updateLocalIncome();
      const handleLocalUpdate = () => {
        setOrders([...localOrders].reverse());
        setAllOrdersList([...localOrders]);
        updateLocalIncome();
      };
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

     let chosenMethod = selectedMethods[id] || order.metodo_pago;
     if (!chosenMethod || chosenMethod === 'pendiente') {
         chosenMethod = 'efectivo';
     }

     if (chosenMethod === 'efectivo') {
         setCashReceived('');
         setCashModalOrder(order);
         return;
     }

     await executeApproval(id, chosenMethod);
  };

  const executeApproval = async (id: string, chosenMethod: string) => {
     const order = orders.find(o => o.id === id);
     if (!order) return;

     let newEstado = order.estado;
     if (order.estado === 'pendiente_caja') {
         newEstado = 'nuevo';
     }

     if (isSupabaseConfigured && supabase) {
         const { error } = await supabase.from('pedidos').update({ estado: newEstado, metodo_pago: chosenMethod }).eq('id', id);
         if (error) {
             alert('Error al confirmar pago: ' + error.message);
         }
     } else {
         const idx = localOrders.findIndex(o => o.id === id);
         if (idx > -1) {
             localOrders[idx].estado = newEstado;
             localOrders[idx].metodo_pago = chosenMethod;
         }
         notifyLocalListeners();
     }
     setCashModalOrder(null);
     openReceiptModal(order);
  };

  const getSafeProductos = (order: any): any[] => {
    if (!order || !order.productos) return [];
    let prods = order.productos;
    if (typeof prods === 'string') {
      try {
        prods = JSON.parse(prods);
      } catch (e) {
        prods = [];
      }
    }
    return Array.isArray(prods) ? prods : [];
  };

  const openReceiptModal = (order: any) => {
    const safeOrder = {
      ...order,
      productos: getSafeProductos(order)
    };
    setReceiptModalOrder(safeOrder);
    if (!whatsappPhones[order.id]) {
      let initial = order.telefono || '593';
      let clean = initial.replace(/\D/g, '');
      if (clean.startsWith('0')) {
        clean = '593' + clean.substring(1);
      } else if (!clean.startsWith('593')) {
        clean = '593' + clean;
      }
      setWhatsappPhones(prev => ({ ...prev, [order.id]: clean }));
    }
  };

  const formatPhoneForWhatsApp = (input: string) => {
    let cleaned = input.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '593' + cleaned.substring(1);
    } else if (!cleaned.startsWith('593') && cleaned.length === 9) {
      cleaned = '593' + cleaned;
    } else if (!cleaned.startsWith('593')) {
      cleaned = '593' + cleaned;
    }
    return cleaned;
  };

  const handleWhatsAppReceipt = (order: any) => {
    const phoneToUse = whatsappPhones[order.id] || order.telefono || '593';
    const cleanPhone = formatPhoneForWhatsApp(phoneToUse);
    if (!cleanPhone || cleanPhone.length < 10) {
        alert('Por favor ingresa un número de celular de WhatsApp válido con el prefijo 593.');
        return;
    }
    const safeProds = getSafeProductos(order);
    const productsList = safeProds.map((p: any) => `• ${p.quantity || 1}x ${p.name} ${p.size ? `(${p.size})` : ''} - $${((Number(p.price) || 0) * (Number(p.quantity) || 1)).toFixed(2)}`).join('\n');
    const text = `🧾 *RECIBO EMPATUCA* #${formatOrderNumber(order.numero_pedido)}\n` +
      `📅 Fecha: ${formatEcuadorDateTime(order.created_at || Date.now())}\n` +
      `--------------------------------\n` +
      `👤 Cliente: ${order.nombre_cliente || 'Consumidor Final'}\n` +
      `📌 Tipo: ${(order.tipo || '').toUpperCase()}${order.mesa ? ' (Mesa ' + order.mesa + ')' : ''}\n` +
      `💳 Método de Pago: ${(selectedMethods[order.id] || order.metodo_pago || 'efectivo').toUpperCase()}\n` +
      `--------------------------------\n` +
      `*DETALLE DE PEDIDO:*\n` +
      (productsList || '• Sin productos registrados') + `\n` +
      `--------------------------------\n` +
      `*TOTAL: $${Number(order.total || 0).toFixed(2)}*\n\n` +
      `📍 *Dirección:* ${siteConfig.address}\n\n` +
      `¡Gracias por preferir Empatuca! 🫓✨`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadReceiptImage = async (order: any) => {
    setIsGeneratingImage(true);
    await new Promise(resolve => setTimeout(resolve, 200));

    const element = document.getElementById(`receipt-ticket-${order.id}`);
    if (!element) {
        setIsGeneratingImage(false);
        alert('No se encontró el elemento del recibo');
        return;
    }
    try {
      const images = element.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await html2canvas(element, { 
        scale: 2, 
        backgroundColor: '#5a0606',
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollY: 0,
        scrollX: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(`receipt-ticket-${order.id}`);
          if (clonedElement) {
            clonedElement.style.maxHeight = 'none';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.height = 'auto';

            let parent = clonedElement.parentElement;
            while (parent && parent !== clonedDoc.body) {
              parent.style.maxHeight = 'none';
              parent.style.overflow = 'visible';
              parent.style.height = 'auto';
              parent = parent.parentElement;
            }
          }
        }
      });
      
      const image = canvas.toDataURL('image/png');
      let sharedSuccessfully = false;

      if (navigator.share && navigator.canShare) {
        try {
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
          if (blob) {
            const file = new File([blob], `Recibo-Empatuca-${formatOrderNumber(order.numero_pedido)}.png`, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `Recibo #${formatOrderNumber(order.numero_pedido)}`,
                text: `Comprobante de pago Empatuca - Total: $${order.total}`,
                files: [file]
              });
              sharedSuccessfully = true;
            }
          }
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            sharedSuccessfully = true; // User cancelled share dialog
          } else {
            console.log('Share API error, falling back to download:', shareErr);
          }
        }
      }

      if (!sharedSuccessfully) {
        const a = document.createElement('a');
        a.href = image;
        a.download = `Recibo-Empatuca-${formatOrderNumber(order.numero_pedido)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('html2canvas error:', err);
      alert('Error al generar la imagen del recibo. Intenta nuevamente.');
    } finally {
      setIsGeneratingImage(false);
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
      

      // Build a correct date based on selected date + current time in Ecuador to avoid timezone offset shifts
      let expenseIso: string;
      const todayEcuador = getEcuadorDateString();
      if (!gastoForm.fecha || gastoForm.fecha === todayEcuador) {
        expenseIso = new Date().toISOString();
      } else {
        const timeNow = formatEcuadorTime(new Date(), true);
        expenseIso = new Date(`${gastoForm.fecha}T${timeNow}-05:00`).toISOString();
      }

      const payload = {
        descripcion: gastoForm.descripcion,
        monto: parseFloat(gastoForm.monto),
        categoria: gastoForm.categoria === 'Pago Socios' ? `Pago Socios (${gastoForm.socio})` : gastoForm.categoria,
        comprobante_url,
        created_at: expenseIso
      };
      
      if (supabase) {
        const { data, error } = await supabase.from('gastos_diarios').insert([payload]).select();
        if (error) throw error;
        if (data) {
          setGastos([data[0], ...gastos]);
          setAllGastos(prev => [data[0], ...prev]);
        }
      } else {
        const newLocal = {...payload, id: Math.random().toString(), created_at: expenseIso};
        setGastos([newLocal, ...gastos]);
        setAllGastos(prev => {
          const updated = [newLocal, ...prev];
          localStorage.setItem('empatuca_all_gastos', JSON.stringify(updated));
          return updated;
        });
      }

      // If user linked this expense to stock/insumo
      if (gastoForm.vincularInsumo && gastoForm.cantidad) {
        const qty = parseFloat(gastoForm.cantidad) || 0;
        if (qty > 0) {
          let selectedInsumoName = '';
          if (gastoForm.insumoId === 'nuevo') {
            selectedInsumoName = gastoForm.nuevoInsumoNombre.trim() || gastoForm.descripcion;
          } else {
            const found = disponiblesInsumos.find(i => i.id === gastoForm.insumoId);
            if (found) selectedInsumoName = found.name;
          }

          const res = registerPurchaseInsumo({
            insumoId: gastoForm.insumoId !== 'nuevo' ? gastoForm.insumoId : undefined,
            name: selectedInsumoName || gastoForm.descripcion,
            quantity: qty,
            unit: gastoForm.unidad,
            totalCost: parseFloat(gastoForm.monto) || 0,
            destino: gastoForm.destino,
            gastoDescripcion: gastoForm.descripcion
          });

          if (res.success) {
            console.log("Insumo actualizado:", res.message);
          }
        }
      }
      
      setIsAddingGasto(false);
      setGastoForm({ 
        descripcion: '', 
        monto: '', 
        categoria: 'Operativo', 
        socio: 'Socio 1', 
        fecha: getEcuadorDateString(),
        vincularInsumo: false,
        insumoId: '',
        nuevoInsumoNombre: '',
        cantidad: '',
        unidad: 'libras',
        destino: 'stock_directo'
      });
      setComprobanteFile(null);
    } catch (err: any) {
      alert("Error al guardar gasto. Es posible que debas crear la tabla 'gastos_diarios' en Supabase. Detalles: " + err.message);
    }
    setIsUploading(false);
  };

  const handleDeleteGasto = async (id: string) => {
    if (!confirm('¿Deseas eliminar este registro de egreso?')) return;
    try {
      if (supabase) {
        await supabase.from('gastos_diarios').delete().eq('id', id);
      }
      setGastos(prev => prev.filter(g => g.id !== id));
      setAllGastos(prev => {
        const updated = prev.filter(g => g.id !== id);
        localStorage.setItem('empatuca_all_gastos', JSON.stringify(updated));
        return updated;
      });
    } catch (e: any) {
      console.error(e);
    }
  };

  const getCategoryColor = (cat: string) => {
    if (cat.includes('Operativo')) return 'bg-slate-100 text-slate-700 border-slate-300';
    if (cat.includes('Servicios Básicos')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (cat.includes('Producción')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (cat.includes('Socios')) return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300';
    return 'bg-gray-100 text-gray-700';
  };

  const totalGastos = gastos.reduce((sum, g) => sum + Math.round(Number(g.monto) * 100), 0) / 100;
  const saldoNeto = (Math.round(ingresosDelDia * 100) - Math.round(totalGastos * 100)) / 100;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-[#0D0D0D] text-white p-4 shadow-xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex flex-wrap items-center justify-between container mx-auto gap-y-3 gap-x-2">
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center">
               <img src="/logo_M.svg" alt="M" className="h-full w-auto" />
            </div>
             <h1 className="text-base sm:text-xl font-black uppercase tracking-tight">Caja</h1>
          </div>
          
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
{!hasNotifPermission && (
              <button onClick={enableNotifications} className="text-amber-400 hover:text-amber-300 transition-colors" title="Activar Notificaciones">
                <BellRing className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
              </button>
            )}
            <a onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/inventario'); window.dispatchEvent(new Event('popstate')); }} href="/inventario" className="text-[10px] sm:text-sm bg-white/10 hover:bg-white/20 transition-colors px-2 sm:px-3 py-1.5 rounded-lg flex items-center gap-1 sm:gap-2 text-white font-bold">
               <Package className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Inventario & Ventas</span><span className="sm:hidden">Inventario</span>
            </a>
            
            <a onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/personal'); window.dispatchEvent(new Event('popstate')); }} href="/personal" className="text-[10px] sm:text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors font-black py-1.5 sm:py-2 px-2 sm:px-4 rounded-xl border border-white/10 hover:bg-white/10">Roles</a>
            <a href="/personal" className="text-[10px] sm:text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-black py-1.5 sm:py-2 px-2 sm:px-4 rounded-xl border border-red-500/20 hover:bg-red-500/10" onClick={(e) => { e.preventDefault(); window.history.pushState(null, "", "/personal"); window.dispatchEvent(new Event("popstate")); 
              localStorage.removeItem('empatuca_staff_auth');
              localStorage.removeItem('empatuca_staff_role');
              sessionStorage.removeItem('empatuca_staff_auth');
            }}>Salir</a>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
          <button 
            onClick={() => setActiveTab('ingresos')}
            title="Ingresos (Pedidos)"
            className={`py-3 sm:py-4 px-1 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base tracking-wide uppercase transition-all flex items-center justify-center ${activeTab === 'ingresos' ? 'bg-[#5a0606] text-white shadow-xl shadow-[#5a0606]/20 ring-2 ring-[#fac124]/50 sm:ring-0' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowUpCircle className="w-5 h-5 shrink-0" /> 
              <span className="hidden sm:inline truncate">Ingresos</span>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('gastos')}
            title="Egresos (Gastos)"
            className={`py-3 sm:py-4 px-1 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base tracking-wide uppercase transition-all flex items-center justify-center ${activeTab === 'gastos' ? 'bg-red-500 text-white shadow-xl shadow-red-200 ring-2 ring-red-400 sm:ring-0' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowDownCircle className="w-5 h-5 shrink-0" /> 
              <span className="hidden sm:inline truncate">Egresos</span>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard"
            className={`py-3 sm:py-4 px-1 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base tracking-wide uppercase transition-all flex items-center justify-center ${activeTab === 'dashboard' ? 'bg-amber-500 text-gray-950 shadow-xl shadow-amber-200 ring-2 ring-amber-300 sm:ring-0' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 shrink-0" /> 
              <span className="hidden sm:inline truncate">Dashboard</span>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('insumos')}
            title="Stock Insumos"
            className={`py-3 sm:py-4 px-1 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base tracking-wide uppercase transition-all flex items-center justify-center ${activeTab === 'insumos' ? 'bg-slate-900 text-white shadow-xl shadow-slate-300 ring-2 ring-slate-600 sm:ring-0' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Boxes className="w-5 h-5 shrink-0" /> 
              <span className="hidden sm:inline truncate">Insumos</span>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('produccion')}
            title="Recetas & Producción"
            className={`py-3 sm:py-4 px-1 sm:px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base tracking-wide uppercase transition-all flex items-center justify-center ${activeTab === 'produccion' ? 'bg-[#fac124] text-gray-950 shadow-xl shadow-amber-200 ring-2 ring-amber-400 sm:ring-0' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <ChefHat className="w-5 h-5 shrink-0" /> 
              <span className="hidden sm:inline truncate">Producción</span>
            </div>
          </button>
        </div>

        {activeTab === 'ingresos' && (
          <div>
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-[#fac124] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold uppercase tracking-widest">Cargando caja...</p>
          </div>
        ) : orders.filter(o => o.estado === 'pendiente_caja' || (o.metodo_pago === 'pendiente' && o.estado !== 'cancelado' && o.estado !== 'rechazado' && o.estado !== 'archivado')).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <CheckCircle2 className="w-16 h-16 text-[#25D366] mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-400 uppercase">Sin pagos pendientes</h3>
            <p className="text-gray-400 text-sm mt-2">Todos los pedidos han sido verificados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.filter(o => o.estado === 'pendiente_caja' || (o.metodo_pago === 'pendiente' && o.estado !== 'cancelado' && o.estado !== 'rechazado' && o.estado !== 'archivado')).map(order => (
              <div 
                key={order.id} 
                className="bg-white rounded-3xl p-6 shadow-xl border-2 border-[#fac124] flex flex-col"
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
                     <span className="block font-black text-xl text-[#5a0606]">${order.total}</span>
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

                <div className="mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Método de Pago</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethods(prev => ({ ...prev, [order.id]: 'efectivo' }))}
                      className={`py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                        (selectedMethods[order.id] || order.metodo_pago || 'efectivo') === 'efectivo'
                          ? 'bg-[#fac124] text-black shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      💵 Efectivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethods(prev => ({ ...prev, [order.id]: 'transferencia' }))}
                      className={`py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                        (selectedMethods[order.id] || order.metodo_pago) === 'transferencia'
                          ? 'bg-[#fac124] text-black shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      📲 Transferencia
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => approveOrder(order.id)}
                    className="w-full h-13 bg-[#5a0606] hover:bg-[#4a0505] text-white font-bold text-base rounded-xl shadow-lg"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Confirmar Pago
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => openReceiptModal(order)}
                    className="w-full h-11 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase rounded-xl"
                  >
                    <Receipt className="mr-2 h-4 w-4 text-[#5a0606]" />
                    Recibo / WhatsApp
                  </Button>
                </div>
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
                       <th className="py-3 font-bold">Hora</th>
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
                          <td className="py-3 text-xs font-bold text-gray-500">{order.created_at ? formatEcuadorTime(order.created_at) : '--:--'}</td>
                          <td className="py-3 font-black text-[#5a0606]">${order.total}</td>
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
                    <p className="text-[10px] text-gray-400 mb-4 leading-tight">Calculado desde Sept 1, incluyendo base de $346.75</p>
                    <div className="flex items-center gap-3">
                       <span className={`font-black text-4xl ${globalBalance >= 0 ? 'text-[#25D366]' : 'text-red-400'}`}>
                         ${globalBalance.toFixed(2)}
                       </span>
                    </div>
                 </div>

                 {/* BALANCE CARD */}
                 <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                      <div>
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#5a0606]" /> Balance del día
                        </h3>
                        <p className="text-xs font-bold text-gray-500 mt-0.5">
                          {formatEcuadorDate(selectedDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedDate !== getEcuadorDateString() && (
                          <button
                            type="button"
                            onClick={() => setSelectedDate(getEcuadorDateString())}
                            className="text-[10px] bg-[#5a0606] text-white px-2.5 py-1.5 rounded-lg font-black uppercase hover:bg-black transition-colors"
                            title="Volver a la fecha de hoy"
                          >
                            Hoy
                          </button>
                        )}
                        <input 
                          type="date" 
                          value={selectedDate} 
                          onChange={e => setSelectedDate(e.target.value)} 
                          className="bg-gray-50 hover:bg-gray-100 border border-gray-200 focus:border-[#5a0606] rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 outline-none transition-colors cursor-pointer" 
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Ingresos (Ventas)</span>
                        <span className="text-[#5a0606] font-black text-xl">+${ingresosDelDia.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Egresos (Gastos)</span>
                        <span className="text-red-500 font-black text-xl">-${totalGastos.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-800 font-black uppercase">Saldo Diario</span>
                        <span className={`font-black text-3xl ${saldoNeto >= 0 ? 'text-[#5a0606]' : 'text-red-600'}`}>
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

                       {/* Vincular con Insumos / Inventario */}
                       <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <Boxes className="w-4 h-4 text-amber-700" />
                             <span className="text-xs font-black text-amber-900 uppercase tracking-tight">¿Vincular con Insumos / Stock?</span>
                           </div>
                           <input 
                             type="checkbox" 
                             checked={gastoForm.vincularInsumo} 
                             onChange={e => setGastoForm({...gastoForm, vincularInsumo: e.target.checked})} 
                             className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer" 
                           />
                         </div>

                         {gastoForm.vincularInsumo && (
                           <div className="space-y-3 pt-2 border-t border-amber-200/80 animate-in fade-in duration-200">
                             <div>
                               <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1 block">Insumo a actualizar</label>
                               <select 
                                 value={gastoForm.insumoId} 
                                 onChange={e => setGastoForm({...gastoForm, insumoId: e.target.value})} 
                                 className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 outline-none"
                               >
                                 <option value="">-- Seleccionar Insumo Existente --</option>
                                 {disponiblesInsumos.map(ins => (
                                   <option key={ins.id} value={ins.id}>{ins.name} ({ins.currentStock} {ins.unit} disp.)</option>
                                 ))}
                                 <option value="nuevo">✨ + Crear nuevo insumo con este nombre</option>
                               </select>
                             </div>

                             {gastoForm.insumoId === 'nuevo' && (
                               <div>
                                 <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1 block">Nombre del Nuevo Insumo</label>
                                 <input 
                                   value={gastoForm.nuevoInsumoNombre} 
                                   onChange={e => setGastoForm({...gastoForm, nuevoInsumoNombre: e.target.value})} 
                                   placeholder="Ej. Queso Manaba o Aceite 5L" 
                                   className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium" 
                                 />
                               </div>
                             )}

                             <div className="grid grid-cols-2 gap-2">
                               <div>
                                 <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1 block">Cantidad</label>
                                 <input 
                                   type="number" 
                                   step="0.1" 
                                   min="0.1" 
                                   value={gastoForm.cantidad} 
                                   onChange={e => setGastoForm({...gastoForm, cantidad: e.target.value})} 
                                   placeholder="Ej. 25" 
                                   className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-black text-gray-900" 
                                 />
                               </div>
                               <div>
                                 <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1 block">Unidad de Medida</label>
                                 <select 
                                   value={gastoForm.unidad} 
                                   onChange={e => setGastoForm({...gastoForm, unidad: e.target.value})} 
                                   className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800"
                                 >
                                   <option value="libras">libras</option>
                                   <option value="kilos">kilos</option>
                                   <option value="unidades">unidades</option>
                                   <option value="litros">litros</option>
                                   <option value="gramos">gramos</option>
                                   <option value="paquetes">paquetes</option>
                                   <option value="sacos">sacos</option>
                                   <option value="cajas">cajas</option>
                                 </select>
                               </div>
                             </div>

                             <div>
                               <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1 block">Destino del insumo</label>
                               <select 
                                 value={gastoForm.destino} 
                                 onChange={e => setGastoForm({...gastoForm, destino: e.target.value as any})} 
                                 className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800"
                               >
                                 <option value="stock_directo">📦 Ingresar a Stock Directo (Bodega)</option>
                                 <option value="produccion_inmediata">🔥 Destinar a Producción Inmediata (Gasto directo sin alterar stock)</option>
                               </select>
                             </div>
                           </div>
                         )}
                       </div>

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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-gray-100">
                      <div>
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Historial de Gastos</h3>
                        <p className="text-xs font-bold text-gray-500 mt-0.5">{formatEcuadorDate(selectedDate)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedDate !== getEcuadorDateString() && (
                          <button
                            type="button"
                            onClick={() => setSelectedDate(getEcuadorDateString())}
                            className="text-[10px] bg-gray-900 text-white px-2.5 py-1.5 rounded-lg font-black uppercase hover:bg-black transition-colors"
                            title="Volver a la fecha de hoy"
                          >
                            Hoy
                          </button>
                        )}
                        <input 
                          type="date" 
                          value={selectedDate} 
                          onChange={e => setSelectedDate(e.target.value)} 
                          className="bg-gray-50 hover:bg-gray-100 border border-gray-200 focus:border-red-500 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none transition-colors cursor-pointer" 
                        />
                      </div>
                    </div>
                    {gastos.length === 0 ? (
                      <div className="text-center py-20">
                        <Wallet className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-gray-400 uppercase">Sin Gastos</h4>
                        <p className="text-gray-400 text-sm mt-2">No se registran egresos para la fecha seleccionada ({formatEcuadorDate(selectedDate)}).</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {gastos.map(gasto => (
                          <div key={gasto.id} className="flex flex-row items-center justify-between p-3 sm:p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow bg-gray-50">
                            <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0 pr-2 sm:pr-4">
                               <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                                 <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px] sm:max-w-none ${getCategoryColor(gasto.categoria)}`}>
                                   {gasto.categoria}
                                 </span>
                                 <span className="text-[9px] sm:text-xs text-gray-400 font-bold whitespace-nowrap shrink-0">
                                   {gasto.created_at ? formatEcuadorTime(gasto.created_at) : ''}
                                 </span>
                               </div>
                               <p className="font-bold text-gray-800 text-sm sm:text-lg leading-tight break-words">{gasto.descripcion}</p>
                               {gasto.comprobante_url && (
                                 <a href={gasto.comprobante_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 w-fit">
                                   <Receipt className="w-3 h-3" /> Ver comprobante
                                 </a>
                               )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                <span className="font-black text-lg sm:text-2xl text-red-600 block">-${Number(gasto.monto).toFixed(2)}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteGasto(gasto.id)}
                                title="Eliminar egreso"
                                className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

        {activeTab === 'dashboard' && (
          <CajaDashboard 
            orders={allOrdersList.length > 0 ? allOrdersList : orders} 
            allGastos={allGastos} 
            selectedDate={selectedDate} 
          />
        )}

        {activeTab === 'insumos' && (
          <InsumosStockManager onNavigateToProduccion={() => setActiveTab('produccion')} />
        )}

        {activeTab === 'produccion' && (
          <ProduccionManager />
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
                       <th className="py-3 font-bold">Hora</th>
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
                          <td className="py-3 text-xs font-bold text-gray-500">{order.created_at ? formatEcuadorTime(order.created_at) : '--:--'}</td>
                          <td className="py-3 font-black text-[#5a0606]">${order.total}</td>
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

      {receiptModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-stone-800">
            <div className="flex justify-between items-center p-5 border-b border-stone-800 bg-[#0D0D0D] text-white">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#fac124]" />
                <h3 className="font-black text-lg uppercase tracking-tight">Recibo de Pedido</h3>
              </div>
              <button onClick={() => setReceiptModalOrder(null)} className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto bg-stone-950 flex flex-col items-center">
              {/* Receipt Ticket Card for HTML2Canvas */}
              <div 
                id={`receipt-ticket-${receiptModalOrder.id}`} 
                className="relative w-full bg-[#5a0606] text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-[#fac124]/40 font-sans select-none overflow-visible"
                style={{ width: '100%', maxWidth: '390px', height: 'auto', minHeight: 'fit-content' }}
              >
                {/* Background Brand Pattern (Golden on Empatuca Red) */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-15 z-0 rounded-3xl"
                  style={{
                    backgroundImage: "url('/patron_m.svg')",
                    backgroundRepeat: 'repeat',
                    backgroundSize: '120px',
                    backgroundPosition: 'center'
                  }}
                />

                {/* Ticket Content */}
                <div className="relative z-10 space-y-4">
                  {/* Header with real Logo - High contrast on Empatuca Red */}
                  <div className="text-center pb-4 border-b-2 border-dashed border-[#fac124]/40">
                    <div className="flex justify-center mb-1.5">
                      <img 
                        src="/logo.svg" 
                        alt="Empatuca" 
                        className="h-14 sm:h-16 w-auto max-w-[210px] object-contain drop-shadow-md"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-1 rounded-full bg-black border border-[#fac124]/60 text-[#fac124] text-[11px] font-black tracking-wider uppercase shadow-md">
                      <span>Santo Domingo • Ecuador</span>
                    </div>
                  </div>

                  {/* Order & Customer Metadata - Fondo sólido negro de alto contraste */}
                  <div className="bg-black rounded-2xl p-4 border-2 border-[#fac124]/60 space-y-2.5 text-xs text-white shadow-lg">
                    <div className="flex justify-between items-center pb-2.5 border-b border-[#fac124]/40">
                      <div>
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Pedido</span>
                        <span className="text-xl font-black text-[#fac124] tracking-tight">
                          #{formatOrderNumber(receiptModalOrder.numero_pedido)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-[#fac124] text-[#5a0606] text-[11px] font-black uppercase rounded-lg shadow-md">
                          {receiptModalOrder.tipo}{receiptModalOrder.mesa ? ` • MESA ${receiptModalOrder.mesa}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                      <div>
                        <span className="text-[10px] font-bold text-amber-300 uppercase block">Cliente</span>
                        <span className="font-bold text-white truncate block">
                          {receiptModalOrder.nombre_cliente || 'Consumidor Final'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-300 uppercase block">Fecha / Hora</span>
                        <span className="text-amber-100 font-medium block">
                          {formatEcuadorDateTime(receiptModalOrder.created_at || Date.now())}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-300 uppercase block">Forma de Pago</span>
                        <span className="font-black uppercase text-[#fac124] block">
                          {(selectedMethods[receiptModalOrder.id] || receiptModalOrder.metodo_pago || 'efectivo')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-300 uppercase block">Estado</span>
                        <span className="inline-flex items-center text-emerald-400 font-black">
                          ✓ Pagado
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Products Detail - Fondo sólido negro */}
                  <div className="bg-black rounded-2xl p-4 border-2 border-[#fac124]/60 space-y-2 shadow-lg">
                    <div className="flex justify-between items-center text-[11px] font-black tracking-wider text-[#fac124] uppercase pb-2 border-b border-[#fac124]/40">
                      <span>Cant. & Producto</span>
                      <span>Subtotal</span>
                    </div>

                    <div className="space-y-2 divide-y divide-white/15">
                      {getSafeProductos(receiptModalOrder).length === 0 ? (
                        <p className="text-xs text-amber-200/80 italic py-2 text-center">
                          Consumo de alimentos y bebidas
                        </p>
                      ) : (
                        getSafeProductos(receiptModalOrder).map((item: any, idx: number) => {
                          const itemQty = Number(item.quantity) || 1;
                          const itemPrice = Number(item.price) || 0;
                          const itemTotal = (itemPrice * itemQty).toFixed(2);
                          return (
                            <div key={idx} className="flex justify-between items-start pt-2 text-xs">
                              <div className="flex items-start gap-2 pr-2">
                                <span className="px-2 py-0.5 rounded-md bg-[#fac124] text-[#5a0606] font-black text-[11px] shrink-0 shadow-sm">
                                  {itemQty}x
                                </span>
                                {/* Vincular con Insumos / Inventario */}
                                <div>
                                  <p className="font-bold text-white leading-tight">
                                    {item.name}
                                  </p>
                                  {item.size && (
                                    <p className="text-[10px] text-amber-200/80 font-medium">
                                      {item.size}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="font-mono font-bold text-[#fac124] text-xs shrink-0">
                                ${itemTotal}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Total Section */}
                  <div className="pt-3 border-t-2 border-dashed border-[#fac124]/40 space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-amber-100/90">
                      <span>Artículos totales:</span>
                      <span className="font-bold text-white">
                        {getSafeProductos(receiptModalOrder).reduce((acc: number, cur: any) => acc + (Number(cur.quantity) || 1), 0)} unidades
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-base font-black text-white">
                      <span className="text-amber-200 text-sm tracking-wide uppercase font-bold">TOTAL A PAGAR:</span>
                      <span className="text-3xl text-[#fac124] font-mono font-black drop-shadow-sm">
                        ${Number(receiptModalOrder.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Parte Final - Dirección y Contacto */}
                  <div className="pt-4 border-t-2 border-dashed border-[#fac124]/40 text-center space-y-3">
                    <p className="text-xs font-bold text-amber-100">
                      ¡Gracias por tu compra! Conserva este recibo.
                    </p>

                    {/* Slogan ubicado justo por debajo de gracias por tu compra */}
                    <div className="flex justify-center py-1">
                      <img 
                        src="/slogan.png" 
                        alt="Tucas Tucas como te gustan" 
                        className="h-5 sm:h-6 w-auto object-contain brightness-125 drop-shadow-md"
                        crossOrigin="anonymous"
                      />
                    </div>

                    {/* Dirección Real de Empatuca - Fondo sólido negro */}
                    <div className="bg-black rounded-xl p-3.5 border-2 border-[#fac124]/60 text-[11px] text-amber-100 space-y-1 shadow-lg">
                      <p className="font-bold text-white leading-tight flex items-center justify-center gap-1.5">
                        <span>📍</span>
                        <span>{siteConfig.address}</span>
                      </p>
                      <p className="text-[10px] text-[#fac124] font-semibold">
                        Horario: {siteConfig.hours}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-amber-200/90 pt-0.5">
                      <span>WhatsApp: 099 817 9051</span>
                      <span>•</span>
                      <span>Instagram: @{siteConfig.instagram}</span>
                    </div>

                    {/* Barcode en marco blanco para contraste perfecto */}
                    <div className="pt-1 flex flex-col items-center">
                      <div className="bg-white px-5 py-2 rounded-xl flex flex-col items-center shadow-lg">
                        <div className="flex items-center gap-[2px] h-6">
                          <div className="w-1 h-full bg-black"></div>
                          <div className="w-0.5 h-full bg-black"></div>
                          <div className="w-1.5 h-full bg-black"></div>
                          <div className="w-0.5 h-full bg-black"></div>
                          <div className="w-2 h-full bg-black"></div>
                          <div className="w-0.5 h-full bg-black"></div>
                          <div className="w-1 h-full bg-black"></div>
                          <div className="w-1.5 h-full bg-black"></div>
                          <div className="w-0.5 h-full bg-black"></div>
                          <div className="w-2 h-full bg-black"></div>
                          <div className="w-1 h-full bg-black"></div>
                          <div className="w-0.5 h-full bg-black"></div>
                          <div className="w-1.5 h-full bg-black"></div>
                          <div className="w-2 h-full bg-black"></div>
                          <div className="w-0.5 h-full bg-black"></div>
                          <div className="w-1 h-full bg-black"></div>
                          <div className="w-0.5 h-full bg-black"></div>
                          <div className="w-1.5 h-full bg-black"></div>
                          <div className="w-2 h-full bg-black"></div>
                          <div className="w-0.5 h-full bg-black"></div>
                          <div className="w-1 h-full bg-black"></div>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-black tracking-widest mt-1">
                          EMPATUCA-{formatOrderNumber(receiptModalOrder.numero_pedido)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full max-w-sm space-y-3 mt-6">
                <div>
                  <label className="text-xs font-bold text-stone-400 uppercase block mb-1">Número de Celular WhatsApp (Prefijo 593)</label>
                  <input 
                    type="tel"
                    placeholder="593991234567"
                    value={whatsappPhones[receiptModalOrder.id] !== undefined ? whatsappPhones[receiptModalOrder.id] : '593'}
                    onChange={(e) => setWhatsappPhones(prev => ({ ...prev, [receiptModalOrder.id]: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border-2 border-stone-700 font-bold text-sm focus:border-[#fac124] outline-none bg-stone-900 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleWhatsAppReceipt(receiptModalOrder)}
                    className="bg-[#25D366] hover:bg-[#20b858] text-white font-bold h-12 rounded-xl text-xs uppercase flex items-center justify-center gap-2 shadow-md"
                  >
                    <Share2 className="w-4 h-4" /> Enviar WhatsApp
                  </Button>
                  <Button 
                    onClick={() => handleDownloadReceiptImage(receiptModalOrder)}
                    disabled={isGeneratingImage}
                    className="bg-[#fac124] hover:bg-[#e0ad1f] text-[#5a0606] font-black h-12 rounded-xl text-xs uppercase flex items-center justify-center gap-2 shadow-md"
                  >
                    <Download className="w-4 h-4" /> {isGeneratingImage ? 'Generando...' : 'Descargar Imagen'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Change Calculator Modal */}
      {cashModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#0D0D0D] text-white">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#fac124]" />
                <h3 className="font-black text-lg uppercase tracking-tight">Cálculo de Vuelto</h3>
              </div>
              <button onClick={() => setCashModalOrder(null)} className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-center">
                <p className="text-xs font-bold text-amber-800 uppercase">Total a Pagar</p>
                <p className="text-3xl font-black text-[#5a0606] mt-1">${Number(cashModalOrder.total || 0).toFixed(2)}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Efectivo Recibido ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  autoFocus
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full h-14 px-4 rounded-xl border-2 border-gray-300 font-black text-2xl text-center focus:border-[#fac124] outline-none"
                />
              </div>

              {Number(cashReceived) >= Number(cashModalOrder.total || 0) && (
                <div className="bg-green-50 rounded-2xl p-4 border border-green-200 text-center animate-in fade-in">
                  <p className="text-xs font-bold text-green-800 uppercase">Cambio / Vuelto a Entregar</p>
                  <p className="text-3xl font-black text-green-700 mt-1">
                    ${(Number(cashReceived) - Number(cashModalOrder.total || 0)).toFixed(2)}
                  </p>
                </div>
              )}

              <Button 
                onClick={() => executeApproval(cashModalOrder.id, 'efectivo')}
                disabled={Number(cashReceived) < Number(cashModalOrder.total || 0)}
                className="w-full h-14 bg-[#5a0606] hover:bg-[#4a0505] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-base rounded-xl shadow-lg mt-2"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> Confirmar Cobro en Efectivo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
