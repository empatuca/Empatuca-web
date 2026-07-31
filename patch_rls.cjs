const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldCode = `        if (error) {
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
          }`;

const newCode = `        if (error) {
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
             alert("🔐 Error de Permisos en Supabase (RLS)\\n\\nLa tabla 'pedidos' tiene Row Level Security activado y no permite insertar datos.\\n\\nPara solucionarlo:\\n1. Ve a tu panel de Supabase\\n2. Entra al Table Editor -> pedidos\\n3. Haz clic donde dice 'RLS' en la parte superior derecha\\n4. Selecciona 'Disable RLS' (o crea una política que permita INSERT a roles 'anon').");
             setIsSubmitting(false);
             return;
          }
          
          console.warn("Error al guardar en Supabase:", error);`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
