const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

// Replace initialization in useEffect
const oldInit = `      siteConfig.menu.filter(item => item.category === 'Bebidas').forEach(drink => {
        if (drink.id !== initialProduct.id) {
          if (drink.variants) {
            drink.variants.forEach(variant => {
              newItems.push({
                id: \`\${drink.id}-estandar-\${variant.id}\`,
                name: \`\${drink.name.replace('🥤', '').trim()} - \${variant.name}\`,
                size: "Estándar",
                price: drink.prices.estandar || 0,
                quantity: 0,
                isVariant: true,
                baseId: drink.id,
                variantImage: variant.image
              });
            });
          } else {
            newItems.push({
              id: \`\${drink.id}-estandar\`,
              name: drink.name,
              size: "Estándar",
              price: drink.prices.estandar || 0,
              quantity: 0
            });
          }
        }
      });`;

const newInit = `      siteConfig.menu.forEach(item => {
        if (item.id !== initialProduct.id) {
          if (item.category.includes('Empanadas')) {
            if (item.prices.empatuca) {
              newItems.push({
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
            }
          } else if (item.category === 'Bebidas') {
            if (item.variants) {
              item.variants.forEach(variant => {
                newItems.push({
                  id: \`\${item.id}-estandar-\${variant.id}\`,
                  name: \`\${item.name.replace('🥤', '').trim()} - \${variant.name}\`,
                  size: "Estándar",
                  price: item.prices.estandar || 0,
                  quantity: 0,
                  isVariant: true,
                  baseId: item.id,
                  variantImage: variant.image
                });
              });
            } else {
              newItems.push({
                id: \`\${item.id}-estandar\`,
                name: item.name,
                size: "Estándar",
                price: item.prices.estandar || 0,
                quantity: 0
              });
            }
          }
        }
      });`;

code = code.replace(oldInit, newInit);

const isInitialDrinkLine = "  const isInitialDrink = initialProduct?.category === 'Bebidas';\n";

if (!code.includes("const isInitialDrink")) {
    code = code.replace(/  const handleNext = \(\) => {/, isInitialDrinkLine + "  const handleNext = () => {");
}

const oldStep2Title = `<h3 className="font-bold text-lg mb-4 text-[#0D0D0D] border-b pb-2">¿Deseas acompañar con una bebida?</h3>`;
const newStep2Title = `<h3 className="font-bold text-lg mb-4 text-[#0D0D0D] border-b pb-2">{isInitialDrink ? '¿Deseas acompañar con unas empanadas?' : '¿Deseas acompañar con una bebida?'}</h3>`;
code = code.replace(oldStep2Title, newStep2Title);

const oldStep2Map = `{siteConfig.menu.filter(item => item.category === 'Bebidas' && item.id !== initialProduct?.id).map((drink) => {`;
const newStep2Map = `{siteConfig.menu.filter(item => (isInitialDrink ? item.category.includes('Empanadas') : item.category === 'Bebidas') && item.id !== initialProduct?.id).map((drink) => {`;
code = code.replace(oldStep2Map, newStep2Map);

const oldStep2Body = `                      const drinkQuantity = drink.variants 
                        ? items.filter(i => i.baseId === drink.id).reduce((sum, i) => sum + i.quantity, 0)
                        : (items.find(i => i.id === \`\${drink.id}-estandar\`))?.quantity || 0;`;

// Oh wait, my oldStep2Body string didn't match perfectly. Let's do it differently.
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
