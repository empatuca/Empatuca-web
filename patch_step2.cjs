const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

code = code.replace(
  "{isInitialDrink ? '¿Deseas acompañar con unas empanadas?' : '¿Deseas acompañar con una bebida?'}",
  "{'¿Deseas agregar algo más del menú?'}"
);

code = code.replace(
  "{siteConfig.menu.filter(item => (isInitialDrink ? item.category.includes('Empanadas') : item.category === 'Bebidas') && item.id !== initialProduct?.id).map((drink) => {",
  "{siteConfig.menu.filter(item => item.id !== initialProduct?.id).map((drink) => {"
);

code = code.replace(
  "if (isInitialDrink) {",
  "if (drink.category.includes('Empanadas')) {"
);

code = code.replace(
  /<span className="font-bold text-gray-800">\{drink.name\}<\/span>/,
  '<span className="font-bold text-gray-800">{drink.name} {drink.category.includes(\'Verde\') ? \'(Verde)\' : \'(Harina)\'}</span>'
);

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
