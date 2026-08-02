const fs = require('fs');
let code = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

// Define invListener in the component level? Better to just add a dedicated useEffect.
code = code.replace(
  '    return () => {\n      const idx = inventoryListeners.indexOf(invListener);\n      if (idx > -1) inventoryListeners.splice(idx, 1);\n    };\n  }, [initialOrder]);',
  `  }, [initialOrder]);

  React.useEffect(() => {
    const invListener = (newInv: InventoryItem[]) => setInventory([...newInv]);
    inventoryListeners.push(invListener);
    return () => {
      const idx = inventoryListeners.indexOf(invListener);
      if (idx > -1) inventoryListeners.splice(idx, 1);
    };
  }, []);`
);

fs.writeFileSync('src/components/home/WaitersPOS.tsx', code);
