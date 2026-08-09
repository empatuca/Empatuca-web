const fs = require('fs');

const files = [
  'src/App.tsx',
  'src/pages/StaffLogin.tsx',
  'src/pages/Caja.tsx',
  'src/pages/Cocina.tsx',
  'src/pages/Inventario.tsx',
  'src/pages/Mesa.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/layout/Footer.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Replace <a> tags with href="/..." that do NOT have onClick already
  code = code.replace(/<a href="(\/[^"]+)"/g, (match, url) => {
    return `<a onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '${url}'); window.dispatchEvent(new Event('popstate')); }} href="${url}"`;
  });
  
  // Fix the double onClick issue if we just added it to an a tag that already had an onClick
  code = code.replace(/<a onClick=\{\(e\) => \{ e\.preventDefault\(\); window\.history\.pushState\(null, '', '(\/[^']+)'\); window\.dispatchEvent\(new Event\('popstate'\)\); \}\} href="(\/[^"]+)"(.*?)(onClick=\{\(\) => \{)/g,
    '<a href="$2"$3onClick={(e) => { e.preventDefault(); window.history.pushState(null, "", "$2"); window.dispatchEvent(new Event("popstate")); ');

  // Fix App.tsx assignment
  if (file === 'src/App.tsx') {
    code = code.replace(/window\.location\.pathname = '\/personal';/, "window.history.pushState(null, '', '/personal'); window.dispatchEvent(new Event('popstate'));");
  }
  
  // Fix StaffLogin.tsx assignments
  if (file === 'src/pages/StaffLogin.tsx') {
    code = code.replace(/window\.location\.href = '\/#([^']+)';/g, "window.history.pushState(null, '', '/$1'); window.dispatchEvent(new Event('popstate'));");
    code = code.replace(/window\.location\.hash = `\#\$\{selectedRole\}`;/g, "window.history.pushState(null, '', `/${selectedRole}`); window.dispatchEvent(new Event('popstate'));");
  }
  
  fs.writeFileSync(file, code);
}
