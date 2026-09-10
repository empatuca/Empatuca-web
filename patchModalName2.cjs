const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const targetStr = "name: `${item.name.replace(/^[^\\w\\s]+/, '').trim()} - ${variant.name}`,";
const replacement = "name: item.name,";

code = code.replace(targetStr, replacement);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
