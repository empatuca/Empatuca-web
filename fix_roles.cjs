const fs = require('fs');

const fixRole = (file, roleStr) => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /`Tienes un nuevo pedido esperando en \$\{role === 'caja' \? 'caja' : 'cocina'\}\.`/,
    `'Tienes un nuevo pedido esperando en ${roleStr}.'`
  );
  fs.writeFileSync(file, code);
}

fixRole('src/pages/Caja.tsx', 'caja');
fixRole('src/pages/Cocina.tsx', 'cocina');
