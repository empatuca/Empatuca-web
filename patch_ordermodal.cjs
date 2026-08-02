const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

code = code.replace(
  '<span className="font-bold text-gray-800">{item.quantity}x</span> {item.name} {item.isVariant ? \'\' : `(${item.size})`}',
  '<span className="font-bold text-gray-800">{item.quantity}x</span> <span className="text-gray-900 font-bold">{item.name}</span> <span className="text-gray-500">{item.isVariant ? \'\' : `(${item.size})`}</span>'
);

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
