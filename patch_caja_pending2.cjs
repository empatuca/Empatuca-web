const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

const regex1 = /o\.tipo === 'mesa' && o\.metodo_pago === 'pendiente'/g;
code = code.replace(regex1, "o.metodo_pago === 'pendiente'");

fs.writeFileSync('src/pages/Caja.tsx', code);
