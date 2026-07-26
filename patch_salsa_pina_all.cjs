const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

code = code.replace(/    salsa_pina: true,\n/g, '');
code = code.replace(/        aderezos.salsa_pina && 'Piña', \n/g, '');
code = code.replace(/        aderezos.salsa_pina && 'Piña',\n/g, '');

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
