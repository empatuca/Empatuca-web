const fs = require('fs');

function patch(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/<a href="\/"/g, `<a onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/'); window.dispatchEvent(new Event('popstate')); }} href="/"`);
  fs.writeFileSync(file, code);
}

patch('src/components/layout/Navbar.tsx');
patch('src/pages/StaffLogin.tsx');

