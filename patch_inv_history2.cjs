const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

code = code.replace(
  ".from('cierres_diarios')\\n          .select('*')",
  ".from('cierres_diarios')\\n          .select('*')\\n          .neq('id', '00000000-0000-0000-0000-000000000000')"
);

code = code.replace(
  "const { data } = await supabase.from('cierres_diarios').select('*').order('fecha', { ascending: false });",
  "const { data } = await supabase.from('cierres_diarios').select('*').neq('id', '00000000-0000-0000-0000-000000000000').order('fecha', { ascending: false });"
);

fs.writeFileSync('src/pages/Inventario.tsx', code);
