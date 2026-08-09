const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(/<div className="flex items-center gap-4">\s*<a href="\/caja"/, '<div className="flex flex-wrap items-center gap-2 sm:gap-4">\n<a href="/caja"');

fs.writeFileSync('src/pages/Inventario.tsx', code);
