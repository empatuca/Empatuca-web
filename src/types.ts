export type InsumoCategory = 'descartables' | 'materia_prima' | 'bebidas' | 'otros';

export interface InsumoItem {
  id: string;
  name: string;
  category: InsumoCategory;
  currentStock: number;
  minStock: number;
  unit: string;
  lastUpdated?: string;
  notes?: string;
}

export type ExpenseCategoryType = 
  | 'Operativo' 
  | 'Producción' 
  | 'Servicios Básicos' 
  | 'Pago Socios (Socio 1)' 
  | 'Pago Socios (Socio 2)' 
  | 'Pago Socios (Socio 3)' 
  | string;

export interface RecipeIngredient {
  insumoId?: string;
  insumoName: string;
  quantity: number;
  unit: string;
  costPerUnit?: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  baseYield: number; // e.g. 10 or 1
  yieldUnit: string; // e.g. 'empanadas', 'litros', 'porciones'
  ingredients: RecipeIngredient[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductionOrderItem {
  recipeId: string;
  recipeName: string;
  plannedQuantity: number;
}

export interface ProductionOrderCalculatedIngredient {
  insumoId?: string;
  insumoName: string;
  requiredQuantity: number;
  unit: string;
  currentStock: number;
  missingQuantity: number;
  isSufficient: boolean;
  estimatedCost?: number;
}

export interface ProductionOrder {
  id: string;
  code: string;
  created_at: string;
  responsable?: string;
  status: 'borrador' | 'completado' | 'cancelado';
  items: ProductionOrderItem[];
  totalIngredientsRequired: ProductionOrderCalculatedIngredient[];
  notes?: string;
  descontadoStock?: boolean;
}
