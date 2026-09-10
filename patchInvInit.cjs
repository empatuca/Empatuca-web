const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const regex = /siteConfig\.menu\.forEach\(item => \{[\s\S]*?\}\);/m;

const replacement = `siteConfig.menu.forEach(item => {
        if (item.id === 'bandeja-crudas') return; // Do not add bandejas to inventory tracking
        if (item.prices.empatuca !== undefined) {
          init.push({ id: \`\${item.id}-empatuca\`, name: \`\${item.name} (Empatuca)\`, initialStock: 0, currentStock: 0 });
        }
        if (item.prices.empanita !== undefined) {
          init.push({ id: \`\${item.id}-empanita\`, name: \`\${item.name} (Empanita)\`, initialStock: 0, currentStock: 0 });
        }
        if (item.prices.estandar !== undefined) {
          if (item.variants) {
            item.variants.forEach(variant => {
              init.push({ id: \`\${item.id}-estandar-\${variant.id}\`, name: \`\${item.name.replace(/^[^\\w\\s]+/, '').trim()} - \${variant.name}\`, initialStock: 0, currentStock: 0 });
            });
          } else {
            init.push({ id: \`\${item.id}-estandar\`, name: item.name, initialStock: 0, currentStock: 0 });
          }
        }
      });`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/Inventario.tsx', code);
