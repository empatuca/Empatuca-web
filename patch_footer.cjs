const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');

code = code.replace(/<a onClick=\{\(e\) => \{ e\.preventDefault\(\); document\.getElementById\('personal'\)\?\.scrollIntoView\(\); \}\} href="#personal" className="hover:text-white transition-colors">Acceso Personal<\/a>/g, 
  '<a href="/personal" className="hover:text-white transition-colors">Acceso Personal</a>');

fs.writeFileSync('src/components/layout/Footer.tsx', code);
