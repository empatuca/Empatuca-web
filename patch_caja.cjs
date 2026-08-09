const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

code = code.replace(/await supabase\.from\('pedidos'\)\.update\(\{ estado: newEstado, metodo_pago: newMetodoPago \}\)\.eq\('id', id\);/g, 
  `const { error } = await supabase.from('pedidos').update({ estado: newEstado, metodo_pago: newMetodoPago }).eq('id', id);
         if (error) {
             alert('Error al confirmar pago: ' + error.message);
         }`);

fs.writeFileSync('src/pages/Caja.tsx', code);
