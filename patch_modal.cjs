const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldCode = `      const orderData = {
        numero_pedido: orderIdValue,
        nombre_cliente: customerName,
        tipo: orderType,
        mesa: orderType === 'mesa' ? parseInt(tableNumber) || null : null,
        direccion_delivery: orderType === 'delivery' ? address : null,
        productos: selectedItems,
        estado: 'nuevo',
        aderezos: initialProduct?.category?.includes('Empanadas') ? aderezos : null,
        total: total,
        metodo_pago: paymentMethod,
      };

      if (supabase) {
        let { error } = await supabase.from('pedidos').insert([orderData]);
        
        if (error && error.message && error.message.includes('aderezos')) {
          const { aderezos, ...fallbackData } = orderData;
          const retry = await supabase.from('pedidos').insert([fallbackData]);
          error = retry.error;
        }

        if (error) {
          console.error("Error al guardar en Supabase:", error);
          let errorMessage = error.message;
          if (errorMessage && errorMessage.includes('schema cache')) {
            errorMessage += "\\n\\nSolución: Ve a Supabase > SQL Editor y ejecuta:\\nNOTIFY pgrst, 'reload schema';";
          }
          alert("Error al guardar en Supabase:\\n" + errorMessage);
          setIsSubmitting(false);
          return;
        }
      }`;

const newCode = `      const orderData: any = {
        numero_pedido: orderIdValue,
        nombre_cliente: customerName,
        direccion_delivery: orderType === 'delivery' ? address : (orderType === 'mesa' ? \`Mesa \${tableNumber}\` : 'Para Llevar'),
        productos: selectedItems,
        estado: 'nuevo',
        aderezos: initialProduct?.category?.includes('Empanadas') ? aderezos : null,
        total: total,
        metodo_pago: paymentMethod,
      };

      if (supabase) {
        let { error } = await supabase.from('pedidos').insert([orderData]);
        
        // If it fails because of missing columns, try a more basic payload
        if (error) {
          console.error("Error al guardar en Supabase:", error);
          
          let errorMessage = error.message || JSON.stringify(error);
          
          // Check if the error is related to missing columns 'tipo' or 'mesa'
          if (errorMessage.includes('tipo') || errorMessage.includes('mesa')) {
            // These are already removed in our orderData above, but just in case
          } else if (errorMessage.includes('aderezos')) {
            const { aderezos, ...fallbackData } = orderData;
            const retry = await supabase.from('pedidos').insert([fallbackData]);
            error = retry.error;
          } else if (errorMessage.includes('invalid input syntax') && errorMessage.includes('text')) {
             // If they created productos as text instead of jsonb
             orderData.productos = JSON.stringify(orderData.productos);
             if (orderData.aderezos) orderData.aderezos = JSON.stringify(orderData.aderezos);
             const retry = await supabase.from('pedidos').insert([orderData]);
             error = retry.error;
          }

          if (error) {
             alert("Error de base de datos:\\n" + (error.message || JSON.stringify(error)) + "\\n\\nPor favor asegúrate de que las columnas coincidan exactamente.");
             setIsSubmitting(false);
             return;
          }
        }
      }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
