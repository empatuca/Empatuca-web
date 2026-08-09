const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(
  /<div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100">\s*<h2 className="text-xl font-black mb-6 uppercase tracking-tight">Producción del Día<\/h2>/,
  `{!showHistory ? (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100">
           <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Producción del Día</h2>`
);

code = code.replace(
  /\{closures\.length > 0 && \(\s*<div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8">\s*<h2 className="text-xl font-black mb-6 uppercase tracking-tight">Historial de Cierres<\/h2>/,
  `) : (
        closures.length > 0 ? (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8">
             <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Historial de Cierres</h2>`
);

code = code.replace(
  /                  <\/div>\s*\}\)\}\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*\);\s*\}\s*$/,
  `                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8 text-center text-gray-500 font-bold">No hay cierres registrados.</div>
        )
      )}
      </div>
    </div>
  );
}`
);

fs.writeFileSync('src/pages/Inventario.tsx', code);
