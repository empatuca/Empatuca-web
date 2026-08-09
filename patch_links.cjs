const fs = require('fs');

const files = [
  'src/pages/StaffLogin.tsx',
  'src/pages/Mesa.tsx',
  'src/pages/Caja.tsx',
  'src/pages/Cocina.tsx',
  'src/pages/Inventario.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/window\.location\.hash = '([^']+)'/g, "window.location.href = '/$1'".replace(/\/\#/g, '/'));
  code = code.replace(/window\.location\.hash === '([^']+)'/g, "window.location.pathname === '/$1'".replace(/\/\#/g, '/'));
  code = code.replace(/href="#personal"/g, "href=\"/personal\"");
  code = code.replace(/href="#caja"/g, "href=\"/caja\"");
  code = code.replace(/href="#inventario"/g, "href=\"/inventario\"");
  code = code.replace(/href="#mesa"/g, "href=\"/mesa\"");
  code = code.replace(/href="#cocina"/g, "href=\"/cocina\"");
  
  // also handle the # link back to root
  code = code.replace(/href="#"/g, "href=\"/\"");
  
  fs.writeFileSync(file, code);
}
