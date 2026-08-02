const fs = require('fs');
let code = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

if (!code.includes('import { localInventory, inventoryListeners, InventoryItem }')) {
  code = code.replace(
    'import { Checkbox } from "@/components/ui/checkbox";',
    'import { Checkbox } from "@/components/ui/checkbox";\nimport { localInventory, inventoryListeners, InventoryItem } from "../../lib/supabase";'
  );
}

if (!code.includes('const [inventory, setInventory] = useState<InventoryItem[]>(localInventory);')) {
  code = code.replace(
    'const [items, setItems] = useState<OrderItem[]>([]);',
    'const [inventory, setInventory] = useState<InventoryItem[]>(localInventory);\n  const [items, setItems] = useState<OrderItem[]>([]);'
  );
  
  code = code.replace(
    '  useEffect(() => {',
    `  useEffect(() => {
    const invListener = (newInv: InventoryItem[]) => setInventory([...newInv]);
    inventoryListeners.push(invListener);`
  );
  
  code = code.replace(
    '  }, [initialOrder]);',
    `    return () => {
      const idx = inventoryListeners.indexOf(invListener);
      if (idx > -1) inventoryListeners.splice(idx, 1);
    };
  }, [initialOrder]);`
  );
}

code = code.replace(
  'const updateQuantity = (id: string, name: string, size: string, price: number, delta: number) => {',
  `const updateQuantity = (id: string, name: string, size: string, price: number, delta: number) => {
    const invItem = inventory.find(i => i.id === id);
    if (invItem && delta > 0 && invItem.initialStock > 0) {
      const currentQty = items.find(i => i.id === id)?.quantity || 0;
      if (currentQty + delta > invItem.currentStock) {
        alert(\`¡Agotado! Solo quedan \${invItem.currentStock} unidades de \${name}\`);
        return;
      }
    }`
);

fs.writeFileSync('src/components/home/WaitersPOS.tsx', code);
