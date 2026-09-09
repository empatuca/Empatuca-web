import { InsumoItem, InsumoCategory } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const INSUMOS_STORAGE_KEY = 'empatuca_insumos_stock_v1';
const SHARED_INSUMOS_ROW_ID = '00000000-0000-0000-0000-000000000002';

export const INITIAL_INSUMOS: InsumoItem[] = [
  // Descartables y Empaques
  { id: 'desc-1', name: 'Fundas de Papel Kraft (Empanadas)', category: 'descartables', currentStock: 250, minStock: 80, unit: 'unidades' },
  { id: 'desc-2', name: 'Tarrinas 2oz con tapa (Ají y Salsas)', category: 'descartables', currentStock: 180, minStock: 60, unit: 'unidades' },
  { id: 'desc-3', name: 'Vasos 16oz para Morocho / Bebidas', category: 'descartables', currentStock: 75, minStock: 40, unit: 'unidades' },
  { id: 'desc-4', name: 'Tapas para Vasos 16oz', category: 'descartables', currentStock: 70, minStock: 40, unit: 'unidades' },
  { id: 'desc-5', name: 'Servilletas Interfoliadas', category: 'descartables', currentStock: 12, minStock: 4, unit: 'paquetes' },
  { id: 'desc-6', name: 'Fundas Plásticas Tipo Camiseta (Delivery)', category: 'descartables', currentStock: 8, minStock: 3, unit: 'paquetes' },
  { id: 'desc-7', name: 'Papel Manteca Antigrasa', category: 'descartables', currentStock: 120, minStock: 40, unit: 'pliegos' },

  // Materia Prima e Ingredientes de Producción
  { id: 'mat-1', name: 'Plátano Verde Dominico', category: 'materia_prima', currentStock: 6, minStock: 3, unit: 'racimos' },
  { id: 'mat-2', name: 'Masa de Verde Procesada', category: 'materia_prima', currentStock: 25, minStock: 10, unit: 'libras' },
  { id: 'mat-3', name: 'Harina de Trigo Especial', category: 'materia_prima', currentStock: 20, minStock: 8, unit: 'kg' },
  { id: 'mat-4', name: 'Queso Manaba Artesanal (Para Rallar)', category: 'materia_prima', currentStock: 18, minStock: 6, unit: 'libras' },
  { id: 'mat-5', name: 'Carne de Res para Mechar', category: 'materia_prima', currentStock: 12, minStock: 5, unit: 'libras' },
  { id: 'mat-6', name: 'Pechuga de Pollo para Desmechar', category: 'materia_prima', currentStock: 14, minStock: 5, unit: 'libras' },
  { id: 'mat-7', name: 'Aceite Vegetal para Fritura', category: 'materia_prima', currentStock: 15, minStock: 6, unit: 'litros' },
  { id: 'mat-8', name: 'Aliño Artesanal & Ajo', category: 'materia_prima', currentStock: 4, minStock: 2, unit: 'libras' },
  { id: 'mat-9', name: 'Cebolla y Pimientos (Refrito)', category: 'materia_prima', currentStock: 8, minStock: 3, unit: 'libras' },
  { id: 'mat-10', name: 'Manteca Vegetal / Margarina', category: 'materia_prima', currentStock: 6, minStock: 2, unit: 'libras' },
  { id: 'mat-11', name: 'Sal Refinada y Especias', category: 'materia_prima', currentStock: 3, minStock: 1, unit: 'kg' },

  // Bebidas y Otros Insumos
  { id: 'beb-1', name: 'Maíz Morocho Partido', category: 'bebidas', currentStock: 15, minStock: 5, unit: 'libras' },
  { id: 'beb-2', name: 'Leche Entera (Para Morocho)', category: 'bebidas', currentStock: 20, minStock: 8, unit: 'litros' },
  { id: 'beb-3', name: 'Canela en Rama & Clavo de Olor', category: 'bebidas', currentStock: 5, minStock: 2, unit: 'paquetes' },
  { id: 'beb-4', name: 'Azúcar Morena / Blanca', category: 'bebidas', currentStock: 12, minStock: 4, unit: 'libras' },
  { id: 'beb-5', name: 'Gaseosas Surtidas (Lata / Botella)', category: 'bebidas', currentStock: 36, minStock: 18, unit: 'unidades' },
  { id: 'beb-6', name: 'Agua Personal sin Gas', category: 'bebidas', currentStock: 24, minStock: 10, unit: 'unidades' }
];

let cachedInsumos: InsumoItem[] | null = null;
const listeners: Array<(items: InsumoItem[]) => void> = [];

export function subscribeInsumos(fn: (items: InsumoItem[]) => void) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners(items: InsumoItem[]) {
  listeners.forEach(fn => fn(items));
}

export function getLocalInsumos(): InsumoItem[] {
  if (cachedInsumos) return cachedInsumos;
  try {
    const stored = localStorage.getItem(INSUMOS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedInsumos = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local insumos:', e);
  }
  cachedInsumos = INITIAL_INSUMOS;
  saveLocalInsumos(INITIAL_INSUMOS);
  return INITIAL_INSUMOS;
}

export async function saveLocalInsumos(items: InsumoItem[]) {
  cachedInsumos = items;
  try {
    localStorage.setItem(INSUMOS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving insumos to localStorage:', e);
  }
  notifyListeners(items);

  // Sync to Supabase if available
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('cierres_diarios').upsert({
        id: SHARED_INSUMOS_ROW_ID,
        fecha: '2099-12-30',
        inventario: items,
        total_ventas: 0
      });
    } catch (e) {
      console.warn('Cloud sync of insumos deferred:', e);
    }
  }
}

export async function initInsumosSync(): Promise<InsumoItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('cierres_diarios')
        .select('inventario')
        .eq('id', SHARED_INSUMOS_ROW_ID)
        .single();
      if (data && Array.isArray(data.inventario) && data.inventario.length > 0) {
        cachedInsumos = data.inventario as InsumoItem[];
        localStorage.setItem(INSUMOS_STORAGE_KEY, JSON.stringify(data.inventario));
        notifyListeners(cachedInsumos);
        return cachedInsumos;
      }
    } catch (e) {
      // fallback
    }
  }
  return getLocalInsumos();
}

export function updateInsumoStock(id: string, newStock: number) {
  const current = getLocalInsumos();
  const updated = current.map(item => {
    if (item.id === id) {
      return { 
        ...item, 
        currentStock: Math.max(0, Math.round(newStock * 100) / 100),
        lastUpdated: new Date().toISOString()
      };
    }
    return item;
  });
  saveLocalInsumos(updated);
}

export function adjustInsumoStock(id: string, delta: number) {
  const current = getLocalInsumos();
  const updated = current.map(item => {
    if (item.id === id) {
      const next = Math.max(0, Math.round((item.currentStock + delta) * 100) / 100);
      return { 
        ...item, 
        currentStock: next,
        lastUpdated: new Date().toISOString()
      };
    }
    return item;
  });
  saveLocalInsumos(updated);
}

export function addInsumo(item: Omit<InsumoItem, 'id'>) {
  const current = getLocalInsumos();
  const newItem: InsumoItem = {
    ...item,
    id: `insumo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    lastUpdated: new Date().toISOString()
  };
  const updated = [newItem, ...current];
  saveLocalInsumos(updated);
  return newItem;
}

export function editInsumo(id: string, changes: Partial<InsumoItem>) {
  const current = getLocalInsumos();
  const updated = current.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...changes,
        lastUpdated: new Date().toISOString()
      };
    }
    return item;
  });
  saveLocalInsumos(updated);
}

export function deleteInsumo(id: string) {
  const current = getLocalInsumos();
  const updated = current.filter(item => item.id !== id);
  saveLocalInsumos(updated);
}
