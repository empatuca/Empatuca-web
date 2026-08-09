import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, ShoppingBag, Plus, Minus, ArrowRight, CheckCircle2, Utensils, Info, MessageCircle, Check } from "lucide-react";
import { supabase, localOrders, notifyLocalListeners } from "../../lib/supabase";
import { siteConfig } from "../../../siteConfig";

type Step = 1 | 2 | 3 | 4 | 5;
type OrderType = 'delivery' | 'llevar' | 'mesa';

interface OrderItem {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  isVariant?: boolean;
  baseId?: string;
  variantImage?: string;
}

export function OrderModal({ isOpen, onClose, initialProduct, isAdmin = false }: { isOpen: boolean, onClose: () => void, initialProduct: any, isAdmin?: boolean }) {
  const [step, setStep] = useState<Step>(1);
  const [orderType, setOrderType] = useState<OrderType>('llevar');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [address, setAddress] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const drinksRef = useRef<HTMLDivElement>(null);

  const [wantsDrink, setWantsDrink] = useState<boolean | null>(null);
  const [extraCategory, setExtraCategory] = useState<string | null>(null);
  const [activeVariantProduct, setActiveVariantProduct] = useState<any>(null);
  
  useEffect(() => {
    if (wantsDrink === true && drinksRef.current) {
      setTimeout(() => {
        drinksRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
    }
  }, [wantsDrink]);
  
  const [aderezos, setAderezos] = useState({
    ensalada: true,
    mayonesa: true,
    aji: true,
    salsa_rosada: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && initialProduct) {
      setStep(1);
      setWantsDrink(null);
      setExtraCategory(null);
      
      const newItems: OrderItem[] = [];
      
      const getFormattedName = (item: any) => {
        if (item.category?.includes('Verde')) return `${item.name} (Verde)`;
        if (item.category?.includes('Harina')) return `${item.name} (Harina)`;
        return item.name;
      };

      if (initialProduct.prices.empatuca) {
        newItems.push({
          id: `${initialProduct.id}-empatuca`,
          name: getFormattedName(initialProduct),
          size: "Empatuca",
          price: initialProduct.prices.empatuca,
          quantity: 1
        });
      }
      
      if (initialProduct.prices.empanita) {
        newItems.push({
          id: `${initialProduct.id}-empanita`,
          name: getFormattedName(initialProduct),
          size: "Empanita",
          price: initialProduct.prices.empanita,
          quantity: 0
        });
      }

      if (!initialProduct.prices.empatuca && initialProduct.prices.estandar) {
        newItems.push({
          id: `${initialProduct.id}-estandar`,
          name: getFormattedName(initialProduct),
          size: "Estándar",
          price: initialProduct.prices.estandar,
          quantity: 1
        });
      }

      siteConfig.menu.forEach(item => {
        if (item.id !== initialProduct.id) {
          if (item.category.includes('Empanadas')) {
            if (item.prices.empatuca) {
              newItems.push({
                id: `${item.id}-empatuca`,
                name: getFormattedName(item),
                size: "Empatuca",
                price: item.prices.empatuca,
                quantity: 0
              });
            }
            if (item.prices.empanita) {
              newItems.push({
                id: `${item.id}-empanita`,
                name: getFormattedName(item),
                size: "Empanita",
                price: item.prices.empanita,
                quantity: 0
              });
            }
          } else if (item.category === 'Bebidas') {
            if (item.variants) {
              item.variants.forEach(variant => {
                newItems.push({
                  id: `${item.id}-estandar-${variant.id}`,
                  name: `${item.name.replace('🥤', '').trim()} - ${variant.name}`,
                  size: "Estándar",
                  price: item.prices.estandar || 0,
                  quantity: 0,
                  isVariant: true,
                  baseId: item.id,
                  variantImage: variant.image
                });
              });
            } else {
              newItems.push({
                id: `${item.id}-estandar`,
                name: item.name,
                size: "Estándar",
                price: item.prices.estandar || 0,
                quantity: 0
              });
            }
          }
        }
      });

      setItems(newItems);
    }
  }, [isOpen, initialProduct]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const isInitialDrink = initialProduct?.category === 'Bebidas';
  const handleNext = () => {
    if (step === 1) {
      if (total === 0) return;
      setStep(2);
    } else if (step === 2) {
      if (orderType === 'delivery' && !address) return;
      if (orderType === 'mesa' && !tableNumber) return;
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!customerName) return;
    setIsSubmitting(true);
    
    const selectedItems = items.filter(i => i.quantity > 0);
    
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    
    let orderIdValue =  1;
    if (true) {
      if (supabase && !!import.meta.env.VITE_SUPABASE_URL) {
        try {
          const { count } = await supabase
            .from('pedidos')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart.toISOString());
          orderIdValue = (count || 0) + 1;
        } catch(e) {
          orderIdValue = Math.floor(Math.random() * 1000);
        }
      } else {
        const todayOrders = localOrders.filter(o => new Date(o.created_at || new Date()).getTime() >= todayStart.getTime());
        orderIdValue = todayOrders.length + 1;
      }
    }
  
    setOrderId(orderIdValue);
    let orderDisplay = orderIdValue;

    let msg = `Hola, quiero hacer un pedido (#${orderIdValue}):\n\n`;
    selectedItems.forEach(item => {
      msg += `- ${item.quantity}x ${item.name} ${item.isVariant ? '' : `(${item.size})`} (${(item.price * item.quantity).toFixed(2)})\n`;
    });
    msg += `\n`;

    if (initialProduct?.category?.includes('Empanadas')) {
      const aderezosList = [
        aderezos.ensalada && 'Ensalada', 
        aderezos.mayonesa && 'Mayonesa', 
        aderezos.aji && 'Ají', 
        aderezos.salsa_rosada && 'Rosada'
      ].filter(Boolean).join(', ');
      msg += `Aderezos: ${aderezosList || 'Ninguno'}\n`;
    }

    msg += `\n*Detalles del pedido:*\n`;
    msg += `Nombre: ${customerName}\n`;
    msg += `Tipo: ${orderType === 'llevar' ? 'Para Llevar' : orderType === 'delivery' ? 'Delivery' : 'En Mesa'}\n`;
    
    if (orderType === 'mesa') msg += `Mesa: ${tableNumber}\n`;
    if (orderType === 'delivery') msg += `Dirección: ${address}\n`;

    msg += `Pago: ${paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia'}\n`;
    msg += `Total a pagar: ${total.toFixed(2)}\n`;

    if (paymentMethod === 'transferencia') {
      msg += `\nAdjunto mi comprobante de transferencia.`;
    }

    try {
      const orderData: any = {
        numero_pedido: orderIdValue,
        nombre_cliente: customerName,
        tipo: orderType,
        mesa: orderType === 'mesa' ? parseInt(tableNumber) || null : null,
        direccion_delivery: orderType === 'delivery' ? address : (orderType === 'mesa' ? `Mesa ${tableNumber}` : 'Para Llevar'),
        productos: selectedItems,
        estado: isAdmin ? 'nuevo' : 'pendiente_caja',
        aderezos: initialProduct?.category?.includes('Empanadas') ? (typeof aderezos === 'object' ? JSON.stringify(aderezos) : aderezos) : null,
        total: total,
        metodo_pago: paymentMethod,
      };

      if (supabase) {
        // Asegurar que productos sea compatible con JSONB (array normal, si la columna es JSONB funciona directo)
        // En algunos casos Supabase prefiere JSON serializado si la columna es de texto.
        
        const payload = { ...orderData };
        let { error } = await supabase.from('pedidos').insert([payload]);

        if (error) {
          // Si el error es sobre el tipo de dato de productos (texto en lugar de jsonb)
          if (error.message && error.message.includes('invalid input syntax')) {
            payload.productos = JSON.stringify(payload.productos);
            const retry = await supabase.from('pedidos').insert([payload]);
            error = retry.error;
          }
        }

        if (error) {
          let errorMessage = error.message || JSON.stringify(error);
          
          if (error.code === '42501' || errorMessage.includes('permission denied') || errorMessage.includes('RLS')) {
             alert("🔐 Error de Permisos en Supabase (RLS)\n\nLa tabla 'pedidos' tiene Row Level Security activado y no permite insertar datos.\n\nPara solucionarlo:\n1. Ve a tu panel de Supabase\n2. Entra al Table Editor -> pedidos\n3. Haz clic donde dice 'RLS' en la parte superior derecha\n4. Selecciona 'Disable RLS' (o crea una política que permita INSERT a roles 'anon').");
             setIsSubmitting(false);
             return;
          }
          
          console.warn("Error al guardar en Supabase:", error);

          if (errorMessage && errorMessage.includes('schema cache')) {
            errorMessage += "\n\nSolución: Ve a Supabase > SQL Editor y ejecuta:\nNOTIFY pgrst, 'reload schema';";
          }
          
          alert("Error al guardar en Supabase:\n" + errorMessage + "\n\nAsegúrate de que las columnas de tu tabla sean: id, numero_pedido, nombre_cliente, direccion_delivery, productos, total, estado, aderezos, metodo_pago, created_at.");
          setIsSubmitting(false);
          return;
        }
      } else {
        localOrders.push({
          id: Math.random().toString(36).substr(2, 9),
          ...orderData,
          created_at: new Date().toISOString()
        });
        notifyLocalListeners();
      }

      setStep(5);
    } catch (err) {
      console.error("Error al redirigir a WhatsApp:", err);
      alert("Hubo un error al procesar tu pedido. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setOrderId(null);
      setCustomerName("");
      setAddress("");
      setWantsDrink(null);
      setAderezos({
        ensalada: true,
        mayonesa: true,
        aji: true,
            salsa_rosada: true
      });
    }, 300);
  };

  const mainProductItems = items.filter(i => i.id.startsWith(initialProduct?.id));
  const drinkItems = items.filter(i => !i.id.startsWith(initialProduct?.id));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2rem] bg-white border-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col">
        <div className="bg-[#5a0606] p-6 text-white relative shrink-0">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {step === 4 ? "¡Pedido Confirmado!" : "Tu Pedido"}
          </DialogTitle>
          <DialogDescription className="text-white/80 mt-1">
            {step === 1 && "Paso 1: Arma tu pedido"}
            {step === 2 && "Paso 2: ¿Algo para tomar?"}
            {step === 3 && "Paso 3: ¿Cómo quieres recibir tu comida?"}
            {step === 4 && "Paso 4: Confirma tus datos"}
            {step === 5 && "¡Gracias por preferir a Empatuca!"}
          </DialogDescription>
        </div>

        <div className="p-6 text-gray-900 overflow-y-auto">
          {/* STEP 1: Arma tu pedido */}
          {step === 1 && initialProduct && (
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-xl mb-4 text-[#0D0D0D] border-b pb-2">{initialProduct.name}</h3>
                <div className="space-y-4">
                  {mainProductItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-800">{item.size}</span>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-xl w-6 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {initialProduct?.category?.includes('Empanadas') && (
                <div>
                  <h3 className="font-bold text-lg mb-3 text-[#0D0D0D] border-b pb-2">Acompañantes / Aderezos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox checked={aderezos.ensalada} onCheckedChange={(c) => setAderezos({...aderezos, ensalada: !!c})} />
                      <span className="text-sm font-medium">Ensalada</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox checked={aderezos.mayonesa} onCheckedChange={(c) => setAderezos({...aderezos, mayonesa: !!c})} />
                      <span className="text-sm font-medium">Mayonesa</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox checked={aderezos.aji} onCheckedChange={(c) => setAderezos({...aderezos, aji: !!c})} />
                      <span className="text-sm font-medium">Ají de la casa</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox checked={aderezos.salsa_rosada} onCheckedChange={(c) => setAderezos({...aderezos, salsa_rosada: !!c})} />
                      <span className="text-sm font-medium">Salsa Rosada</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-500 font-medium">Subtotal:</span>
                  <span className="text-2xl font-bold text-[#5a0606]">${total.toFixed(2)}</span>
                </div>
                <Button 
                  onClick={handleNext} 
                  className="w-full h-14 rounded-xl bg-[#fac124] hover:bg-[#eab308] text-[#0D0D0D] font-bold text-lg"
                  disabled={total === 0}
                >
                  Siguiente <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Bebidas */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-4 text-[#0D0D0D] border-b pb-2">{'¿Deseas agregar algo más del menú?'}</h3>
                <div className="flex gap-3 mb-4">
                  <Button 
                    variant={wantsDrink === false ? "default" : "outline"}
                    onClick={() => {
                      setWantsDrink(false);
                      setTimeout(() => setStep(3), 150);
                    }} 
                    className={`flex-1 h-12 rounded-xl transition-all ${wantsDrink === false ? 'bg-[#5a0606] hover:bg-[#4a0505] text-white border-none' : 'border-gray-200 text-gray-700'}`}
                  >
                    No, gracias
                  </Button>
                  <Button 
                    variant={wantsDrink === true ? "default" : "outline"}
                    onClick={() => setWantsDrink(true)} 
                    className={`flex-1 h-12 rounded-xl transition-all ${wantsDrink === true ? 'bg-[#fac124] hover:bg-[#eab308] text-[#0D0D0D] font-bold border-none' : 'border-gray-200 text-gray-700'}`}
                  >
                    Sí, claro
                  </Button>
                </div>
                
                {wantsDrink === true && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    {!extraCategory ? (
                      <div className="grid grid-cols-1 gap-3">
                        {['Empanadas de Verde', 'Empanadas de Harina', 'Bebidas'].map(cat => (
                          <Button key={cat} variant="outline" onClick={() => setExtraCategory(cat)} className="h-16 justify-between font-bold text-lg rounded-xl border-2 hover:border-[#fac124] hover:bg-[#fac124]/10 transition-colors bg-white">
                            {cat} <ArrowRight className="h-5 w-5 text-gray-400" />
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in slide-in-from-right-2">
                        <Button variant="ghost" onClick={() => setExtraCategory(null)} className="mb-2 -ml-4 text-gray-500 font-bold uppercase tracking-wider text-xs hover:text-black">
                          ← Volver a categorías
                        </Button>
                        {siteConfig.menu.filter(item => item.id !== initialProduct?.id && item.category === extraCategory).map((drink) => {
                      if (drink.category.includes('Empanadas')) {
                        return (
                          <div key={drink.id} className="flex flex-col gap-2 p-3 border rounded-xl bg-gray-50">
                            <span className="font-bold text-gray-800">{drink.name} {drink.category.includes('Verde') ? '(Verde)' : '(Harina)'}</span>
                            {drink.prices.empatuca && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Empatuca - ${drink.prices.empatuca.toFixed(2)}</span>
                                <div className="flex items-center gap-3">
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(`${drink.id}-empatuca`, -1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-bold text-lg w-4 text-center">{items.find(i => i.id === `${drink.id}-empatuca`)?.quantity || 0}</span>
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(`${drink.id}-empatuca`, 1)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {drink.prices.empanita && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Empanita - ${drink.prices.empanita.toFixed(2)}</span>
                                <div className="flex items-center gap-3">
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(`${drink.id}-empanita`, -1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-bold text-lg w-4 text-center">{items.find(i => i.id === `${drink.id}-empanita`)?.quantity || 0}</span>
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(`${drink.id}-empanita`, 1)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }

                      const drinkQuantity = drink.variants 
                        ? items.filter(i => i.baseId === drink.id).reduce((sum, i) => sum + i.quantity, 0)
                        : (items.find(i => i.id === `${drink.id}-estandar`)?.quantity || 0);

                      const selectedVariants = drink.variants ? items.filter(i => i.baseId === drink.id && i.quantity > 0) : [];

                      return (
                        <div key={drink.id} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-gray-800">{drink.name}</span>
                              <p className="text-sm text-gray-500">${drink.prices.estandar?.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {drink.variants ? (
                                 <Button variant="outline" className="h-8 rounded-full bg-[#FAFAFA] px-4 font-bold" onClick={() => setActiveVariantProduct(drink)}>
                                   Elegir <Plus className="h-3 w-3 ml-2" />
                                 </Button>
                              ) : (
                                <>
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(`${drink.id}-estandar`, -1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-bold text-lg w-4 text-center">{drinkQuantity}</span>
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(`${drink.id}-estandar`, 1)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          {selectedVariants.map(variant => (
                            <div key={variant.id} className="flex items-center justify-between pl-6 py-1 border-t border-dashed border-gray-200">
                               <span className="text-sm font-medium text-gray-600">↳ {variant.name.split('- ')[1] || variant.name}</span>
                               <div className="flex items-center gap-3">
                                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(variant.id, -1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-bold text-sm w-4 text-center">{variant.quantity}</span>
                                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(variant.id, 1)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                               </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-500 font-medium">Subtotal:</span>
                  <span className="text-2xl font-bold text-[#5a0606]">${total.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-14 flex-1 rounded-xl font-semibold">
                    Volver
                  </Button>
                  {wantsDrink !== null && (
                    <Button 
                      onClick={() => setStep(3)} 
                      className="h-14 flex-[2] rounded-xl bg-[#fac124] hover:bg-[#eab308] text-[#0D0D0D] font-bold text-lg"
                    >
                      Siguiente <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Tipo de Pedido */}
          {step === 3 && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {isAdmin && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOrderType('mesa')}
                    className={`h-24 flex flex-col gap-2 rounded-xl border-2 transition-all ${orderType === 'mesa' ? 'border-[#5a0606] bg-[#5a0606]/5 text-[#5a0606]' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'}`}
                  >
                    <Utensils className="h-6 w-6" />
                    <span>En Mesa</span>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOrderType('llevar')}
                  className={`h-24 flex flex-col gap-2 rounded-xl border-2 transition-all ${orderType === 'llevar' ? 'border-[#5a0606] bg-[#5a0606]/5 text-[#5a0606]' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'}`}
                >
                  <ShoppingBag className="h-6 w-6" />
                  <span>Para Llevar</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOrderType('delivery')}
                  className={`h-24 flex flex-col gap-2 rounded-xl border-2 transition-all ${orderType === 'delivery' ? 'border-[#fac124] bg-[#fac124]/10 text-[#0D0D0D]' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'}`}
                >
                  <MapPin className="h-6 w-6" />
                  <span>Delivery</span>
                </Button>
              </div>
              
              {orderType === 'mesa' && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <Label htmlFor="table" className="text-base font-semibold">Número de Mesa</Label>
                  <Input 
                    id="table" 
                    type="number"
                    placeholder="Ej. 1, 2, 3..." 
                    className="h-14 text-lg rounded-xl text-black"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
              )}

              {orderType === 'delivery' && (
                <div className="space-y-4 animate-in slide-in-from-top-2 bg-blue-50 p-4 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 leading-relaxed">
                      El costo de delivery varía según tu ubicación en Santo Domingo y se calculará por WhatsApp.
                    </p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <Label htmlFor="address" className="text-base font-semibold text-blue-900">Dirección de Entrega</Label>
                    <Input 
                      id="address" 
                      placeholder="Calle, Barrio, Referencia..." 
                      className="h-14 text-base rounded-xl border-blue-200 bg-white text-black"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="h-14 flex-1 rounded-xl font-semibold">
                  Volver
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  disabled={!orderType || (orderType === 'mesa' && !tableNumber) || (orderType === 'delivery' && !address)}
                  className="h-14 flex-[2] rounded-xl bg-[#fac124] hover:bg-[#eab308] text-[#0D0D0D] font-bold text-lg"
                >
                  Siguiente <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmación Final */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h4 className="font-bold text-[#0D0D0D] mb-3 pb-2 border-b border-gray-200">Resumen del pedido</h4>
                <ul className="space-y-3 mb-4">
                  {items.filter(i => i.quantity > 0).map((item) => (
                    <li key={item.id} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <span className="font-bold text-gray-800">{item.quantity}x</span> <span className="text-gray-900 font-bold">{item.name}</span> <span className="text-gray-500">{item.isVariant ? '' : `(${item.size})`}</span>
                      </div>
                      <span className="font-bold text-gray-700 whitespace-nowrap ml-4">${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                
                {initialProduct?.category?.includes('Empanadas') && (
                  <div className="mb-4 pt-3 border-t border-gray-200 text-sm">
                    <span className="font-semibold text-gray-700 block mb-1">Aderezos:</span>
                    <span className="text-gray-600">
                      {[
                        aderezos.ensalada && 'Ensalada', 
                        aderezos.mayonesa && 'Mayonesa', 
                        aderezos.aji && 'Ají', 
                                        aderezos.salsa_rosada && 'Rosada'
                      ].filter(Boolean).join(', ') || 'Ninguno'}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-bold text-gray-600 uppercase tracking-wide text-xs">Total a pagar</span>
                  <span className="text-2xl font-black text-[#5a0606]">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-semibold">Tu Nombre</Label>
                  <Input 
                    id="name" 
                    placeholder="¿Cómo te llamamos?" 
                    className="h-14 text-base rounded-xl text-black"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Método de Pago</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPaymentMethod('efectivo')}
                      className={`h-16 flex items-center justify-center gap-2 rounded-xl border-2 transition-all ${paymentMethod === 'efectivo' ? 'border-[#fac124] bg-[#fac124]/10 text-[#0D0D0D]' : 'border-gray-200 text-gray-700'}`}
                    >
                      <span>Efectivo</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPaymentMethod('transferencia')}
                      className={`h-16 flex items-center justify-center gap-2 rounded-xl border-2 transition-all ${paymentMethod === 'transferencia' ? 'border-[#fac124] bg-[#fac124]/10 text-[#0D0D0D]' : 'border-gray-200 text-gray-700'}`}
                    >
                      <span>Transferencia</span>
                    </Button>
                  </div>
                </div>

                {(orderType === 'llevar' || orderType === 'delivery') && (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 mt-4">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 leading-snug font-medium">
                      <span className="font-bold">Importante:</span> Al presionar "Enviar Pedido", se abrirá WhatsApp. Por ahí deberás confirmar tu {orderType === 'llevar' ? 'hora de retiro' : 'hora de entrega'} y enviar el comprobante de pago si eliges transferencia.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="h-14 flex-1 rounded-xl font-semibold">
                  Volver
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!customerName.trim() || !paymentMethod || isSubmitting}
                  className="h-14 flex-[2] rounded-xl bg-[#25D366] hover:bg-[#20b858] text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isSubmitting ? "Procesando..." : "Enviar Pedido"} <MessageCircle className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Success */}
          {step === 5 && (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-8 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#0D0D0D]">¡Recibimos tu pedido!</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Tu pedido ha sido enviado a la cocina y pronto estará en preparación.
                </p>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100 w-full max-w-sm">
                <p className="text-sm text-gray-500 font-medium mb-1">Tu número de orden es:</p>
                <p className="text-4xl font-black text-[#5a0606]">#{orderId}</p>
              </div>

              {paymentMethod === 'transferencia' ? (
                <Button 
                  onClick={() => {
                    const msg = `Hola, acabo de realizar el pedido #${orderId} a nombre de ${customerName}. Adjunto mi comprobante de transferencia.`;
                    window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
                  }} 
                  className="w-full h-14 rounded-xl font-semibold bg-[#25D366] hover:bg-[#20b858] text-white shadow-lg mt-4"
                >
                  Enviar comprobante por WhatsApp
                </Button>
              ) : (
                <p className="text-sm text-gray-500 italic max-w-sm mx-auto mt-4">
                  Recuerda realizar el pago en efectivo al momento de recibir tu pedido.
                </p>
              )}

              <Button onClick={resetAndClose} className="w-full h-14 rounded-xl font-semibold bg-[#FAFAFA] text-[#0D0D0D] border border-gray-200 hover:bg-gray-100 mt-2">
                Volver al menú
              </Button>
            </div>
          )}
        </div>
        
        {/* Variants Sub-modal */}
        {activeVariantProduct && (
          <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300">
            <div className="bg-[#5a0606] p-4 text-white flex items-center justify-between shrink-0 shadow-md">
              <h3 className="font-bold text-xl tracking-tight">Elige el sabor</h3>
              <Button variant="ghost" className="text-white hover:bg-white/20 p-2 h-auto" onClick={() => setActiveVariantProduct(null)}>
                Cerrar
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <p className="text-gray-600 mb-6 font-medium text-center">Toca la imagen para agregar {activeVariantProduct.name.replace('🥤', '').trim()}</p>
              <div className="grid grid-cols-2 gap-4">
                {activeVariantProduct.variants.map((v: any) => {
                  const variantId = `${activeVariantProduct.id}-estandar-${v.id}`;
                  const variantQuantity = items.find(i => i.id === variantId)?.quantity || 0;
                  return (
                    <div 
                      key={v.id} 
                      onClick={() => updateQuantity(variantId, 1)}
                      className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer border-2 border-transparent hover:border-[#fac124] hover:shadow-lg transition-all relative group"
                    >
                      {variantQuantity > 0 && (
                        <div className="absolute -top-3 -right-3 bg-[#fac124] text-[#5a0606] font-black w-8 h-8 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                          {variantQuantity}
                        </div>
                      )}
                      <img src={`https://placehold.co/200x200/5a0606/fac124?text=${encodeURIComponent(v.name)}`} alt={v.name} className="w-24 h-24 object-cover rounded-xl mb-3 shadow-sm group-hover:scale-105 transition-transform" />
                      <span className="font-bold text-center text-sm">{v.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-white shrink-0">
              <Button className="w-full h-14 rounded-xl bg-[#fac124] hover:bg-[#eab308] text-[#0D0D0D] font-bold text-lg" onClick={() => setActiveVariantProduct(null)}>
                Listo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
      </Dialog>
  );
}
