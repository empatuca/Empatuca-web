const fs = require('fs');

const fixImports = (file) => {
  let code = fs.readFileSync(file, 'utf8');
  // Just remove all instances of the import, then add it once.
  code = code.replace(/import \{ supabase, localOrders, notifyLocalListeners \} from "\.\.\/lib\/supabase";\n?/g, '');
  code = code.replace('import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport { supabase, localOrders, notifyLocalListeners } from "../lib/supabase";');
  fs.writeFileSync(file, code);
}

fixImports('src/pages/Mesa.tsx');
fixImports('src/pages/Caja.tsx');
