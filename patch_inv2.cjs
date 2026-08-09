const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const t1 = `<div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100">
          <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Producción del Día</h2>`;
          
const r1 = `{!showHistory ? (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8">
          <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Producción del Día</h2>`;

const t2 = `{closures.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8">
            <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Historial de Cierres</h2>`;
            
const r2 = `) : (
        closures.length > 0 ? (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8">
            <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Historial de Cierres</h2>`;

code = code.replace(t1, r1);
code = code.replace(t2, r2);

// And the end tag:
const t3 = `                  </div>
                ))}
            </div>
          </div>
        )}
      </div>`;

const r3 = `                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8 text-center text-gray-500 font-bold">No hay cierres registrados.</div>
        )
      )}
      </div>`;

code = code.replace(t3, r3);

fs.writeFileSync('src/pages/Inventario.tsx', code);
