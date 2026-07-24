import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, ShoppingBag, Plus, Minus, ArrowRight, CheckCircle2, Utensils } from "lucide-react";
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
    salsa_pina: true,
    salsa_rosada: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && initialProduct) {
      setStep(1);
      
      const newItems: OrderItem[] = [];
      
      if (initialProduct.prices.empatuca) {
        newItems.push({
          id: `${initialProduct.id}-empatuca`,
          name: initialProduct.name,
          size: "Empatuca",
          price: initialProduct.prices.empatuca,
          quantity: 1
        });
      }
      
      if (initialProduct.prices.empanita) {
        newItems.push({
          id: `${initialProduct.id}-empanita`,
          name: initialProduct.name,
          size: "Empanita",
          price: initialProduct.prices.empanita,
          quantity: 0
        });
      }

      if (!initialProduct.prices.empatuca && initialProduct.prices.estandar) {
        newItems.push({
          id: `${initialProduct.id}-estandar`,
          name: initialProduct.name,
          size: "Estándar",
          price: initialProduct.prices.estandar,
          quantity: 1
        });
      }

      siteConfig.menu.filter(item => item.category === 'Bebidas').forEach(drink => {
        if (drink.id !== initialProduct.id) {
          newItems.push({
            id: `${drink.id}-estandar`,
            name: drink.name,
            size: "Estándar",
            price: drink.prices.estandar || 0,
            quantity: 0
          });
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

    const newOrder = {
      nombre_cliente: customerName,
      tipo: orderType,
      metodo_pago: paymentMethod,
      mesa: orderType === 'mesa' ? parseInt(tableNumber) : null,
      direccion_delivery: orderType === 'delivery' ? address : null,
      productos: selectedItems,
      aderezos,
      total: total,
      estado: 'nuevo'
    };

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('pedidos')
          .insert([newOrder])
          .select('numero_pedido');
          
        if (error) throw error;
        setOrderId(data?.[0]?.numero_pedido || Math.floor(Math.random() * 1000));
      } else {
        const mockOrderId = Math.floor(Math.random() * 1000);
        const completeOrder = {
          ...newOrder,
          id: crypto.randomUUID(),
          numero_pedido: mockOrderId,
          created_at: new Date().toISOString()
        };
        localOrders.unshift(completeOrder);
        notifyLocalListeners();
        setOrderId(mockOrderId);
      }
      setStep(4);
    } catch (err) {
      console.error("Error al guardar pedido:", err);
      alert("Hubo un error al enviar tu pedido. Por favor intenta de nuevo.");
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
        salsa_pina: true,
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

              {initialProduct.category.includes('Empanadas') && (
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
                      <Checkbox checked={aderezos.salsa_pina} onCheckedChange={(c) => setAderezos({...aderezos, salsa_pina: !!c})} />
                      <span className="text-sm font-medium">Salsa de Piña</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox checked={aderezos.salsa_rosada} onCheckedChange={(c) => setAderezos({...aderezos, salsa_rosada: !!c})} />
                      <span className="text-sm font-medium">Salsa Rosada</span>
                    </label>
                  </div>
                </div>
              )}

              {initialProduct.category.includes('Empanadas') && (
                <div>
                  <h3 className="font-bold text-lg mb-4 text-[#0D0D0D] border-b pb-2">¿Deseas acompañar con una bebida?</h3>
                  <div className="flex gap-3 mb-4">
                    <Button 
                      variant={wantsDrink === false ? "default" : "outline"}
                      onClick={() => {
                        setWantsDrink(false);
                        if (total > 0 && wantsDrink === null) {
                          setTimeout(() => setStep(2), 150); // slight delay to show selection
                        }
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
                    <div ref={drinksRef} className="space-y-4 animate-in fade-in slide-in-from-top-2 pt-2">
                      {drinkItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-gray-800">{item.name}</span>
                            <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-bold text-lg w-4 text-center">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(item.id, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-4 text-[#0D0D0D] border-b pb-2">¿Deseas acompañar con una bebida?</h3>
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
                    {drinkItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-800">{item.name}</span>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-bold text-lg w-4 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
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
          {step === 2 && (
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
                  className={`h-24 flex flex-col gap-2 rounded-xl border-2 transition-all ${orderType === 'delivery' ? 'border-[#5a0606] bg-[#5a0606]/5 text-[#5a0606]' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'}`}
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
                    className="h-14 text-lg rounded-xl"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
              )}

              {orderType === 'delivery' && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <Label htmlFor="address" className="text-base font-semibold">Dirección de entrega</Label>
                  <Input 
                    id="address" 
                    placeholder="Calle principal, intersección y referencia" 
                    className="h-14 text-lg rounded-xl"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(initialProduct?.category.includes('Empanadas') ? 2 : 1)} className="h-14 flex-1 rounded-xl font-semibold">
                  Volver
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="w-full h-14 flex-[2] rounded-xl bg-[#fac124] hover:bg-[#eab308] text-[#0D0D0D] font-bold text-lg disabled:opacity-50 transition-all"
                  disabled={(orderType === 'delivery' && !address) || (orderType === 'mesa' && !tableNumber)}
                >
                  {orderType === 'delivery' && !address 
                    ? 'Ingresa tu dirección' 
                    : <span className="flex items-center justify-center">Siguiente <ArrowRight className="ml-2 h-5 w-5" /></span>}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmación Final */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                <h4 className="font-bold text-gray-700 mb-2">Resumen</h4>
                <ul className="text-sm text-gray-600 space-y-1 mb-3">
                  {items.filter(i => i.quantity > 0).map((item, i) => (
                    <li key={i}>{item.quantity}x {item.name} ({item.size})</li>
                  ))}
                </ul>
                <div className="flex justify-between items-center border-t border-gray-200 pt-2 font-bold text-gray-800">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500 uppercase tracking-wide font-semibold">
                  Modalidad: {orderType === 'mesa' ? `Mesa ${tableNumber}` : orderType === 'delivery' ? `Delivery` : 'Para llevar'}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-semibold">Tu Nombre</Label>
                <Input 
                  id="name" 
                  placeholder="¿Cómo te llamas?" 
                  className="h-14 text-lg rounded-xl focus-visible:ring-[#5a0606]"
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
                    className={`h-12 rounded-xl border-2 transition-all ${paymentMethod === 'efectivo' ? 'border-[#5a0606] bg-[#5a0606]/5 text-[#5a0606]' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'}`}
                  >
                    Efectivo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPaymentMethod('transferencia')}
                    className={`h-12 rounded-xl border-2 transition-all ${paymentMethod === 'transferencia' ? 'border-[#5a0606] bg-[#5a0606]/5 text-[#5a0606]' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'}`}
                  >
                    Transferencia
                  </Button>
                </div>
                {paymentMethod === 'transferencia' && (
                  <p className="text-xs text-gray-500 mt-1">
                    * Si eliges transferencia, por favor recuerda enviar el comprobante de pago por WhatsApp.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(3)} className="h-14 flex-1 rounded-xl font-semibold">
                  Volver
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!customerName || isSubmitting}
                  className="h-14 flex-[2] rounded-xl bg-[#5a0606] hover:bg-[#4a0505] text-white font-bold text-lg shadow-lg shadow-[#5a0606]/20"
                >
                  {isSubmitting ? "Confirmando..." : "Confirmar Pedido"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Success */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="h-24 w-24 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-[#25D366]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#0D0D0D]">Pedido Recibido</h3>
                <p className="text-gray-600 max-w-[250px] mx-auto">
                  Tu pedido ya está en cola.
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
      </DialogContent>
    </Dialog>
  );
}
