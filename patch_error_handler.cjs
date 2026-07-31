const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldCode = `      if (supabase) {
        let { error } = await supabase.from('pedidos').insert([orderData]);
        
        if (error && error.message && error.message.includes('aderezos')) {
          const { aderezos, ...fallbackData } = orderData;
          const retry = await supabase.from('pedidos').insert([fallbackData]);
          error = retry.error;
        }

        if (error) {
          console.error("Error al guardar en Supabase:", error);
          alert("Error al procesar el pedido. Intenta nuevamente. Detalle: " + error.message);
          setIsSubmitting(false);
          return;
        }
      } else {`;

const newCode = `      if (supabase) {
        const { error } = await supabase.from('pedidos').insert([orderData]);

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
      } else {`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
