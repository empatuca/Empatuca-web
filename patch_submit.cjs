const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldSubmit = `    if (paymentMethod === 'transferencia') {
      msg += \`\\nAdjunto mi comprobante de transferencia.\`;
    }

    try {
      window.open(\`https://wa.me/\${siteConfig.whatsapp}?text=\${encodeURIComponent(msg)}\`, '_blank');
      setStep(5);
    } catch (err) {`;

const newSubmit = `    if (paymentMethod === 'transferencia') {
      msg += \`\\nAdjunto mi comprobante de transferencia.\`;
    }

    try {
      const orderData = {
        numero_pedido: orderIdValue,
        nombre_cliente: customerName,
        tipo: orderType,
        mesa: orderType === 'mesa' ? parseInt(tableNumber) || null : null,
        direccion_delivery: orderType === 'delivery' ? address : null,
        productos: selectedItems,
        estado: 'nuevo',
        aderezos: initialProduct?.category?.includes('Empanadas') ? aderezos : null,
      };

      if (supabase) {
        const { error } = await supabase.from('pedidos').insert([orderData]);
        if (error) {
          console.error("Error al guardar en Supabase:", error);
          // Opcional: mostrar un aviso o continuar
        }
      } else {
        localOrders.push({
          id: Math.random().toString(36).substr(2, 9),
          ...orderData,
          created_at: new Date().toISOString()
        });
        notifyLocalListeners();
      }

      window.open(\`https://wa.me/\${siteConfig.whatsapp}?text=\${encodeURIComponent(msg)}\`, '_blank');
      setStep(5);
    } catch (err) {`;

code = code.replace(oldSubmit, newSubmit);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
