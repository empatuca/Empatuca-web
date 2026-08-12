const fs = require('fs');
let code = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

// 1. Merge items when loading
const loadTarget = `    if (initialOrder) {
      setItems(initialOrder.productos || []);`;
      
const loadReplacement = `    if (initialOrder) {
      let rawProds = initialOrder.productos || [];
      if (typeof rawProds === 'string') {
         try { rawProds = JSON.parse(rawProds); } catch (e) { rawProds = []; }
      }
      const merged = rawProds.reduce((acc, curr) => {
        const existing = acc.find(i => i.id === curr.id);
        if (existing) {
          existing.quantity += curr.quantity;
        } else {
          acc.push({ ...curr });
        }
        return acc;
      }, []);
      setItems(merged);`;

code = code.replace(loadTarget, loadReplacement);

// 2. Split items when saving
const saveTarget = `    const orderData = {
      numero_pedido: orderIdValue,
      nombre_cliente: customerName || "Mesa",
      tipo: orderType,
      mesa: orderType === 'mesa' ? parseInt(tableNumber) || null : null,
      direccion_delivery: orderType === 'delivery' ? address : (orderType === 'mesa' ? \`Mesa \${tableNumber}\` : 'Para Llevar'),
      productos: items,`;

const saveReplacement = `    let finalItems = items;
    if (initialOrder) {
      let rawProds = initialOrder.productos || [];
      if (typeof rawProds === 'string') {
         try { rawProds = JSON.parse(rawProds); } catch(e) { rawProds = []; }
      }
      const originalCounts = {};
      rawProds.forEach(p => {
        if (!p.isAdicional) {
          originalCounts[p.id] = (originalCounts[p.id] || 0) + p.quantity;
        }
      });
      finalItems = [];
      items.forEach(item => {
        const originalQty = originalCounts[item.id] || 0;
        if (item.quantity <= originalQty) {
          finalItems.push({ ...item, isAdicional: false });
        } else {
          if (originalQty > 0) {
            finalItems.push({ ...item, quantity: originalQty, isAdicional: false });
          }
          finalItems.push({ ...item, quantity: item.quantity - originalQty, isAdicional: true });
        }
      });
    }

    const orderData = {
      numero_pedido: orderIdValue,
      nombre_cliente: customerName || "Mesa",
      tipo: orderType,
      mesa: orderType === 'mesa' ? parseInt(tableNumber) || null : null,
      direccion_delivery: orderType === 'delivery' ? address : (orderType === 'mesa' ? \`Mesa \${tableNumber}\` : 'Para Llevar'),
      productos: finalItems,`;

code = code.replace(saveTarget, saveReplacement);
fs.writeFileSync('src/components/home/WaitersPOS.tsx', code);
