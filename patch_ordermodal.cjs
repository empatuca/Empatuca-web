const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldCode1 = `      if (initialProduct.prices.empatuca) {
        newItems.push({
          id: \`\${initialProduct.id}-empatuca\`,
          name: initialProduct.name,
          size: "Empatuca",
          price: initialProduct.prices.empatuca,
          quantity: 1
        });
      }
      
      if (initialProduct.prices.empanita) {
        newItems.push({
          id: \`\${initialProduct.id}-empanita\`,
          name: initialProduct.name,
          size: "Empanita",
          price: initialProduct.prices.empanita,
          quantity: 0
        });
      }

      if (!initialProduct.prices.empatuca && initialProduct.prices.estandar) {
        newItems.push({
          id: \`\${initialProduct.id}-estandar\`,
          name: initialProduct.name,
          size: "Estándar",
          price: initialProduct.prices.estandar,
          quantity: 1
        });
      }`;

const newCode1 = `      const getFormattedName = (item: any) => {
        if (item.category?.includes('Verde')) return \`\${item.name} (Verde)\`;
        if (item.category?.includes('Harina')) return \`\${item.name} (Harina)\`;
        return item.name;
      };

      if (initialProduct.prices.empatuca) {
        newItems.push({
          id: \`\${initialProduct.id}-empatuca\`,
          name: getFormattedName(initialProduct),
          size: "Empatuca",
          price: initialProduct.prices.empatuca,
          quantity: 1
        });
      }
      
      if (initialProduct.prices.empanita) {
        newItems.push({
          id: \`\${initialProduct.id}-empanita\`,
          name: getFormattedName(initialProduct),
          size: "Empanita",
          price: initialProduct.prices.empanita,
          quantity: 0
        });
      }

      if (!initialProduct.prices.empatuca && initialProduct.prices.estandar) {
        newItems.push({
          id: \`\${initialProduct.id}-estandar\`,
          name: getFormattedName(initialProduct),
          size: "Estándar",
          price: initialProduct.prices.estandar,
          quantity: 1
        });
      }`;

code = code.replace(oldCode1, newCode1);

const oldCode2 = `              newItems.push({
                id: \`\${item.id}-empatuca\`,
                name: item.name,
                size: "Empatuca",
                price: item.prices.empatuca,
                quantity: 0
              });
            }
            if (item.prices.empanita) {
              newItems.push({
                id: \`\${item.id}-empanita\`,
                name: item.name,
                size: "Empanita",
                price: item.prices.empanita,
                quantity: 0
              });
            }`;

const newCode2 = `              newItems.push({
                id: \`\${item.id}-empatuca\`,
                name: getFormattedName(item),
                size: "Empatuca",
                price: item.prices.empatuca,
                quantity: 0
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
            }`;

code = code.replace(oldCode2, newCode2);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
