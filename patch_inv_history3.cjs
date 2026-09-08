const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(
  "const { data, error } = await supabase\\n          .from('cierres_diarios')\\n          .select('*')\\n          .order('fecha', { ascending: false });",
  "const { data, error } = await supabase\\n          .from('cierres_diarios')\\n          .select('*')\\n          .neq('id', '00000000-0000-0000-0000-000000000000')\\n          .order('fecha', { ascending: false });"
);

fs.writeFileSync('src/pages/Inventario.tsx', code);
