const fs = require('fs');
let code = fs.readFileSync('src/pages/Mesa.tsx', 'utf8');

code = code.replace(
  '<a href="#personal" className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors" onClick={() => {\n            localStorage.removeItem(\'empatuca_staff_auth\');\n            localStorage.removeItem(\'empatuca_staff_role\');\n            sessionStorage.removeItem(\'empatuca_staff_auth\');\n          }}>Salir</a>',
  `<div className="flex items-center gap-4">
            <a href="#personal" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors font-bold">Roles</a>
            <a href="#personal" className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors font-bold" onClick={() => {
              localStorage.removeItem('empatuca_staff_auth');
              localStorage.removeItem('empatuca_staff_role');
              sessionStorage.removeItem('empatuca_staff_auth');
            }}>Salir</a>
          </div>`
);

fs.writeFileSync('src/pages/Mesa.tsx', code);
