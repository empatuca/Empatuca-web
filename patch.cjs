const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const regex = /if \(initialProduct\.prices\.empatuca\) \{[\s\S]*?setItems\(newItems\);/m;

const replacement = `      siteConfig.menu.forEach(item => {
        const isInitial = item.id === initialProduct.id;
        
        if (item.category.includes('Empanadas')) {
          if (item.prices.empatuca) {
            newItems.push({
              id: \`\${item.id}-empatuca\`,
              name: getFormattedName(item),
              size: "Empatuca",
              price: item.prices.empatuca,
              quantity: isInitial ? 1 : 0
            });
          }
          if (item.prices.empanita) {
            newItems.push({
              id: \`\${item.id}-empanita\`,
              name: getFormattedName(item),
              size: "Empanita",
              price: item.prices.empanita,
              quantity: 0
            });
          }
        } else {
          // Beverages and others like Crudas
          if (item.variants) {
            item.variants.forEach((variant, vIdx) => {
              newItems.push({
                id: \`\${item.id}-estandar-\${variant.id}\`,
                name: \`\${item.name.replace(/^[^\\w\\s]+/, '').trim()} - \${variant.name}\`,
                size: "Estándar",
                price: item.prices.estandar || 0,
                quantity: (isInitial && vIdx === 0) ? 1 : 0,
                isVariant: true,
                baseId: item.id,
                variantImage: (variant).image
              });
            });
          } else if (item.prices.estandar) {
            newItems.push({
              id: \`\${item.id}-estandar\`,
              name: item.name,
              size: "Estándar",
              price: item.prices.estandar || 0,
              quantity: isInitial ? 1 : 0
            });
          }
        }
      });

      setItems(newItems);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
