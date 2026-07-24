const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import Admin from "./pages/Admin";')) {
  code = code.replace('import Cocina from "./pages/Cocina";', 'import Cocina from "./pages/Cocina";\nimport Admin from "./pages/Admin";');
  code = code.replace('if (currentHash === "#cocina") {', 'if (currentHash === "#admin") {\n    return <Admin />;\n  }\n\n  if (currentHash === "#cocina") {');
  fs.writeFileSync('src/App.tsx', code);
}
