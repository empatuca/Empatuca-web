const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(/const today = new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\];/g, 
  "const now = new Date();\n    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];");

fs.writeFileSync('src/pages/Inventario.tsx', code);
