const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(
  '<a href="#caja" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors flex items-center gap-1">\n             <ArrowLeft className="w-3 h-3" /> Volver a Caja\n          </a>',
  `<div className="flex items-center gap-4">
            <a href="#caja" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors flex items-center gap-1">
               <ArrowLeft className="w-3 h-3" /> Caja
            </a>
            <a href="#personal" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors font-bold">Roles</a>
            <a href="#personal" className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-bold" onClick={() => {
              localStorage.removeItem('empatuca_staff_auth');
              localStorage.removeItem('empatuca_staff_role');
              sessionStorage.removeItem('empatuca_staff_auth');
            }}>Salir</a>
          </div>`
);

fs.writeFileSync('src/pages/Inventario.tsx', code);
