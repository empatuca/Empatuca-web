const fs = require('fs');

const files = [
  'src/components/layout/Navbar.tsx',
  'src/components/layout/Footer.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace <a href="#target"> with <a onClick={(e) => { e.preventDefault(); document.getElementById('target')?.scrollIntoView(); }} href="#target">
  code = code.replace(/<a href="#([^"]+)"([^>]*)>/g, "<a onClick={(e) => { e.preventDefault(); document.getElementById('$1')?.scrollIntoView(); }} href=\"#$1\"$2>");
  
  fs.writeFileSync(file, code);
}
