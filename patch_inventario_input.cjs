const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(/value=\{item\.initialStock\}/g, 'value={item.initialStock || \'\'}\n                               placeholder="0"');
code = code.replace(/parseInt\(e\.target\.value\) \|\| 0/g, 'e.target.value === \'\' ? 0 : parseInt(e.target.value)');

fs.writeFileSync('src/pages/Inventario.tsx', code);
