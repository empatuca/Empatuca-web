const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

code = code.replace("estado: 'nuevo',", "estado: isAdmin ? 'nuevo' : 'pendiente_caja',");

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
