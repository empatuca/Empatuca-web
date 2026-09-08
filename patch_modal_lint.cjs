const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

code = code.replace(
  'variantImage: variant.image',
  'variantImage: (variant as any).image'
);

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
console.log("Patched modal lint");
