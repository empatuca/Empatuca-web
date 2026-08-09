const fs = require('fs');

const files = [
  'src/pages/Mesa.tsx',
  'src/pages/Caja.tsx',
  'src/pages/Cocina.tsx',
  'src/pages/Inventario.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Make header flex wrap and add spacing
  code = code.replace(/<div className="flex items-center justify-between container mx-auto">/g, 
    '<div className="flex flex-wrap items-center justify-between container mx-auto gap-y-3 gap-x-2">');
    
  // Also give Roles and Salir buttons a bit more padding
  code = code.replace(/<a href="\/personal" className="text-xs uppercase tracking-widest text-white\/60 hover:text-white transition-colors font-bold"/g, 
    '<a href="/personal" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors font-bold py-2 px-3 rounded hover:bg-white/5"');
  code = code.replace(/<a href="\/personal" className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-bold"/g, 
    '<a href="/personal" className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-bold py-2 px-3 rounded hover:bg-red-500/10"');
    
  fs.writeFileSync(file, code);
}
