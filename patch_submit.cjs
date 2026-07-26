const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldHandleSubmit = `  const handleSubmit = async () => {
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
      setStep(5);
    } catch (err) {
      console.error("Error al guardar pedido:", err);
      alert("Hubo un error al enviar tu pedido. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };`;

const newHandleSubmit = `  const handleSubmit = async () => {
    if (!customerName) return;
    setIsSubmitting(true);
    
    const selectedItems = items.filter(i => i.quantity > 0);
    const orderIdValue = Math.floor(Math.random() * 1000);
    setOrderId(orderIdValue);

    let msg = \`Hola, quiero hacer un pedido (#\${orderIdValue}):\\n\\n\`;
    selectedItems.forEach(item => {
      msg += \`- \${item.quantity}x \${item.name} \${item.isVariant ? '' : \`(\${item.size})\`} ($\${(item.price * item.quantity).toFixed(2)})\\n\`;
    });
    msg += \`\\n\`;

    if (initialProduct?.category?.includes('Empanadas')) {
      const aderezosList = [
        aderezos.ensalada && 'Ensalada', 
        aderezos.mayonesa && 'Mayonesa', 
        aderezos.aji && 'Ají', 
        aderezos.salsa_pina && 'Piña', 
        aderezos.salsa_rosada && 'Rosada'
      ].filter(Boolean).join(', ');
      msg += \`Aderezos: \${aderezosList || 'Ninguno'}\\n\`;
    }

    msg += \`\\n*Detalles del pedido:*\\n\`;
    msg += \`Nombre: \${customerName}\\n\`;
    msg += \`Tipo: \${orderType === 'llevar' ? 'Para Llevar' : orderType === 'delivery' ? 'Delivery' : 'En Mesa'}\\n\`;
    
    if (orderType === 'mesa') msg += \`Mesa: \${tableNumber}\\n\`;
    if (orderType === 'delivery') msg += \`Dirección: \${address}\\n\`;

    msg += \`Pago: \${paymentMethod === 'efectivo' ? 'Efectivo' : 'Transferencia'}\\n\`;
    msg += \`Total a pagar: $\${total.toFixed(2)}\\n\`;

    if (paymentMethod === 'transferencia') {
      msg += \`\\nAdjunto mi comprobante de transferencia.\`;
    }

    try {
      window.open(\`https://wa.me/\${siteConfig.whatsapp}?text=\${encodeURIComponent(msg)}\`, '_blank');
      setStep(5);
    } catch (err) {
      console.error("Error al redirigir a WhatsApp:", err);
      alert("Hubo un error al procesar tu pedido. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };`;

code = code.replace(oldHandleSubmit, newHandleSubmit);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
