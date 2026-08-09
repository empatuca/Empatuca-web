const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(/pedido\.total\?\.toFixed\(2\)/g, "Number(pedido.total || 0).toFixed(2)");

fs.writeFileSync('src/pages/Inventario.tsx', code);
