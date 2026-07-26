const fs = require('fs');
let code = fs.readFileSync('siteConfig.ts', 'utf8');

// Eliminar yogurt
code = code.replace(/    \{\s*id: "beb-yogurt",[\s\S]*?\]\s*\},/g, '');

// Cambiar precio de café de 0.75 a 0.50
code = code.replace(/      id: "beb-cafe",\s*name: "☕ Café Americano",\s*category: "Bebidas",\s*description: "Café calientito, ideal para acompañar tus empanadas.",\s*prices: \{\s*estandar: 0.75,\s*\},/g, `      id: "beb-cafe",
      name: "☕ Café Americano",
      category: "Bebidas",
      description: "Café calientito, ideal para acompañar tus empanadas.",
      prices: {
        estandar: 0.50,
      },`);

fs.writeFileSync('siteConfig.ts', code);
