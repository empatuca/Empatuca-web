import { createClient } from '@supabase/supabase-js';
import { siteConfig } from '../../siteConfig';

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
  waste?: number;
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

export const getDefaultMenuInventory = (): InventoryItem[] => {
  const init: InventoryItem[] = [];
  siteConfig.menu.forEach(item => {
    if (item.id === 'bandeja-crudas') return;
    if (item.prices.empatuca !== undefined) {
      init.push({ id: `${item.id}-empatuca`, name: `${item.name} (Empatuca)`, initialStock: 0, currentStock: 0 });
    }
    if (item.prices.empanita !== undefined) {
      init.push({ id: `${item.id}-empanita`, name: `${item.name} (Empanita)`, initialStock: 0, currentStock: 0 });
    }
    if (item.prices.estandar !== undefined) {
      if (item.variants) {
        item.variants.forEach(variant => {
          init.push({ id: `${item.id}-estandar-${variant.id}`, name: `${item.name.replace(/^[^\w\s]+/, '').trim()} - ${variant.name}`, initialStock: 0, currentStock: 0 });
        });
      } else {
        init.push({ id: `${item.id}-estandar`, name: item.name, initialStock: 0, currentStock: 0 });
      }
    }
  });
  return init;
};

let invChannel: any = null;
export const syncSharedInventory = async () => {
  const defaults = getDefaultMenuInventory();
  if (isSupabaseConfigured && supabase) {
    const inv = await fetchSharedInventory();
    if (inv.length > 0) {
      const existingIds = new Set(inv.map(i => i.id));
      const merged = [...inv];
      let hasMissing = false;
      for (const defItem of defaults) {
        if (!existingIds.has(defItem.id)) {
          merged.push(defItem);
          hasMissing = true;
        }
      }
      localInventory.splice(0, localInventory.length, ...merged);
      if (hasMissing) {
        try {
          await supabase.from('cierres_diarios').upsert({
            id: '00000000-0000-0000-0000-000000000000',
            fecha: '2099-12-31',
            inventario: merged,
            total_ventas: 0
          });
        } catch (e) {
          console.error('Error auto-syncing new menu items to inventory:', e);
        }
      }
      notifyInventoryListeners();
    } else {
      localInventory.splice(0, localInventory.length, ...defaults);
      notifyInventoryListeners();
    }
    
    if (!invChannel) {
      invChannel = supabase
        .channel('shared-inventory')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cierres_diarios', filter: "id=eq.00000000-0000-0000-0000-000000000000" }, (payload) => {
           if (payload.new && (payload.new as any).inventario) {
              const incoming = (payload.new as any).inventario as InventoryItem[];
              const existingIds = new Set(incoming.map(i => i.id));
              const merged = [...incoming];
              for (const defItem of defaults) {
                if (!existingIds.has(defItem.id)) {
                  merged.push(defItem);
                }
              }
              localInventory.splice(0, localInventory.length, ...merged);
              notifyInventoryListeners();
           }
        })
        .subscribe();
    }
  } else {
    const stored = localStorage.getItem('empatuca_inventory');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((i: any) => i.id));
          const merged = [...parsed];
          for (const defItem of defaults) {
            if (!existingIds.has(defItem.id)) {
              merged.push(defItem);
            }
          }
          localInventory.splice(0, localInventory.length, ...merged);
          notifyInventoryListeners();
          return;
        }
      } catch (e) {}
    }
    localInventory.splice(0, localInventory.length, ...defaults);
    notifyInventoryListeners();
  }
};
