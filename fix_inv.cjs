const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const target = `  // Initialize inventory based on menu if empty
  useEffect(() => {
    if (inventory.length === 0) {
      const init: InventoryItem[] = [];
      siteConfig.menu.forEach(item => {
        if (item.prices.empatuca !== undefined) {
          init.push({ id: \`\${item.id}-empatuca\`, name: \`\${item.name} (Empatuca)\`, initialStock: 0, currentStock: 0 });
        }
        if (item.prices.empanita !== undefined) {
          init.push({ id: \`\${item.id}-empanita\`, name: \`\${item.name} (Empanita)\`, initialStock: 0, currentStock: 0 });
        }
        if (item.prices.estandar !== undefined) {
          init.push({ id: \`\${item.id}-estandar\`, name: item.name, initialStock: 0, currentStock: 0 });
        }
      });
      updateLocalInventory(init);
    }

    const listener = (newInv: InventoryItem[]) => setInventory([...newInv]);
    inventoryListeners.push(listener);
    return () => {
      const idx = inventoryListeners.indexOf(listener);
      if (idx > -1) inventoryListeners.splice(idx, 1);
    }
  }, []);`;

const replacement = `  // Initialize inventory based on menu if empty locally without overwriting DB
  useEffect(() => {
    if (inventory.length === 0 && localInventory.length === 0) {
      const init: InventoryItem[] = [];
      siteConfig.menu.forEach(item => {
        if (item.prices.empatuca !== undefined) {
          init.push({ id: \`\${item.id}-empatuca\`, name: \`\${item.name} (Empatuca)\`, initialStock: 0, currentStock: 0 });
        }
        if (item.prices.empanita !== undefined) {
          init.push({ id: \`\${item.id}-empanita\`, name: \`\${item.name} (Empanita)\`, initialStock: 0, currentStock: 0 });
        }
        if (item.prices.estandar !== undefined) {
          init.push({ id: \`\${item.id}-estandar\`, name: item.name, initialStock: 0, currentStock: 0 });
        }
      });
      // ONLY set locally so we don't accidentally overwrite DB on a fetch failure
      setInventory(init);
      localInventory.splice(0, localInventory.length, ...init);
    }

    const listener = (newInv: InventoryItem[]) => setInventory([...newInv]);
    inventoryListeners.push(listener);
    return () => {
      const idx = inventoryListeners.indexOf(listener);
      if (idx > -1) inventoryListeners.splice(idx, 1);
    }
  }, []);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/Inventario.tsx', code);
  console.log("Success patch Inventario init");
} else {
  console.log("Failed to find target in Inventario.tsx");
}
