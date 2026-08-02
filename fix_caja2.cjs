const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

code = code.replace(
  'import { Trash2 } from "lucide-react";',
  'import { Trash2, Package } from "lucide-react";'
);

fs.writeFileSync('src/pages/Caja.tsx', code);
