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

      siteConfig.menu.forEach(item => {
        if (item.id !== initialProduct.id) {
          if (item.category.includes('Empanadas')) {
            if (item.prices.empatuca) {
              newItems.push({
                id: `${item.id}-empatuca`,
                name: item.name,
                size: "Empatuca",
                price: item.prices.empatuca,
                quantity: 0
              });
            }
            if (item.prices.empanita) {
              newItems.push({
                id: `${item.id}-empanita`,
                name: item.name,
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
    const orderIdValue = Math.floor(Math.random() * 1000);
    setOrderId(orderIdValue);

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
      window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
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
                <h3 className="font-bold text-lg mb-4 text-[#0D0D0D] border-b pb-2">{isInitialDrink ? '¿Deseas acompañar con unas empanadas?' : '¿Deseas acompañar con una bebida?'}</h3>
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
                    {siteConfig.menu.filter(item => (isInitialDrink ? item.category.includes('Empanadas') : item.category === 'Bebidas') && item.id !== initialProduct?.id).map((drink) => {

                      if (isInitialDrink) {
                        return (
                          <div key={drink.id} className="flex flex-col gap-2 p-3 border rounded-xl bg-gray-50">
                            <span className="font-bold text-gray-800">{drink.name}</span>
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
                    className="h-14 text-lg rounded-xl"
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
                      className="h-14 text-base rounded-xl border-blue-200 bg-white"
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
                        <span className="font-bold text-gray-800">{item.quantity}x</span> {item.name} {item.isVariant ? '' : `(${item.size})`}
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
                    className="h-14 text-base rounded-xl"
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
                  Por favor, termina de confirmarlo enviando el mensaje por WhatsApp que se acaba de abrir en tu celular.
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
