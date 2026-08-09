const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

code = code.replace(/<td className="py-3 font-bold text-gray-900">/g, '<td className="py-3 font-black text-black">');
code = code.replace(/<td className="py-3 text-gray-600">/g, '<td className="py-3 font-bold text-gray-800">');
code = code.replace(/<td className="py-3 font-bold text-green-700">/g, '<td className="py-3 font-black text-green-700">');

fs.writeFileSync('src/pages/Caja.tsx', code);
