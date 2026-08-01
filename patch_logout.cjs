const fs = require('fs');

const logoutFunction = `onClick={() => {
            localStorage.removeItem('empatuca_staff_auth');
            localStorage.removeItem('empatuca_staff_role');
            sessionStorage.removeItem('empatuca_staff_auth');
          }}`;

const replaceLogout = (file) => {
  let code = fs.readFileSync(file, 'utf8');
  // Caja and Mesa
  code = code.replace(
    '<a href="#personal" className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">Salir</a>',
    `<a href="#personal" className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors" ${logoutFunction}>Salir</a>`
  );
  code = code.replace(
    '<a href="#personal" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors">Salir</a>',
    `<a href="#personal" className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors" ${logoutFunction}>Salir</a>`
  );
  
  // Cocina
  code = code.replace(
    '<a href="#personal" className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">SALIR</a>',
    `<a href="#personal" className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors" ${logoutFunction}>SALIR</a>`
  );
  code = code.replace(
    '<a href="#personal" className="text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">SALIR</a>',
    `<a href="#personal" className="text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors" ${logoutFunction}>SALIR</a>`
  );
  fs.writeFileSync(file, code);
}

replaceLogout('src/pages/Mesa.tsx');
replaceLogout('src/pages/Caja.tsx');
replaceLogout('src/pages/Cocina.tsx');
