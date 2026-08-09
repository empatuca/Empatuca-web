const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(/closure\.total_ventas\.toFixed\(2\)/g, "Number(closure.total_ventas).toFixed(2)");

fs.writeFileSync('src/pages/Inventario.tsx', code);
