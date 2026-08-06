import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Fallback local state for demo purposes when Supabase is not configured
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
