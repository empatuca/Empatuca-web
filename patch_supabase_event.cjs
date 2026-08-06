const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

code = code.replace(
  'localListeners.forEach(listener => listener([...localOrders]));',
  'localListeners.forEach(listener => listener([...localOrders]));\n  window.dispatchEvent(new Event("localOrdersUpdated"));'
);

fs.writeFileSync('src/lib/supabase.ts', code);
