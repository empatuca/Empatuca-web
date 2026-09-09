import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Calculator, 
  ClipboardList, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Copy, 
  Check, 
  Search, 
  Layers, 
  Scale, 
  RefreshCw,
  X,
  Clock,
  ArrowRight,
  Info,
  Sliders,
  Send
} from 'lucide-react';
import { Recipe, RecipeIngredient, ProductionOrder, ProductionOrderItem, InsumoItem } from '../types';
import { 
  getLocalRecipes, 
  saveLocalRecipes, 
  addRecipe, 
  editRecipe, 
  deleteRecipe, 
  calculateProductionMaterials,
  getProductionOrders,
  recordProductionOrder,
  applyProductionStockDeduction,
  deleteProductionOrder
} from '../lib/recetasStorage';
import { getLocalInsumos, subscribeInsumos } from '../lib/insumosStorage';

export const ProduccionManager: React.FC = () => {
  const [subTab, setSubTab] = useState<'calculadora' | 'recetas' | 'historial'>('calculadora');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [insumos, setInsumos] = useState<InsumoItem[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  
  // Production Calculator state
  // Map of recipeId -> plannedQuantity
  const [plannedQuantities, setPlannedQuantities] = useState<Record<string, number>>({});
  const [responsable, setResponsable] = useState<string>('Cocina / Producción');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Recipe Modal state
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [recipeFormName, setRecipeFormName] = useState('');
  const [recipeFormCategory, setRecipeFormCategory] = useState('Empanadas de Verde');
  const [recipeFormYield, setRecipeFormYield] = useState<number>(10);
  const [recipeFormYieldUnit, setRecipeFormYieldUnit] = useState('empanadas');
  const [recipeFormNotes, setRecipeFormNotes] = useState('');
  const [recipeFormIngredients, setRecipeFormIngredients] = useState<RecipeIngredient[]>([]);

  // Search & Filter
  const [recipeSearch, setRecipeSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Load initial data
  useEffect(() => {
    const loadedRecipes = getLocalRecipes();
    setRecipes(loadedRecipes);

    const loadedInsumos = getLocalInsumos();
    setInsumos(loadedInsumos);

    const loadedOrders = getProductionOrders();
    setProductionOrders(loadedOrders);

    // Default initialization of planned quantities for top items
    const initialPlan: Record<string, number> = {};
    if (loadedRecipes.length > 0) {
      initialPlan[loadedRecipes[0].id] = 50; // e.g. 50 empanadas de verde queso
      if (loadedRecipes[1]) initialPlan[loadedRecipes[1].id] = 30; // 30 carne
      if (loadedRecipes[2]) initialPlan[loadedRecipes[2].id] = 20; // 20 pollo
    }
    setPlannedQuantities(initialPlan);

    const unsub = subscribeInsumos(items => {
      setInsumos(items);
    });
    return unsub;
  }, []);

  // Recalculate production items
  const activePlanItems: ProductionOrderItem[] = (Object.entries(plannedQuantities) as [string, number][])
    .filter(([_, qty]) => Number(qty) > 0)
    .map(([recipeId, plannedQuantity]) => {
      const rec = recipes.find(r => r.id === recipeId);
      return {
        recipeId,
        recipeName: rec ? rec.name : 'Receta',
        plannedQuantity: Number(plannedQuantity)
      };
    });

  const calculatedMaterials = calculateProductionMaterials(activePlanItems, recipes, insumos);

  const totalUnitsPlanned = activePlanItems.reduce((acc, item) => acc + item.plannedQuantity, 0);
  const insufficientCount = calculatedMaterials.filter(m => !m.isSufficient).length;

  // Handler for setting quantity
  const handleQuantityChange = (recipeId: string, value: string) => {
    const num = parseFloat(value);
    setPlannedQuantities(prev => ({
      ...prev,
      [recipeId]: isNaN(num) || num < 0 ? 0 : num
    }));
  };

  const handleQuickAdd = (recipeId: string, delta: number) => {
    setPlannedQuantities(prev => {
      const current = prev[recipeId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [recipeId]: next };
    });
  };

  const handleClearPlan = () => {
    setPlannedQuantities({});
  };

  // Recipe Modal actions
  const handleOpenAddRecipe = () => {
    setEditingRecipe(null);
    setRecipeFormName('');
    setRecipeFormCategory('Empanadas de Verde');
    setRecipeFormYield(10);
    setRecipeFormYieldUnit('empanadas');
    setRecipeFormNotes('');
    setRecipeFormIngredients([
      { insumoName: 'Masa de Verde Procesada', quantity: 1.5, unit: 'libras' },
      { insumoName: 'Queso Manaba Artesanal (Para Rallar)', quantity: 0.8, unit: 'libras' },
      { insumoName: 'Aceite Vegetal para Fritura', quantity: 0.25, unit: 'litros' }
    ]);
    setIsRecipeModalOpen(true);
  };

  const handleOpenEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setRecipeFormName(recipe.name);
    setRecipeFormCategory(recipe.category);
    setRecipeFormYield(recipe.baseYield);
    setRecipeFormYieldUnit(recipe.yieldUnit);
    setRecipeFormNotes(recipe.notes || '');
    setRecipeFormIngredients([...recipe.ingredients]);
    setIsRecipeModalOpen(true);
  };

  const handleAddIngredientRow = () => {
    setRecipeFormIngredients(prev => [
      ...prev,
      { insumoName: '', quantity: 1, unit: 'libras' }
    ]);
  };

  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: any) => {
    setRecipeFormIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveIngredientRow = (index: number) => {
    setRecipeFormIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeFormName.trim()) return;

    const filteredIngredients = recipeFormIngredients.filter(
      ing => ing.insumoName.trim() && ing.quantity > 0
    );

    if (filteredIngredients.length === 0) {
      alert('Debes agregar al menos un insumo o materia prima con cantidad válida.');
      return;
    }

    if (editingRecipe) {
      editRecipe(editingRecipe.id, {
        name: recipeFormName.trim(),
        category: recipeFormCategory,
        baseYield: Number(recipeFormYield) || 1,
        yieldUnit: recipeFormYieldUnit.trim() || 'unidades',
        notes: recipeFormNotes.trim(),
        ingredients: filteredIngredients
      });
    } else {
      addRecipe({
        name: recipeFormName.trim(),
        category: recipeFormCategory,
        baseYield: Number(recipeFormYield) || 1,
        yieldUnit: recipeFormYieldUnit.trim() || 'unidades',
        notes: recipeFormNotes.trim(),
        ingredients: filteredIngredients
      });
    }

    setRecipes(getLocalRecipes());
    setIsRecipeModalOpen(false);
  };

  const handleDeleteRecipe = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar la receta "${name}"?`)) {
      deleteRecipe(id);
      setRecipes(getLocalRecipes());
    }
  };

  // Create & Register Production Order
  const handleCreateOrder = (autoDeduct: boolean = false) => {
    if (activePlanItems.length === 0) {
      alert('Ingresa la cantidad a producir de al menos una receta.');
      return;
    }

    const newOrder = recordProductionOrder({
      responsable: responsable.trim() || 'Cocina',
      status: autoDeduct ? 'completado' : 'borrador',
      items: activePlanItems,
      totalIngredientsRequired: calculatedMaterials,
      notes: orderNotes.trim(),
      descontadoStock: false
    });

    if (autoDeduct) {
      applyProductionStockDeduction(newOrder.id);
      setInsumos(getLocalInsumos());
    }

    setProductionOrders(getProductionOrders());
    setSuccessMessage(
      `Orden de Producción ${newOrder.code} registrada con éxito.${
        autoDeduct ? ' Se descontaron automáticamente los insumos del stock.' : ''
      }`
    );
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleApplyDeduction = (orderId: string) => {
    if (confirm('¿Deseas descontar estos insumos del stock real en inventario? Esta acción actualizará las existencias actuales.')) {
      applyProductionStockDeduction(orderId);
      setInsumos(getLocalInsumos());
      setProductionOrders(getProductionOrders());
      setSuccessMessage('Existencias de insumos descontadas con éxito.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('¿Deseas eliminar este registro de orden de producción?')) {
      deleteProductionOrder(orderId);
      setProductionOrders(getProductionOrders());
    }
  };

  // Copy WhatsApp summary
  const handleCopyWhatsApp = () => {
    if (activePlanItems.length === 0) return;

    let text = `📋 *ORDEN DE PRODUCCIÓN - EMPATUCA*\n`;
    text += `📅 Fecha: ${new Date().toLocaleDateString('es-EC')} | Resp: ${responsable}\n\n`;
    text += `*METAS DE PRODUCCIÓN:*\n`;
    activePlanItems.forEach(item => {
      text += `• ${item.plannedQuantity}x ${item.recipeName}\n`;
    });
    text += `\n*MATERIA PRIMA E INSUMOS REQUERIDOS:*\n`;
    calculatedMaterials.forEach(mat => {
      const statusIcon = mat.isSufficient ? '✅' : '⚠️ FALTAN';
      const statusText = mat.isSufficient 
        ? `(Stock OK: ${mat.currentStock} ${mat.unit})` 
        : `*(⚠️ COMPRAR: ${mat.missingQuantity} ${mat.unit})*`;
      text += `• ${mat.insumoName}: *${mat.requiredQuantity} ${mat.unit}* ${statusText}\n`;
    });

    if (orderNotes) {
      text += `\n📝 Notas: ${orderNotes}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  // Unique categories
  const categories = ['all', ...Array.from(new Set(recipes.map(r => r.category)))];

  const filteredRecipes = recipes.filter(r => {
    const matchesCat = selectedCategoryFilter === 'all' || r.category === selectedCategoryFilter;
    const matchesSearch = r.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
      r.ingredients.some(i => i.insumoName.toLowerCase().includes(recipeSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Sub-Tabs Nav */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubTab('calculadora')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              subTab === 'calculadora'
                ? 'bg-[#5a0606] text-white shadow-md shadow-[#5a0606]/20'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculadora & Órdenes de Producción</span>
            {totalUnitsPlanned > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-400 text-gray-950 font-black">
                {totalUnitsPlanned}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('recetas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              subTab === 'recetas'
                ? 'bg-[#5a0606] text-white shadow-md shadow-[#5a0606]/20'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Fórmulas y Recetas</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700 font-bold">
              {recipes.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('historial')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              subTab === 'historial'
                ? 'bg-[#5a0606] text-white shadow-md shadow-[#5a0606]/20'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Historial de Órdenes</span>
            {productionOrders.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-700 font-bold">
                {productionOrders.length}
              </span>
            )}
          </button>
        </div>

        {subTab === 'recetas' && (
          <button
            onClick={handleOpenAddRecipe}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Receta</span>
          </button>
        )}
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-semibold text-sm">{successMessage}</p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CALCULADORA & ORDENES DE PRODUCCION                                    */}
      {/* ========================================================================= */}
      {subTab === 'calculadora' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recipes & Planned Quantities Selector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#5a0606]" />
                    ¿Cuánto vas a producir hoy?
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Escribe la cantidad exacta para que el sistema calcule la materia prima
                  </p>
                </div>
                {totalUnitsPlanned > 0 && (
                  <button
                    onClick={handleClearPlan}
                    className="text-xs text-red-600 hover:underline font-bold"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Recipes Quantity List */}
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {recipes.map(recipe => {
                  const currentQty = plannedQuantities[recipe.id] || 0;
                  const isSelected = currentQty > 0;

                  return (
                    <div 
                      key={recipe.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isSelected 
                          ? 'border-[#5a0606]/30 bg-[#5a0606]/5 shadow-sm' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm leading-tight">
                            {recipe.name}
                          </h4>
                          <span className="text-[11px] text-gray-400">
                            Base: {recipe.baseYield} {recipe.yieldUnit}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                          {recipe.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(recipe.id, -10)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(recipe.id, -1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(recipe.id, 1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(recipe.id, 10)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(recipe.id, 50)}
                            className="w-8 h-7 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                          >
                            +50
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={currentQty === 0 ? '' : currentQty}
                            placeholder="0"
                            onChange={e => handleQuantityChange(recipe.id, e.target.value)}
                            className={`w-20 text-center font-black text-sm py-1.5 px-2 rounded-lg border focus:ring-2 focus:ring-[#5a0606] outline-none ${
                              isSelected 
                                ? 'bg-white border-[#5a0606] text-[#5a0606]' 
                                : 'bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                          />
                          <span className="text-xs text-gray-500 font-medium">uds</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Metadata Form */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Responsable</label>
                    <input
                      type="text"
                      value={responsable}
                      onChange={e => setResponsable(e.target.value)}
                      placeholder="Ej. Juan / Cocina"
                      className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5a0606] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Notas / Lote</label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={e => setOrderNotes(e.target.value)}
                      placeholder="Ej. Turno Tarde / Fin de semana"
                      className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5a0606] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Calculated Raw Materials Result */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-500" />
                    Valores de Materia Prima e Insumos Necesarios
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Proyección exacta calculada según las cantidades escritas ({totalUnitsPlanned} unidades planificadas)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyWhatsApp}
                    disabled={activePlanItems.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors disabled:opacity-40"
                    title="Copiar lista lista para WhatsApp"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? '¡Copiado!' : 'Copiar p/ WhatsApp'}</span>
                  </button>
                </div>
              </div>

              {/* Status Alert Banner if Missing Materials */}
              {insufficientCount > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-start gap-3 text-amber-900 text-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black">Atención: Hay {insufficientCount} insumo(s) con stock insuficiente en almacén.</span>
                    <p className="text-amber-700 mt-0.5">
                      Revisa la columna &ldquo;Faltante&rdquo; para saber la cantidad exacta que se necesita comprar antes de empezar la producción.
                    </p>
                  </div>
                </div>
              )}

              {calculatedMaterials.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Calculator className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600 font-bold text-sm">No has ingresado cantidades a producir</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    Selecciona una receta en el panel izquierdo y escribe la cantidad de empanadas o porciones deseadas para calcular los insumos en tiempo real.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table of Calculated Materials */}
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 font-black border-b border-gray-100 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Materia Prima / Insumo</th>
                          <th className="py-2.5 px-3 text-center">Cantidad Requerida</th>
                          <th className="py-2.5 px-3 text-center">Stock Actual</th>
                          <th className="py-2.5 px-3 text-center">Disponibilidad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {calculatedMaterials.map((mat, idx) => (
                          <tr 
                            key={idx}
                            className={`hover:bg-gray-50/80 transition-colors ${
                              !mat.isSufficient ? 'bg-red-50/30' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-semibold text-gray-900">
                              <div className="flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span>{mat.insumoName}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-black text-gray-950 text-sm">
                              {mat.requiredQuantity} <span className="font-normal text-xs text-gray-500">{mat.unit}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-semibold text-gray-600">
                              {mat.currentStock} <span className="text-[11px] text-gray-400">{mat.unit}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {mat.isSufficient ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Suficiente
                                </span>
                              ) : (
                                <div className="inline-flex flex-col items-center">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-black text-[11px] bg-red-100 text-red-800">
                                    <AlertTriangle className="w-3 h-3" />
                                    Falta: {mat.missingQuantity} {mat.unit}
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer & Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-gray-500">
                      Total <span className="font-black text-gray-900">{calculatedMaterials.length}</span> materias primas evaluadas
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCreateOrder(false)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs transition-colors shadow-sm"
                      >
                        Guardar Borrador
                      </button>

                      <button
                        onClick={() => handleCreateOrder(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5a0606] hover:bg-[#450505] text-white font-black text-xs shadow-md shadow-[#5a0606]/20 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>Confirmar y Descontar Insumos</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CATALOGO DE FORMULAS Y RECETAS                                         */}
      {/* ========================================================================= */}
      {subTab === 'recetas' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={recipeSearch}
                onChange={e => setRecipeSearch(e.target.value)}
                placeholder="Buscar receta o ingrediente..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#5a0606] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategoryFilter === cat
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'Todas las Categorías' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map(recipe => (
              <div 
                key={recipe.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-gray-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                      {recipe.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditRecipe(recipe)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar Receta"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id, recipe.name)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar Receta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-black text-gray-900 text-base leading-snug mb-1">
                    {recipe.name}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-[#5a0606] font-bold mb-3">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Rendimiento Base: {recipe.baseYield} {recipe.yieldUnit}</span>
                  </div>

                  {recipe.notes && (
                    <p className="text-xs text-gray-500 mb-3 italic">
                      &ldquo;{recipe.notes}&rdquo;
                    </p>
                  )}

                  {/* Ingredients Breakdown */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-4">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">
                      Fórmula de Materia Prima ({recipe.ingredients.length} insumos):
                    </p>
                    <ul className="space-y-1.5 text-xs">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center justify-between text-gray-700">
                          <span className="truncate pr-2">{ing.insumoName}</span>
                          <span className="font-bold shrink-0 text-gray-900">
                            {ing.quantity} {ing.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPlannedQuantities({ [recipe.id]: recipe.baseYield * 5 });
                    setSubTab('calculadora');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-[#5a0606] hover:text-white text-gray-800 font-bold text-xs transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calcular Producción con esta Receta</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HISTORIAL DE ORDENES DE PRODUCCION                                     */}
      {/* ========================================================================= */}
      {subTab === 'historial' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-black text-gray-900 text-base">Historial de Órdenes de Producción</h3>
              <p className="text-xs text-gray-500">Registro cronológico de lotes producidos y deducciones de stock</p>
            </div>
          </div>

          {productionOrders.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 font-bold text-sm">No hay órdenes de producción registradas</p>
              <p className="text-xs text-gray-400 mt-1">
                Usa la calculadora para generar y registrar una nueva orden de producción.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {productionOrders.map(order => (
                <div 
                  key={order.id}
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-base text-[#5a0606]">{order.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        order.status === 'completado' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status === 'completado' ? 'Completado' : 'Borrador'}
                      </span>
                      {order.descontadoStock && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                          Stock Descontado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleString('es-EC')}
                      </span>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1 text-gray-300 hover:text-red-600 rounded-lg transition-colors"
                        title="Eliminar orden"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    <span className="font-bold">Responsable:</span> {order.responsable || 'Cocina'}
                    {order.notes && <span className="ml-3 italic">&bull; &ldquo;{order.notes}&rdquo;</span>}
                  </div>

                  {/* Items Produced */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800">
                        {item.plannedQuantity}x {item.recipeName}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  {!order.descontadoStock && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleApplyDeduction(order.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Descontar Insumos del Stock Ahora</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVA / EDITAR RECETA CON EXACTITUD                                */}
      {/* ========================================================================= */}
      {isRecipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-[#5a0606]" />
                  {editingRecipe ? 'Editar Receta / Fórmula' : 'Crear Nueva Receta / Fórmula'}
                </h3>
                <p className="text-xs text-gray-500">
                  Define los valores exactos de materia prima para la escala de producción
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRecipeModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Receta *</label>
                  <input
                    type="text"
                    required
                    value={recipeFormName}
                    onChange={e => setRecipeFormName(e.target.value)}
                    placeholder="Ej. Empanada de Verde con Queso (Tuca)"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5a0606] outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={recipeFormCategory}
                    onChange={e => setRecipeFormCategory(e.target.value)}
                    placeholder="Ej. Empanadas de Verde, Bebidas..."
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5a0606] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rendimiento Base (Cantidad) *</label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="0.1"
                    value={recipeFormYield}
                    onChange={e => setRecipeFormYield(parseFloat(e.target.value) || 1)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5a0606] outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unidad de Rendimiento *</label>
                  <input
                    type="text"
                    required
                    value={recipeFormYieldUnit}
                    onChange={e => setRecipeFormYieldUnit(e.target.value)}
                    placeholder="empanadas, vasos, litros..."
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5a0606] outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notas / Procedimiento (Opcional)</label>
                <textarea
                  rows={2}
                  value={recipeFormNotes}
                  onChange={e => setRecipeFormNotes(e.target.value)}
                  placeholder="Detalles sobre temperatura, sazón o preparación..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#5a0606] outline-none"
                />
              </div>

              {/* Ingredients List with exact values */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-gray-900 uppercase tracking-wide">
                    Ingredientes y Materia Prima (Valores Exactos)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="flex items-center gap-1 text-xs font-bold text-[#5a0606] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Insumo</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {recipeFormIngredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
                      {/* Name input with datalist from stock insumos */}
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          list="insumos-suggestions"
                          value={ing.insumoName}
                          onChange={e => handleIngredientChange(idx, 'insumoName', e.target.value)}
                          placeholder="Nombre del insumo / materia prima"
                          className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#5a0606] outline-none"
                        />
                      </div>

                      {/* Quantity input */}
                      <div className="w-24">
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0.001"
                          value={ing.quantity}
                          onChange={e => handleIngredientChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="Cant."
                          className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white font-black text-center focus:ring-2 focus:ring-[#5a0606] outline-none"
                        />
                      </div>

                      {/* Unit input */}
                      <div className="w-24">
                        <input
                          type="text"
                          required
                          value={ing.unit}
                          onChange={e => handleIngredientChange(idx, 'unit', e.target.value)}
                          placeholder="libras, kg..."
                          className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#5a0606] outline-none text-center"
                        />
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <datalist id="insumos-suggestions">
                  {insumos.map(ins => (
                    <option key={ins.id} value={ins.name} />
                  ))}
                </datalist>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecipeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#5a0606] hover:bg-[#450505] text-white font-black text-xs shadow-md shadow-[#5a0606]/20 transition-all"
                >
                  Guardar Receta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
