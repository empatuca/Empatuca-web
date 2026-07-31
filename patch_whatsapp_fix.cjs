const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldCode = `      if (supabase) {
        const { error } = await supabase.from('pedidos').insert([orderData]);
        if (error) {
          console.error("Error al guardar en Supabase:", error);
          alert("Error de base de datos: " + error.message + "\\n\\nPor favor, asegúrate de haber ejecutado el script SQL en Supabase para crear la tabla 'pedidos' y deshabilitar RLS.");
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

      setStep(5);`;

const newCode = `      if (supabase) {
        const { error } = await supabase.from('pedidos').insert([orderData]);
        if (error) {
          console.error("Error al guardar en Supabase:", error);
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
      setStep(5);`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
