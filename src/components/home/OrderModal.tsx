import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Utensils, ShoppingBag, Plus, Minus, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase, localOrders, notifyLocalListeners } from "../../lib/supabase";

type Step = 1 | 2 | 3 | 4;
type OrderType = 'mesa' | 'delivery' | 'llevar';

interface OrderItem {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export function OrderModal({ isOpen, onClose, initialProduct }: { isOpen: boolean, onClose: () => void, initialProduct: any }) {
  const [step, setStep] = useState<Step>(1);
  const [orderType, setOrderType] = useState<OrderType>('llevar');
  const [tableNumber, setTableNumber] = useState("");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Reset state when modal opens with a new product
  useEffect(() => {
    if (isOpen && initialProduct) {
      setStep(1);
      
      // Determine default size and price
      let defaultSize = "Empatuca";
      let defaultPrice = initialProduct.prices.empatuca || 0;
      
      if (!initialProduct.prices.empatuca) {
        if (initialProduct.prices.empanita) {
          defaultSize = "Empanita";
          defaultPrice = initialProduct.prices.empanita;
        } else if (initialProduct.prices.estandar) {
          defaultSize = "Estándar";
          defaultPrice = initialProduct.prices.estandar;
        }
      }

      setItems([{
        id: initialProduct.id,
        name: initialProduct.name,
        size: defaultSize,
        price: defaultPrice,
        quantity: 1
      }]);
    }
  }, [isOpen, initialProduct]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    const newQuantity = newItems[index].quantity + delta;
    if (newQuantity > 0) {
      newItems[index].quantity = newQuantity;
      setItems(newItems);
    }
  };

  const changeSize = (index: number, newSize: string, newPrice: number) => {
    const newItems = [...items];
    newItems[index].size = newSize;
    newItems[index].price = newPrice;
    setItems(newItems);
  };

  const handleNext = () => {
    if (step === 1) {
      if (orderType === 'mesa' && !tableNumber) return;
      if (orderType === 'delivery' && !address) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!customerName) return;
    setIsSubmitting(true);
    
    const newOrder = {
      nombre_cliente: customerName,
      tipo: orderType,
      mesa: orderType === 'mesa' ? parseInt(tableNumber) : null,
      direccion_delivery: orderType === 'delivery' ? address : null,
      productos: items,
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
        // Fallback local mode
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
      setStep(4); // Success step
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
      setTableNumber("");
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2rem] bg-white border-none shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="bg-[#5a0606] p-6 text-white relative">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {step === 4 ? "¡Pedido Confirmado!" : "Tu Pedido"}
          </DialogTitle>
          <DialogDescription className="text-white/80 mt-1">
            {step === 1 && "Paso 1: ¿Cómo quieres recibir tu comida?"}
            {step === 2 && "Paso 2: Revisa tu orden"}
            {step === 3 && "Paso 3: Confirma tus datos"}
            {step === 4 && "¡Gracias por preferir a Empatuca!"}
          </DialogDescription>
        </div>

        <div className="p-6 text-gray-900">
          {/* STEP 1: Tipo de Pedido */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOrderType('mesa')}
                  className={`h-24 flex flex-col gap-2 rounded-xl border-2 transition-all ${orderType === 'mesa' ? 'border-[#5a0606] bg-[#5a0606]/5 text-[#5a0606]' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'}`}
                >
                  <Utensils className="h-6 w-6" />
                  <span>En Mesa</span>
                </Button>
              </div>

              {orderType === 'mesa' && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <Label htmlFor="table" className="text-base font-semibold">Número de Mesa</Label>
                  <Input 
                    id="table" 
                    placeholder="Ej: 3" 
                    type="number" 
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

              <Button 
                onClick={handleNext} 
                className="w-full h-14 rounded-xl bg-[#fac124] hover:bg-[#eab308] text-[#0D0D0D] font-bold text-lg mt-6"
                disabled={(orderType === 'mesa' && !tableNumber) || (orderType === 'delivery' && !address)}
              >
                Siguiente <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* STEP 2: Resumen de Productos */}
          {step === 2 && initialProduct && (
            <div className="space-y-6">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-100 p-4 rounded-xl space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-[#0D0D0D]">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.size} • ${item.price.toFixed(2)} c/u</p>
                    </div>
                    <div className="font-bold text-lg text-[#5a0606]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  {/* Size selector if it's an empanada */}
                  {initialProduct.prices.empanita && initialProduct.prices.empatuca && (
                    <div className="flex gap-2">
                      <Button
                        variant={item.size === "Empanita" ? "default" : "outline"}
                        onClick={() => changeSize(index, "Empanita", initialProduct.prices.empanita)}
                        className={`flex-1 h-10 ${item.size === "Empanita" ? "bg-[#5a0606] hover:bg-[#5a0606] text-white" : ""}`}
                        size="sm"
                      >
                        Empanita
                      </Button>
                      <Button
                        variant={item.size === "Empatuca" ? "default" : "outline"}
                        onClick={() => changeSize(index, "Empatuca", initialProduct.prices.empatuca)}
                        className={`flex-1 h-10 ${item.size === "Empatuca" ? "bg-[#5a0606] hover:bg-[#5a0606] text-white" : ""}`}
                        size="sm"
                      >
                        Empatuca
                      </Button>
                    </div>
                  )}

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-2">
                    <span className="font-medium">Cantidad</span>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={() => updateQuantity(index, -1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-xl w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(index, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center py-4 px-2 border-t border-gray-100">
                <span className="text-lg text-gray-500 font-medium">Total a pagar:</span>
                <span className="text-3xl font-bold text-[#5a0606]">${total.toFixed(2)}</span>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="h-14 flex-1 rounded-xl font-semibold">
                  Volver
                </Button>
                <Button onClick={handleNext} className="h-14 flex-[2] rounded-xl bg-[#fac124] hover:bg-[#eab308] text-[#0D0D0D] font-bold text-lg">
                  Confirmar Pedido
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmación Final */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                <h4 className="font-bold text-gray-700 mb-2">Resumen</h4>
                <ul className="text-sm text-gray-600 space-y-1 mb-3">
                  {items.map((item, i) => (
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

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="h-14 flex-1 rounded-xl font-semibold">
                  Volver
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!customerName || isSubmitting}
                  className="h-14 flex-[2] rounded-xl bg-[#5a0606] hover:bg-[#4a0505] text-white font-bold text-lg shadow-lg shadow-[#5a0606]/20"
                >
                  {isSubmitting ? "Enviando..." : "Enviar a Cocina"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="h-24 w-24 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-[#25D366]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#0D0D0D]">Pedido Recibido</h3>
                <p className="text-gray-600 max-w-[250px] mx-auto">
                  Tu pedido ya está en cocina y se preparará lo más pronto posible.
                </p>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-1">Tu número de orden es:</p>
                <p className="text-4xl font-black text-[#5a0606]">#{orderId}</p>
              </div>

              <Button onClick={resetAndClose} className="w-full h-14 rounded-xl font-semibold bg-[#FAFAFA] text-[#0D0D0D] border border-gray-200 hover:bg-gray-100 mt-4">
                Volver al menú
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
