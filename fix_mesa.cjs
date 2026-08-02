const fs = require('fs');
let code = fs.readFileSync('src/pages/Mesa.tsx', 'utf8');

code = code.replace(
  '<h3 className="font-black text-3xl">#{order.numero_pedido || \'N/A\'}</h3>',
  '<h3 className="font-black text-3xl text-gray-900">#{order.numero_pedido || \'N/A\'}</h3>'
);

fs.writeFileSync('src/pages/Mesa.tsx', code);
