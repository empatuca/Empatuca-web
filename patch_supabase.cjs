const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

code += `
export interface InventoryItem {
  id: string;
  name: string;
  initialStock: number;
  currentStock: number;
}

const getInitialInventory = () => {
  const stored = localStorage.getItem('empatuca_inventory');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch(e) {}
  }
  return [];
};

export const localInventory: InventoryItem[] = getInitialInventory();

export const updateLocalInventory = (newInventory: InventoryItem[]) => {
  localInventory.splice(0, localInventory.length, ...newInventory);
  localStorage.setItem('empatuca_inventory', JSON.stringify(localInventory));
  notifyInventoryListeners();
};

export const inventoryListeners: Function[] = [];
export const notifyInventoryListeners = () => {
  inventoryListeners.forEach(listener => listener([...localInventory]));
};
`;

fs.writeFileSync('src/lib/supabase.ts', code);
