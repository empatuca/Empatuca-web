const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const regex = /name: \`\$\{item\.name\.replace\(\/\^\[\^\\\\w\\\\s\]\+\/, ''\)\.trim\(\)\} - \$\{variant\.name\}\`/g;
const replacement = "name: item.name";

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
