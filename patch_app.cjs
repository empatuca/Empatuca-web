const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'import Cocina from "./pages/Cocina";',
  'import Cocina from "./pages/Cocina";\nimport Inventario from "./pages/Inventario";'
);

code = code.replace(
  'const isStaffRoute = ["#mesa", "#caja", "#cocina"].includes(currentHash);',
  'const isStaffRoute = ["#mesa", "#caja", "#cocina", "#inventario"].includes(currentHash);'
);

code = code.replace(
  'if (currentHash === "#cocina") return <Cocina />;',
  'if (currentHash === "#cocina") return <Cocina />;\n    if (currentHash === "#inventario") return <Inventario />;'
);

code = code.replace(
  'if (window.location.hash && ![\'#mesa\', \'#caja\', \'#cocina\', \'#personal\'].includes(window.location.hash)) {',
  'if (window.location.hash && ![\'#mesa\', \'#caja\', \'#cocina\', \'#personal\', \'#inventario\'].includes(window.location.hash)) {'
);

fs.writeFileSync('src/App.tsx', code);
