const fs = require('fs');
let code = fs.readFileSync('siteConfig.ts', 'utf8');

const coffeeStr = `    {
      id: "beb-cafe",
      name: "☕ Café Americano",
      category: "Bebidas",
      description: "Café calientito, ideal para acompañar tus empanadas.",
      prices: {
        estandar: 0.75,
      },
    },
    {
      id: "beb-mora",`;

code = code.replace(/\{\s*id: "beb-mora",/, coffeeStr);
fs.writeFileSync('siteConfig.ts', code);
