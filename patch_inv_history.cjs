const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(
  "const [isSavingClosure, setIsSavingClosure] = useState(false);",
  "const [isSavingClosure, setIsSavingClosure] = useState(false);\n  const [showHistory, setShowHistory] = useState(false);"
);

const buttonsTarget = `<div className="flex items-center gap-4">
            <Button onClick={handleSaveClosure} disabled={isSavingClosure} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-xl">
              {isSavingClosure ? 'Guardando...' : 'Guardar Cierre'}
            </Button>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>`;
          
const buttonsReplacement = `<div className="flex flex-wrap justify-end items-center gap-4">
            <Button onClick={() => setShowHistory(!showHistory)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold h-12 px-6 rounded-xl">
              {showHistory ? 'Volver a Inventario' : 'Ver Historial de Cierres'}
            </Button>
            <Button onClick={handleSaveClosure} disabled={isSavingClosure} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-xl">
              {isSavingClosure ? 'Guardando...' : 'Guardar Cierre'}
            </Button>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>`;

code = code.replace(buttonsTarget, buttonsReplacement);

code = code.replace(
  `<div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100">
          <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Producción del Día</h2>`,
  `{!showHistory ? (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100">
          <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Producción del Día</h2>`
);

code = code.replace(
  `{closures.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8">
            <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Historial de Cierres</h2>`,
  `) : (
        closures.length > 0 ? (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-0">
            <h2 className="text-xl font-black mb-6 uppercase tracking-tight">Historial de Cierres</h2>`
);

code = code.replace(
  `                  </div>
                ))}
            </div>
          </div>
        )}`,
  `                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-0 text-center text-gray-500 font-bold">No hay cierres registrados.</div>
        )
        )}`
);

fs.writeFileSync('src/pages/Inventario.tsx', code);
