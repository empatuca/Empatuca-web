const fs = require('fs');

const files = [
  'src/pages/Mesa.tsx',
  'src/pages/Caja.tsx',
  'src/pages/Cocina.tsx',
  'src/pages/Inventario.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Add text-gray-900 to the root div of each staff page if not already there
  code = code.replace(/className="min-h-screen([^"]*)"/g, 'className="min-h-screen$1 text-gray-900"');
  code = code.replace(/<td className="py-3 font-bold">/g, '<td className="py-3 font-bold text-gray-900">');
  
  fs.writeFileSync(file, code);
}
