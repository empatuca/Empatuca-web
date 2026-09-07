const fs = require('fs');
let code = fs.readFileSync('siteConfig.ts', 'utf8');
code = code.replace('hours: "Lunes a domingo, 9:00 am – 9:00 pm"', 'hours: "Todos los días menos martes, 4:30 pm – 10:30 pm"');
fs.writeFileSync('siteConfig.ts', code);
