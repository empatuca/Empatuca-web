const fs = require('fs');

const files = [
  'src/pages/Mesa.tsx',
  'src/pages/Caja.tsx',
  'src/pages/Cocina.tsx',
  'src/pages/Inventario.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Make gap bigger on mobile (gap-3 sm:gap-6)
  code = code.replace(/className="flex flex-wrap items-center gap-2 sm:gap-4"/g, 'className="flex flex-wrap items-center gap-3 sm:gap-6"');
  
  // Give Roles and Salir more structure and spacing
  code = code.replace(/<a href="\/personal" className="text-xs uppercase tracking-widest text-white\/60 hover:text-white transition-colors font-bold py-2 px-3 rounded hover:bg-white\/5">Roles<\/a>/g, 
    '<a href="/personal" className="text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors font-black py-2 px-4 rounded-xl border border-white/10 hover:bg-white/10">Roles</a>');
  code = code.replace(/<a href="\/personal" className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-bold py-2 px-3 rounded hover:bg-red-500\/10"/g, 
    '<a href="/personal" className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-black py-2 px-4 rounded-xl border border-red-500/20 hover:bg-red-500/10"');
    
  fs.writeFileSync(file, code);
}
