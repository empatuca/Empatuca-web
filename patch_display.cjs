const fs = require('fs');

const files = [
  'src/pages/Caja.tsx',
  'src/pages/Cocina.tsx',
  'src/pages/Mesa.tsx',
  'src/pages/Inventario.tsx',
  'src/components/home/WaitersPOS.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    // Inject import if not present
    if (code.includes('numero_pedido') && !code.includes('formatOrderNumber')) {
       let relativePath = '../../lib/utils';
       if (file.includes('src/pages')) relativePath = '../lib/utils';
       const lastImport = code.lastIndexOf('import ');
       const endOfLastImport = code.indexOf('\n', lastImport);
       code = code.slice(0, endOfLastImport) + '\nimport { formatOrderNumber } from "' + relativePath + '";' + code.slice(endOfLastImport);
    }

    // Replace display formats
    code = code.replace(/#\{order\.numero_pedido\}/g, '#{formatOrderNumber(order.numero_pedido)}');
    code = code.replace(/#\{pedido\.numero_pedido\}/g, '#{formatOrderNumber(pedido.numero_pedido)}');
    code = code.replace(/#\{confirmOrder\.numero_pedido\}/g, '#{formatOrderNumber(confirmOrder.numero_pedido)}');
    code = code.replace(/#\{order\.numero_pedido \|\| 'N\/A'\}/g, '#{formatOrderNumber(order.numero_pedido)}');

    fs.writeFileSync(file, code);
  }
});
