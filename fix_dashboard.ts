const fs = require('fs');

let content = fs.readFileSync('src/components/caja/CajaDashboard.tsx', 'utf8');

content = content.replace(/Socio 1/g, 'Chris');
content = content.replace(/Socio 2/g, 'Evelyn');
content = content.replace(/Socio 3/g, 'María');

content = content.replace(/socio1/g, 'chris');
content = content.replace(/socio2/g, 'evelyn');
content = content.replace(/socio3/g, 'maria');

content = content.replace(/countSocio1/g, 'countChris');
content = content.replace(/countSocio2/g, 'countEvelyn');
content = content.replace(/countSocio3/g, 'countMaria');

fs.writeFileSync('src/components/caja/CajaDashboard.tsx', content, 'utf8');
console.log('done');
