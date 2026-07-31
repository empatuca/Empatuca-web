const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace('import Cocina from "./pages/Cocina";', 'import Cocina from "./pages/Cocina";\nimport StaffLogin from "./pages/StaffLogin";\nimport Caja from "./pages/Caja";\nimport Mesa from "./pages/Mesa";');
appCode = appCode.replace('if (currentHash === "#admin") {\n    return <Admin />;\n  }\n\n  if (currentHash === "#cocina") {\n    return <Cocina />;\n  }', 'if (currentHash === "#personal") {\n    return <StaffLogin />;\n  }\n  if (currentHash === "#mesa") {\n    return <Mesa />;\n  }\n  if (currentHash === "#caja") {\n    return <Caja />;\n  }\n  if (currentHash === "#cocina") {\n    return <Cocina />;\n  }');

fs.writeFileSync('src/App.tsx', appCode);

let footerCode = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');
footerCode = footerCode.replace('href="#cocina" className="hover:text-white transition-colors">Acceso Cocina</a>', 'href="#personal" className="hover:text-white transition-colors">Acceso Personal</a>');
fs.writeFileSync('src/components/layout/Footer.tsx', footerCode);
