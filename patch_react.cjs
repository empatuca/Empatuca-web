const fs = require('fs');
['src/pages/Admin.tsx', 'src/pages/Cocina.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes("import React")) {
    code = code.replace(/import { useState/, "import React, { useState");
    fs.writeFileSync(file, code);
  }
});
