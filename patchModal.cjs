const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const regex = /size: "Estándar",\s*price: item\.prices\.estandar \|\| 0,\s*quantity: \(isInitial && vIdx === 0\) \? 1 : 0,\s*isVariant: true/g;

const replacement = `size: variant.name,
                price: item.prices.estandar || 0,
                quantity: (isInitial && vIdx === 0) ? 1 : 0,
                isVariant: true`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
