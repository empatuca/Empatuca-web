const fs = require('fs');

let content = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const target = `          } else if (p.id === 'bandeja-crudas-estandar-mixtas') {
             soldMap['ev-queso-empanita'] = (soldMap['ev-queso-empanita'] || 0) + (p.quantity * 2);
             soldMap['ev-carne-empanita'] = (soldMap['ev-carne-empanita'] || 0) + (p.quantity * 1);
             soldMap['ev-pollo-empanita'] = (soldMap['ev-pollo-empanita'] || 0) + (p.quantity * 1);`;

const replacement = `          } else if (p.id?.startsWith('bandeja-crudas-estandar-mixtas')) {
             if (p.mixDetails) {
                 soldMap['ev-queso-empanita'] = (soldMap['ev-queso-empanita'] || 0) + (p.quantity * (p.mixDetails.queso || 0));
                 soldMap['ev-carne-empanita'] = (soldMap['ev-carne-empanita'] || 0) + (p.quantity * (p.mixDetails.carne || 0));
                 soldMap['ev-pollo-empanita'] = (soldMap['ev-pollo-empanita'] || 0) + (p.quantity * (p.mixDetails.pollo || 0));
             } else {
                 soldMap['ev-queso-empanita'] = (soldMap['ev-queso-empanita'] || 0) + (p.quantity * 2);
                 soldMap['ev-carne-empanita'] = (soldMap['ev-carne-empanita'] || 0) + (p.quantity * 1);
                 soldMap['ev-pollo-empanita'] = (soldMap['ev-pollo-empanita'] || 0) + (p.quantity * 1);
             }`;

content = content.split(target).join(replacement);

fs.writeFileSync('src/pages/Inventario.tsx', content, 'utf8');
console.log('done');
