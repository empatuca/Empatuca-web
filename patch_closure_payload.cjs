const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(/const payload = \{[\s\S]*?inventario: inventory\n    \};/, `const payload = {
      fecha: today,
      total_ventas: totalVentas,
      inventario: inventory,
      pedidos: todayOrders
    };`);

fs.writeFileSync('src/pages/Inventario.tsx', code);
