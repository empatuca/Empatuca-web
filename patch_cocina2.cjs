const fs = require('fs');
let code = fs.readFileSync('src/pages/Cocina.tsx', 'utf8');

code = code.replace(
  '<a href="#" className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">← Volver al sitio</a>',
  `<div className="flex items-center gap-4">
            <a href="#personal" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors font-bold">Roles</a>
            <a href="#personal" className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-bold" onClick={() => {
              localStorage.removeItem('empatuca_staff_auth');
              localStorage.removeItem('empatuca_staff_role');
              sessionStorage.removeItem('empatuca_staff_auth');
            }}>Salir</a>
          </div>`
);

fs.writeFileSync('src/pages/Cocina.tsx', code);
