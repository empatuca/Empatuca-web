import { Recipe, ProductionOrder, ProductionOrderItem, ProductionOrderCalculatedIngredient, InsumoItem } from '../types';
import { getLocalInsumos, adjustInsumoStock, saveLocalInsumos } from './insumosStorage';
import { supabase, isSupabaseConfigured } from './supabase';

const RECIPES_STORAGE_KEY = 'empatuca_recetas_v1';
const PRODUCTION_ORDERS_KEY = 'empatuca_ordenes_produccion_v1';
const SHARED_RECIPES_ROW_ID = '00000000-0000-0000-0000-000000000003';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-verde-queso',
    name: 'Empanada de Verde con Queso (Tuca)',
    category: 'Empanadas de Verde',
    baseYield: 10,
    yieldUnit: 'empanadas',
    notes: 'Relleno de abundante queso manaba artesanal en masa de verde crocante.',
    ingredients: [
      { insumoName: 'Masa de Verde Procesada', quantity: 1.5, unit: 'libras' },
      { insumoName: 'Queso Manaba Artesanal (Para Rallar)', quantity: 0.8, unit: 'libras' },
      { insumoName: 'Aceite Vegetal para Fritura', quantity: 0.25, unit: 'litros' },
      { insumoName: 'Fundas de Papel Kraft (Empanadas)', quantity: 10, unit: 'unidades' },
      { insumoName: 'Tarrinas 2oz con tapa (Ají y Salsas)', quantity: 3, unit: 'unidades' },
      { insumoName: 'Papel Manteca Antigrasa', quantity: 5, unit: 'pliegos' }
    ]
  },
  {
    id: 'rec-verde-carne',
    name: 'Empanada de Verde con Carne Mechada',
    category: 'Empanadas de Verde',
    baseYield: 10,
    yieldUnit: 'empanadas',
    notes: 'Carne desmechada jugosa cocinada a fuego lento con refrito de la casa.',
    ingredients: [
      { insumoName: 'Masa de Verde Procesada', quantity: 1.5, unit: 'libras' },
      { insumoName: 'Carne de Res para Mechar', quantity: 1.0, unit: 'libras' },
      { insumoName: 'Cebolla y Pimientos (Refrito)', quantity: 0.3, unit: 'libras' },
      { insumoName: 'Aliño Artesanal & Ajo', quantity: 0.1, unit: 'libras' },
      { insumoName: 'Aceite Vegetal para Fritura', quantity: 0.25, unit: 'litros' },
      { insumoName: 'Fundas de Papel Kraft (Empanadas)', quantity: 10, unit: 'unidades' },
      { insumoName: 'Tarrinas 2oz con tapa (Ají y Salsas)', quantity: 3, unit: 'unidades' }
    ]
  },
  {
    id: 'rec-verde-pollo',
    name: 'Empanada de Verde con Pollo Desmechado',
    category: 'Empanadas de Verde',
    baseYield: 10,
    yieldUnit: 'empanadas',
    notes: 'Pechuga desmechada con especias y refrito tradicional.',
    ingredients: [
      { insumoName: 'Masa de Verde Procesada', quantity: 1.5, unit: 'libras' },
      { insumoName: 'Pechuga de Pollo para Desmechar', quantity: 1.0, unit: 'libras' },
      { insumoName: 'Cebolla y Pimientos (Refrito)', quantity: 0.3, unit: 'libras' },
      { insumoName: 'Aliño Artesanal & Ajo', quantity: 0.1, unit: 'libras' },
      { insumoName: 'Aceite Vegetal para Fritura', quantity: 0.25, unit: 'litros' },
      { insumoName: 'Fundas de Papel Kraft (Empanadas)', quantity: 10, unit: 'unidades' },
      { insumoName: 'Tarrinas 2oz con tapa (Ají y Salsas)', quantity: 3, unit: 'unidades' }
    ]
  },
  {
    id: 'rec-harina-queso',
    name: 'Empanada de Harina con Queso',
    category: 'Empanadas de Harina',
    baseYield: 10,
    yieldUnit: 'empanadas',
    notes: 'Masa tradicional crujiente de harina con queso derretido.',
    ingredients: [
      { insumoName: 'Harina de Trigo Especial', quantity: 1.2, unit: 'kg' },
      { insumoName: 'Manteca Vegetal / Margarina', quantity: 0.3, unit: 'libras' },
      { insumoName: 'Queso Manaba Artesanal (Para Rallar)', quantity: 0.8, unit: 'libras' },
      { insumoName: 'Sal Refinada y Especias', quantity: 0.05, unit: 'kg' },
      { insumoName: 'Aceite Vegetal para Fritura', quantity: 0.25, unit: 'litros' },
      { insumoName: 'Fundas de Papel Kraft (Empanadas)', quantity: 10, unit: 'unidades' }
    ]
  },
  {
    id: 'rec-masa-verde-lote',
    name: 'Preparación de Masa de Verde (Lote de 50 Empanadas)',
    category: 'Bases & Masas',
    baseYield: 50,
    yieldUnit: 'empanadas',
    notes: 'Procesamiento de verde dominico cocido y majado con manteca y aliño.',
    ingredients: [
      { insumoName: 'Plátano Verde Dominico', quantity: 1.5, unit: 'racimos' },
      { insumoName: 'Manteca Vegetal / Margarina', quantity: 0.5, unit: 'libras' },
      { insumoName: 'Aliño Artesanal & Ajo', quantity: 0.2, unit: 'libras' },
      { insumoName: 'Sal Refinada y Especias', quantity: 0.1, unit: 'kg' }
    ]
  },
  {
    id: 'rec-morocho-caliente',
    name: 'Morocho Caliente Tradicional (Olla de 20 Vasos)',
    category: 'Bebidas',
    baseYield: 20,
    yieldUnit: 'vasos',
    notes: 'Olla de morocho espeso tradicional con canela, clavo y leche entera.',
    ingredients: [
      { insumoName: 'Maíz Morocho Partido', quantity: 3.0, unit: 'libras' },
      { insumoName: 'Leche Entera (Para Morocho)', quantity: 5.0, unit: 'litros' },
      { insumoName: 'Canela en Rama & Clavo de Olor', quantity: 1.0, unit: 'paquetes' },
      { insumoName: 'Azúcar Morena / Blanca', quantity: 1.5, unit: 'libras' },
      { insumoName: 'Vasos 16oz para Morocho / Bebidas', quantity: 20, unit: 'unidades' },
      { insumoName: 'Tapas para Vasos 16oz', quantity: 20, unit: 'unidades' }
    ]
  }
];

let cachedRecipes: Recipe[] | null = null;

export function getLocalRecipes(): Recipe[] {
  if (cachedRecipes) return cachedRecipes;
  try {
    const stored = localStorage.getItem(RECIPES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedRecipes = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local recipes:', e);
  }
  cachedRecipes = INITIAL_RECIPES;
  saveLocalRecipes(INITIAL_RECIPES);
  return INITIAL_RECIPES;
}

export function saveLocalRecipes(recipes: Recipe[]) {
  cachedRecipes = recipes;
  try {
    localStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
  } catch (e) {
    console.error('Error saving recipes:', e);
  }

  // Cloud sync if available
  if (isSupabaseConfigured && supabase) {
    try {
      supabase.from('cierres_diarios').upsert({
        id: SHARED_RECIPES_ROW_ID,
        fecha: '2099-12-31',
        inventario: recipes,
        total_ventas: 0
      }).then();
    } catch (e) {
      // ignore
    }
  }
}

export function addRecipe(newRecipe: Omit<Recipe, 'id'>): Recipe {
  const current = getLocalRecipes();
  const created: Recipe = {
    ...newRecipe,
    id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const updated = [created, ...current];
  saveLocalRecipes(updated);
  return created;
}

export function editRecipe(id: string, changes: Partial<Recipe>) {
  const current = getLocalRecipes();
  const updated = current.map(r => {
    if (r.id === id) {
      return {
        ...r,
        ...changes,
        updated_at: new Date().toISOString()
      };
    }
    return r;
  });
  saveLocalRecipes(updated);
}

export function deleteRecipe(id: string) {
  const current = getLocalRecipes();
  const updated = current.filter(r => r.id !== id);
  saveLocalRecipes(updated);
}

// -------------------------------------------------------------
// Production Calculations Engine
// -------------------------------------------------------------

export function calculateProductionMaterials(
  plannedItems: ProductionOrderItem[],
  availableRecipes: Recipe[],
  currentInsumos: InsumoItem[]
): ProductionOrderCalculatedIngredient[] {
  const insumoMap: Record<string, {
    insumoId?: string;
    insumoName: string;
    requiredQuantity: number;
    unit: string;
  }> = {};

  plannedItems.forEach(item => {
    if (!item.plannedQuantity || item.plannedQuantity <= 0) return;
    const recipe = availableRecipes.find(r => r.id === item.recipeId);
    if (!recipe || recipe.baseYield <= 0) return;

    const factor = item.plannedQuantity / recipe.baseYield;

    recipe.ingredients.forEach(ing => {
      const key = ing.insumoName.trim().toLowerCase();
      const needed = ing.quantity * factor;

      if (!insumoMap[key]) {
        // Try to find matching insumo from stock
        const matchedStock = currentInsumos.find(
          stock => stock.name.trim().toLowerCase() === key || stock.id === ing.insumoId
        );

        insumoMap[key] = {
          insumoId: matchedStock ? matchedStock.id : ing.insumoId,
          insumoName: ing.insumoName,
          requiredQuantity: needed,
          unit: ing.unit
        };
      } else {
        insumoMap[key].requiredQuantity += needed;
      }
    });
  });

  // Calculate against current stock
  const result: ProductionOrderCalculatedIngredient[] = Object.values(insumoMap).map(entry => {
    const matchedStock = currentInsumos.find(
      stock => stock.id === entry.insumoId || stock.name.trim().toLowerCase() === entry.insumoName.trim().toLowerCase()
    );

    const currentStock = matchedStock ? matchedStock.currentStock : 0;
    const roundedRequired = Math.round(entry.requiredQuantity * 100) / 100;
    const missingQuantity = Math.max(0, Math.round((roundedRequired - currentStock) * 100) / 100);
    const isSufficient = currentStock >= roundedRequired;

    return {
      insumoId: entry.insumoId || (matchedStock ? matchedStock.id : undefined),
      insumoName: entry.insumoName,
      requiredQuantity: roundedRequired,
      unit: entry.unit,
      currentStock: currentStock,
      missingQuantity: missingQuantity,
      isSufficient: isSufficient
    };
  });

  // Sort: Missing/Insufficient first, then alphabetical
  result.sort((a, b) => {
    if (!a.isSufficient && b.isSufficient) return -1;
    if (a.isSufficient && !b.isSufficient) return 1;
    return a.insumoName.localeCompare(b.insumoName);
  });

  return result;
}

// -------------------------------------------------------------
// Production Orders History
// -------------------------------------------------------------

export function getProductionOrders(): ProductionOrder[] {
  try {
    const stored = localStorage.getItem(PRODUCTION_ORDERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading production orders:', e);
  }
  return [];
}

export function saveProductionOrders(orders: ProductionOrder[]) {
  try {
    localStorage.setItem(PRODUCTION_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving production orders:', e);
  }
}

export function recordProductionOrder(order: Omit<ProductionOrder, 'id' | 'code' | 'created_at'>): ProductionOrder {
  const current = getProductionOrders();
  const codeNumber = current.length + 1;
  const padCode = codeNumber < 10 ? `00${codeNumber}` : codeNumber < 100 ? `0${codeNumber}` : `${codeNumber}`;

  const newOrder: ProductionOrder = {
    ...order,
    id: `po-${Date.now()}`,
    code: `OP-${padCode}`,
    created_at: new Date().toISOString()
  };

  const updated = [newOrder, ...current];
  saveProductionOrders(updated);
  return newOrder;
}

export function applyProductionStockDeduction(orderId: string): boolean {
  const orders = getProductionOrders();
  const target = orders.find(o => o.id === orderId);
  if (!target || target.descontadoStock) return false;

  const currentStock = getLocalInsumos();
  const updatedStock = currentStock.map(item => {
    // Check if item was used in this order
    const used = target.totalIngredientsRequired.find(
      req => req.insumoId === item.id || req.insumoName.trim().toLowerCase() === item.name.trim().toLowerCase()
    );
    if (used) {
      const newQty = Math.max(0, Math.round((item.currentStock - used.requiredQuantity) * 100) / 100);
      return {
        ...item,
        currentStock: newQty,
        lastUpdated: new Date().toISOString()
      };
    }
    return item;
  });

  saveLocalInsumos(updatedStock);

  // Mark order as deducted
  const updatedOrders = orders.map(o => {
    if (o.id === orderId) {
      return { ...o, descontadoStock: true, status: 'completado' as const };
    }
    return o;
  });
  saveProductionOrders(updatedOrders);
  return true;
}

export function deleteProductionOrder(orderId: string) {
  const current = getProductionOrders();
  const updated = current.filter(o => o.id !== orderId);
  saveProductionOrders(updated);
}
