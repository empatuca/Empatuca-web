const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const replacement = `<div className="flex flex-wrap justify-end items-center gap-4">
            <Button onClick={() => setShowHistory(!showHistory)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold h-12 px-6 rounded-xl">
              {showHistory ? 'Volver a Inventario' : 'Ver Historial'}
            </Button>
            <Button onClick={handleSaveClosure} disabled={isSavingClosure} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-xl">
              {isSavingClosure ? 'Guardando...' : 'Guardar Cierre'}
            </Button>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>`;

code = code.replace(/<div className="flex items-center gap-4">\s*<Button onClick={handleSaveClosure}[^>]*>\s*\{isSavingClosure \? 'Guardando\.\.\.' : 'Guardar Cierre'\}\s*<\/Button>\s*<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">\s*<DollarSign className="w-8 h-8 text-green-600" \/>\s*<\/div>\s*<\/div>/, replacement);

fs.writeFileSync('src/pages/Inventario.tsx', code);
