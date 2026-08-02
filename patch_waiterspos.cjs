const fs = require('fs');
let code = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

// The rendering of item.name:
code = code.replace(
  '{item.name} <span className="text-xs text-gray-400">({item.size})</span>',
  '<span className="text-gray-900 font-bold">{item.name}</span> <span className="text-xs text-gray-400">({item.size})</span>'
);

fs.writeFileSync('src/components/home/WaitersPOS.tsx', code);
