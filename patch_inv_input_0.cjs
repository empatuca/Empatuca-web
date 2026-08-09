const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(/value=\{item\.initialStock \|\| ''\}/g, "value={item.initialStock === 0 ? '' : item.initialStock}");

fs.writeFileSync('src/pages/Inventario.tsx', code);
