const fs = require('fs');
let code = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

// replace `product.name` with `\`\${product.name} (\${product.category.replace('Empanadas de ', '')})\`` inside the map for updateQuantity

const regex = /updateQuantity\(`\$\{product\.id\}-([^`]+)`, product\.name, "([^"]+)", product\.prices\.([^,]+), (-?1)\)/g;

code = code.replace(regex, 'updateQuantity(`\${product.id}-$1`, `\${product.name} (\${product.category.replace(\'Empanadas de \', \'\')})`, "$2", product.prices.$3, $4)');

fs.writeFileSync('src/components/home/WaitersPOS.tsx', code);
