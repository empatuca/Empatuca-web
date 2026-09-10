const fs = require('fs');
let code = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

const regex = /updateQuantity\(\`\$\{product\.id\}-estandar-\$\{variant\.id\}\`,\s*\`\$\{product\.name\} \(\$\{variant\.name\}\)\`,\s*"Unidad"/g;
const replacement = "updateQuantity(`${product.id}-estandar-${variant.id}`, `${product.name}`, variant.name";

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/home/WaitersPOS.tsx', code);
