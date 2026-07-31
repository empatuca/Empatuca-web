const fs = require('fs');
let code = fs.readFileSync('src/components/ui/input.tsx', 'utf8');

code = code.replace(
  'bg-transparent',
  'bg-white text-gray-900'
);

code = code.replace(
  'file:bg-transparent',
  'file:bg-transparent'
); // keep this if matched

fs.writeFileSync('src/components/ui/input.tsx', code);
