const fs = require('fs');

function fixHeader(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (file.includes('Mesa.tsx')) {
    code = code.replace(/<div className="flex items-center gap-4">\s*<h1 className="text-xl font-black uppercase tracking-tight">Mesa \(Meseros\)<\/h1>[\s\S]*?<\/div>\s*<div className="flex items-center gap-4">\s*<a href="\/personal"/, (match) => {
      return match.replace('<div className="flex items-center gap-4">', '<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">\n<h1 className="text-xl font-black uppercase tracking-tight leading-tight">Mesa <span className="text-sm text-gray-400 block sm:inline">(Meseros)</span></h1>')
                  .replace(/<h1 className="text-xl font-black uppercase tracking-tight">Mesa \(Meseros\)<\/h1>\s*/, '')
                  .replace(/<\/div>\s*<div className="flex items-center gap-4">\s*<a href="\/personal"/, '</div>\n<div className="flex flex-wrap items-center gap-2 sm:gap-4">\n<a href="/personal"');
    });
    
    // Move the button into the second div
    code = code.replace(/\{view === 'nuevo' \? \([\s\S]*?<\/button>\s*\)\}\s*<\/div>/, (match) => {
       return '</div>'; // delete from first div
    });
    
    // And insert before Roles
    code = code.replace(/<a href="\/personal" className="text-xs uppercase tracking-widest text-white\/60/, 
      `{view === 'nuevo' ? (
                <button onClick={() => { setView('pedidos'); setEditingOrder(null); }} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                   Ver Pedidos
                </button>
             ) : (
                <button onClick={() => { setEditingOrder(null); setView('nuevo'); }} className="bg-[#fac124] hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                   <PlusCircle className="w-4 h-4" /> Nuevo Pedido
                </button>
             )}\n<a href="/personal" className="text-xs uppercase tracking-widest text-white/60`);
             
  } else if (file.includes('Caja.tsx')) {
    code = code.replace(/\{!hasNotifPermission && \([\s\S]*?<\/button>\s*\)\}\s*<a href="\/inventario"[\s\S]*?<\/a>\s*<div className="flex items-center gap-4">/g, (match) => {
       return '<div className="flex flex-wrap items-center gap-2 sm:gap-4">\n' + match.replace('<div className="flex items-center gap-4">', '');
    });
    code = code.replace(/<a href="\/personal" className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-bold py-2 px-3 rounded hover:bg-red-500\/10" onClick=\{\(\) => \{[\s\S]*?\}\}>Salir<\/a>\s*<\/div>/g, (match) => {
       return match; // the closing div matches the opened one
    });
  } else if (file.includes('Cocina.tsx')) {
    code = code.replace(/\{!hasNotifPermission && \([\s\S]*?<\/button>\s*\)\}\s*<div className="flex items-center gap-4">/g, (match) => {
       return '<div className="flex flex-wrap items-center gap-2 sm:gap-4">\n' + match.replace('<div className="flex items-center gap-4">', '');
    });
  } else if (file.includes('Inventario.tsx')) {
     code = code.replace(/<a href="\/caja"[\s\S]*?<\/a>\s*<div className="flex items-center gap-4">/g, (match) => {
       return '<div className="flex flex-wrap items-center gap-2 sm:gap-4">\n' + match.replace('<div className="flex items-center gap-4">', '');
    });
  }
  
  fs.writeFileSync(file, code);
}

['src/pages/Mesa.tsx', 'src/pages/Caja.tsx', 'src/pages/Cocina.tsx', 'src/pages/Inventario.tsx'].forEach(fixHeader);

