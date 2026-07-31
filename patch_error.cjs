const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldErr = `        if (error) {
          console.error("Error al guardar en Supabase:", error);
          // Opcional: mostrar un aviso o continuar
        }`;

const newErr = `        if (error) {
          console.error("Error al guardar en Supabase:", error);
          alert("Error de base de datos: " + error.message + "\\n\\nPor favor, asegúrate de haber ejecutado el script SQL en Supabase para crear la tabla 'pedidos' y deshabilitar RLS.");
        }`;

code = code.replace(oldErr, newErr);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
