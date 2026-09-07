const fs = require('fs');
let code = fs.readFileSync('siteConfig.ts', 'utf8');

const target = `    {
      id: "beb-gaseosa",`;

const replace = `    {
      id: "beb-gaseosa-familiar",
      name: "🥤 Cola Familiar",
      category: "Bebidas",
      description: "Gaseosa familiar helada para compartir.",
      prices: {
        estandar: 1.25,
      },
    },
    {
      id: "beb-gaseosa",`;

code = code.replace(target, replace);
fs.writeFileSync('siteConfig.ts', code);
