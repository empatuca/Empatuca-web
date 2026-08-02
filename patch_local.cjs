const fs = require('fs');
let posCode = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

posCode = posCode.replace(
  `      localOrders.push({
        id: Math.random().toString(36).substr(2, 9),
        ...orderData,
        created_at: new Date().toISOString()
      });`,
  `      if (initialOrder) {
        const idx = localOrders.findIndex(o => o.id === initialOrder.id);
        if (idx > -1) {
          localOrders[idx] = { ...localOrders[idx], ...orderData };
        }
      } else {
        localOrders.push({
          id: Math.random().toString(36).substr(2, 9),
          ...orderData,
          created_at: new Date().toISOString()
        });
      }`
);

fs.writeFileSync('src/components/home/WaitersPOS.tsx', posCode);
