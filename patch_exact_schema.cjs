const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldCode = `      const orderData: any = {
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

        if (error && error.message && error.message.includes('tipo')) {
             // Fallback if they added 'tipo' and 'mesa' later
             orderData.tipo = orderType;
             orderData.mesa = orderType === 'mesa' ? parseInt(tableNumber) || null : null;
             const retry = await supabase.from('pedidos').insert([orderData]);
             error = retry.error;
        }

        if (error && error.message && error.message.includes('aderezos')) {
             const { aderezos, ...fallbackData } = orderData;
             const retry = await supabase.from('pedidos').insert([fallbackData]);
             error = retry.error;
        }

        if (error && error.message && error.message.includes('invalid input syntax') && error.message.includes('text')) {
             orderData.productos = JSON.stringify(orderData.productos);
             if (orderData.aderezos) orderData.aderezos = JSON.stringify(orderData.aderezos);
             const retry = await supabase.from('pedidos').insert([orderData]);
             error = retry.error;
        }

        if (error) {
          console.error("Error al guardar en Supabase:", error);
          let errorMessage = error.message || JSON.stringify(error);
          if (errorMessage && errorMessage.includes('schema cache')) {
            errorMessage += "\\n\\nSolución: Ve a Supabase > SQL Editor y ejecuta:\\nNOTIFY pgrst, 'reload schema';";
          }
          alert("Error de base de datos:\\n" + errorMessage + "\\n\\nPor favor asegúrate de que las columnas coincidan exactamente con: id, numero_pedido, nombre_cliente, direccion_delivery, productos, total, estado, created_at, aderezos, metodo_pago.");
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
          console.error("Error inicial Supabase:", error);
          // Si el error es sobre el tipo de dato de productos (texto en lugar de jsonb)
          if (error.message && error.message.includes('invalid input syntax')) {
            payload.productos = JSON.stringify(payload.productos);
            const retry = await supabase.from('pedidos').insert([payload]);
            error = retry.error;
          }
        }

        if (error) {
          console.error("Error al guardar en Supabase:", error);
          let errorMessage = error.message || JSON.stringify(error);
          
          if (error.code === '42501') {
             alert("Error de permisos (RLS). Por favor desactiva RLS en la tabla 'pedidos' o agrega una política para permitir INSERT. Ve a Supabase -> Authentication -> Policies.");
             setIsSubmitting(false);
             return;
          }

          if (errorMessage && errorMessage.includes('schema cache')) {
            errorMessage += "\\n\\nSolución: Ve a Supabase > SQL Editor y ejecuta:\\nNOTIFY pgrst, 'reload schema';";
          }
          
          alert("Error al guardar en Supabase:\\n" + errorMessage + "\\n\\nAsegúrate de que las columnas de tu tabla sean: id, numero_pedido, nombre_cliente, direccion_delivery, productos, total, estado, aderezos, metodo_pago, created_at.");
          setIsSubmitting(false);
          return;
        }
      }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
