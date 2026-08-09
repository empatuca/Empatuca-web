const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const replacement = `const handleUpdateInitial = (id: string, value: number) => {
    const soldMap: Record<string, number> = {};
    todayOrders.forEach(order => {
      if (order.estado === 'rechazado' || order.estado === 'cancelado') return;
      const prods = typeof order.productos === 'string' ? JSON.parse(order.productos) : order.productos;
      if (Array.isArray(prods)) {
        prods.forEach((p: any) => {
          soldMap[p.id] = (soldMap[p.id] || 0) + p.quantity;
        });
      }
    });

    const updated = inventory.map(item => {
      if (item.id === id) {
        return { ...item, initialStock: value, currentStock: Math.max(0, value - (soldMap[id] || 0)) };
      }
      return item;
    });
    updateLocalInventory(updated);
  };`;

code = code.replace(/const handleUpdateInitial = \(id: string, value: number\) => \{[\s\S]*?updateLocalInventory\(updated\);\n  \};/, replacement);

fs.writeFileSync('src/pages/Inventario.tsx', code);
