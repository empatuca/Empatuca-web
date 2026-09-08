const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

const renderTimeTarget = `{new Date(gasto.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
const renderTimeReplacement = `{gasto.created_at && !isNaN(new Date(gasto.created_at).getTime()) ? new Date(gasto.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}`;
code = code.replace(renderTimeTarget, renderTimeReplacement);

fs.writeFileSync('src/pages/Caja.tsx', code);
console.log("Patched Caja.tsx for render time error.");
