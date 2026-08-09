const fs = require('fs');
let code = fs.readFileSync('src/pages/Cocina.tsx', 'utf8');

code = code.replace(/<div className="flex items-center justify-between">/, '<div className="flex flex-wrap items-center justify-between container mx-auto gap-y-3 gap-x-2">');

code = code.replace(/<div className="flex items-center gap-4">\s*<a href="\/personal"/, '<div className="flex flex-wrap items-center gap-2 sm:gap-4">\n<a href="/personal"');

fs.writeFileSync('src/pages/Cocina.tsx', code);
