const fs = require('fs');

let content = fs.readFileSync('src/components/caja/CajaDashboard.tsx', 'utf8');

const target1 = `      if (cat.includes('Chris')) {
        chris += monto;
        countChris++;
      } else if (cat.includes('Evelyn')) {
        evelyn += monto;
        countEvelyn++;
      } else if (cat.includes('María')) {
        maria += monto;
        countMaria++;
      }`;

const replacement1 = `      if (cat.includes('Chris') || cat.includes('Socio 1')) {
        chris += monto;
        countChris++;
      } else if (cat.includes('Evelyn') || cat.includes('Socio 2')) {
        evelyn += monto;
        countEvelyn++;
      } else if (cat.includes('María') || cat.includes('Socio 3')) {
        maria += monto;
        countMaria++;
      }`;

content = content.replace(target1, replacement1);
fs.writeFileSync('src/components/caja/CajaDashboard.tsx', content, 'utf8');
console.log('done history patch');
