const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const regex1 = /prods\.forEach\(\(p: any\) => \{\s*soldMap\[p\.id\] = \(soldMap\[p\.id\] \|\| 0\) \+ p\.quantity;\s*\}\);/g;

const replacement1 = `prods.forEach((p: any) => {
          if (p.id === 'bandeja-crudas-estandar-queso') {
             soldMap['ev-queso-empanita'] = (soldMap['ev-queso-empanita'] || 0) + (p.quantity * 4);
          } else if (p.id === 'bandeja-crudas-estandar-carne') {
             soldMap['ev-carne-empanita'] = (soldMap['ev-carne-empanita'] || 0) + (p.quantity * 4);
          } else if (p.id === 'bandeja-crudas-estandar-pollo') {
             soldMap['ev-pollo-empanita'] = (soldMap['ev-pollo-empanita'] || 0) + (p.quantity * 4);
          } else if (p.id === 'bandeja-crudas-estandar-mixtas') {
             soldMap['ev-queso-empanita'] = (soldMap['ev-queso-empanita'] || 0) + (p.quantity * 2);
             soldMap['ev-carne-empanita'] = (soldMap['ev-carne-empanita'] || 0) + (p.quantity * 1);
             soldMap['ev-pollo-empanita'] = (soldMap['ev-pollo-empanita'] || 0) + (p.quantity * 1);
          } else {
             soldMap[p.id] = (soldMap[p.id] || 0) + p.quantity;
          }
        });`;

code = code.replace(regex1, replacement1);
fs.writeFileSync('src/pages/Inventario.tsx', code);
