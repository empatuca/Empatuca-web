const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

const newCode = `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const localOrders: any[] = [];
export const localListeners: Function[] = [];
export const notifyLocalListeners = () => {
  localListeners.forEach(listener => listener([...localOrders]));
  window.dispatchEvent(new Event("localOrdersUpdated"));
};

export interface InventoryItem {
  id: string;
  name: string;
  initialStock: number;
  currentStock: number;
}

export const localInventory: InventoryItem[] = [];

export const updateLocalInventory = async (newInventory: InventoryItem[]) => {
  localInventory.splice(0, localInventory.length, ...newInventory);
  
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('cierres_diarios').upsert({ 
        id: '00000000-0000-0000-0000-000000000000', 
        fecha: '2099-12-31', 
        inventario: newInventory, 
        total_ventas: 0 
      });
    } catch(e) {
      console.error(e);
    }
  } else {
    localStorage.setItem('empatuca_inventory', JSON.stringify(localInventory));
  }
  
  notifyInventoryListeners();
};

export const fetchSharedInventory = async (): Promise<InventoryItem[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('cierres_diarios').select('inventario').eq('id', '00000000-0000-0000-0000-000000000000').single();
      if (data && data.inventario) {
        return data.inventario as InventoryItem[];
      }
    } catch(e) {}
  } else {
    const stored = localStorage.getItem('empatuca_inventory');
    if (stored) {
      try { return JSON.parse(stored); } catch(e) {}
    }
  }
  return [];
};

export const inventoryListeners: Function[] = [];
export const notifyInventoryListeners = () => {
  inventoryListeners.forEach(listener => listener([...localInventory]));
};
`;

fs.writeFileSync('src/lib/supabase.ts', newCode);
