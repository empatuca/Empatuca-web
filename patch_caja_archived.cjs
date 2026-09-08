const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

// 1. Fix Daily Ingresos query
const dailyTarget = `        // 2. Fetch Ingresos for selected date
        const { data: ingresosData } = await supabase
          .from('pedidos')
          .select('total')
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .not('estado', 'in', '("cancelado","rechazado","archivado")');`;

const dailyReplacement = `        // 2. Fetch Ingresos for selected date
        const { data: ingresosData } = await supabase
          .from('pedidos')
          .select('total')
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .not('estado', 'in', '("cancelado","rechazado")'); // Include archivado as valid income`;
          
code = code.replace(dailyTarget, dailyReplacement);

// 2. Fix Global Balance query
const globalTarget = `        // 3. Fetch Global Balance (from Sept 1 + 336.25 base)
        const septStart = '2026-09-01T00:00:00Z';
        const { data: globalPedidos } = await supabase
          .from('pedidos')
          .select('total')
          .gte('created_at', septStart)
          .not('estado', 'in', '("cancelado","rechazado","archivado")');`;

const globalReplacement = `        // 3. Fetch Global Balance (from Sept 1 + 336.25 base)
        const septStart = '2026-09-01T05:00:00Z'; // 00:00 in UTC-5 (Ecuador)
        const { data: globalPedidos } = await supabase
          .from('pedidos')
          .select('total')
          .gte('created_at', septStart)
          .not('estado', 'in', '("cancelado","rechazado")'); // Include archivado`;

code = code.replace(globalTarget, globalReplacement);

fs.writeFileSync('src/pages/Caja.tsx', code);
console.log("Patched Caja.tsx to include archived and fix timezone cutoff.");
