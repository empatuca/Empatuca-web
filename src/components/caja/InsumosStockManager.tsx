import React, { useState, useEffect, useMemo } from "react";
import { 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Edit3, 
  Trash2, 
  Layers, 
  Boxes, 
  RefreshCw,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  X,
  ChefHat
} from "lucide-react";
import { InsumoItem, InsumoCategory } from "../../types";
import { 
  getLocalInsumos, 
  updateInsumoStock, 
  adjustInsumoStock, 
  addInsumo, 
  editInsumo, 
  deleteInsumo, 
  subscribeInsumos,
  initInsumosSync
} from "../../lib/insumosStorage";

const CATEGORY_CONFIG: Record<InsumoCategory, { label: string; icon: string; bg: string; text: string; border: string }> = {
  descartables: {
    label: "Descartables & Empaques",
    icon: "📦",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200"
  },
  materia_prima: {
    label: "Materia Prima & Producción",
    icon: "🥩",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200"
  },
  bebidas: {
    label: "Bebidas & Consumibles",
    icon: "🥤",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200"
  },
  otros: {
    label: "Otros Insumos",
    icon: "🏷️",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200"
  }
};

const COMMON_UNITS = [
  "unidades",
  "libras",
  "kg",
  "litros",
  "paquetes",
  "pliegos",
  "racimos",
  "cajas",
  "gramos"
];

interface InsumosStockManagerProps {
  onNavigateToProduccion?: () => void;
}

export default function InsumosStockManager({ onNavigateToProduccion }: InsumosStockManagerProps = {}) {
  const [items, setItems] = useState<InsumoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<InsumoCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'abastecido' | 'alerta' | 'agotado'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InsumoItem | null>(null);
  const [reabastecerItem, setReabastecerItem] = useState<InsumoItem | null>(null);
  const [reabastecerQty, setReabastecerQty] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'materia_prima' as InsumoCategory,
    currentStock: '',
    minStock: '',
    unit: 'unidades',
    notes: ''
  });

  useEffect(() => {
    setItems(getLocalInsumos());
    initInsumosSync().then(syncItems => setItems([...syncItems]));
    const unsubscribe = subscribeInsumos(updated => {
      setItems([...updated]);
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    let abastecidos = 0;
    let alertas = 0;
    let agotados = 0;

    items.forEach(i => {
      if (i.currentStock <= 0) {
        agotados++;
      } else if (i.currentStock <= i.minStock) {
        alertas++;
      } else {
        abastecidos++;
      }
    });

    return {
      total: items.length,
      abastecidos,
      alertas,
      agotados
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Status filter
      if (selectedStatus === 'agotado' && item.currentStock > 0) return false;
      if (selectedStatus === 'alerta' && (item.currentStock <= 0 || item.currentStock > item.minStock)) return false;
      if (selectedStatus === 'abastecido' && item.currentStock <= item.minStock) return false;

      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return item.name.toLowerCase().includes(query) || (item.notes && item.notes.toLowerCase().includes(query));
      }

      return true;
    });
  }, [items, selectedCategory, selectedStatus, searchTerm]);

  // Group filtered items by category if showing 'all'
  const groupedItems = useMemo(() => {
    const groups: Record<InsumoCategory, InsumoItem[]> = {
      descartables: [],
      materia_prima: [],
      bebidas: [],
      otros: []
    };

    filteredItems.forEach(item => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      } else {
        groups.otros.push(item);
      }
    });

    return groups;
  }, [filteredItems]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: selectedCategory !== 'all' ? selectedCategory : 'materia_prima',
      currentStock: '',
      minStock: '',
      unit: 'unidades',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: InsumoItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      unit: item.unit,
      notes: item.notes || ''
    });
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const currentVal = Math.max(0, parseFloat(formData.currentStock) || 0);
    const minVal = Math.max(0, parseFloat(formData.minStock) || 0);

    if (editingItem) {
      editInsumo(editingItem.id, {
        name: formData.name.trim(),
        category: formData.category,
        currentStock: currentVal,
        minStock: minVal,
        unit: formData.unit.trim().toLowerCase(),
        notes: formData.notes.trim()
      });
      setEditingItem(null);
    } else {
      addInsumo({
        name: formData.name.trim(),
        category: formData.category,
        currentStock: currentVal,
        minStock: minVal,
        unit: formData.unit.trim().toLowerCase(),
        notes: formData.notes.trim()
      });
      setShowAddModal(false);
    }
  };

  const handleApplyReabastecer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reabastecerItem) return;
    const addQty = parseFloat(reabastecerQty);
    if (!isNaN(addQty) && addQty > 0) {
      adjustInsumoStock(reabastecerItem.id, addQty);
    }
    setReabastecerItem(null);
    setReabastecerQty('');
  };

  const getItemStatus = (item: InsumoItem) => {
    if (item.currentStock <= 0) {
      return {
        label: 'Agotado',
        color: 'text-red-700 bg-red-50 border-red-200',
        badge: '🔴 Agotado'
      };
    }
    if (item.currentStock <= item.minStock) {
      return {
        label: 'Por Agotarse',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
        badge: '🟡 Por Agotar'
      };
    }
    return {
      label: 'Abastecido',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badge: '🟢 Abastecido'
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#5a0606]/10 text-[#5a0606]">
              <Boxes className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Stock de Insumos & Materia Prima
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Control de inventario operativo: descartables, insumos de cocina y materia prima para producción.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onNavigateToProduccion && (
            <button
              onClick={onNavigateToProduccion}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-950 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-md shadow-amber-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ChefHat className="w-4 h-4" /> Recetas & Producción
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 bg-[#5a0606] hover:bg-[#430404] text-white px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-[#5a0606]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Agregar Insumo
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => setSelectedStatus('all')}
          className={`cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border transition-all ${selectedStatus === 'all' ? 'border-gray-900 ring-2 ring-gray-900/10 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Insumos</span>
            <Layers className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats.total}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Registrados en catálogo</p>
        </div>

        <div 
          onClick={() => setSelectedStatus('abastecido')}
          className={`cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border transition-all ${selectedStatus === 'abastecido' ? 'border-emerald-600 ring-2 ring-emerald-600/10 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Abastecidos</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.abastecidos}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Stock seguro y suficiente</p>
        </div>

        <div 
          onClick={() => setSelectedStatus('alerta')}
          className={`cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border transition-all ${selectedStatus === 'alerta' ? 'border-amber-500 ring-2 ring-amber-500/10 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Por Agotarse</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{stats.alertas}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Bajo el umbral mínimo</p>
        </div>

        <div 
          onClick={() => setSelectedStatus('agotado')}
          className={`cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border transition-all ${selectedStatus === 'agotado' ? 'border-red-600 ring-2 ring-red-600/10 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
        >
          <div className="flex items-center justify-between text-red-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Agotados</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600">{stats.agotados}</div>
          <p className="text-[11px] text-gray-500 font-medium mt-1">Requiere compra urgente</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            onClick={() => setSelectedCategory('descartables')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'descartables'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            📦 Descartables ({items.filter(i => i.category === 'descartables').length})
          </button>
          <button
            onClick={() => setSelectedCategory('materia_prima')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'materia_prima'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            🥩 Materia Prima ({items.filter(i => i.category === 'materia_prima').length})
          </button>
          <button
            onClick={() => setSelectedCategory('bebidas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'bebidas'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            🥤 Bebidas ({items.filter(i => i.category === 'bebidas').length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar insumo..."
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5a0606] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Stock Content: Grouped by Category */}
      <div className="space-y-8">
        {(['descartables', 'materia_prima', 'bebidas', 'otros'] as InsumoCategory[]).map(catKey => {
          const catItems = selectedCategory === 'all' 
            ? groupedItems[catKey] 
            : (selectedCategory === catKey ? filteredItems : []);

          if (catItems.length === 0) return null;
          const conf = CATEGORY_CONFIG[catKey];

          return (
            <div key={catKey} className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{conf.icon}</span>
                  <h3 className="font-black text-base sm:text-lg text-gray-900 tracking-tight">
                    {conf.label}
                  </h3>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {catItems.length}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {catItems.map(item => {
                  const status = getItemStatus(item);
                  const isDepleted = item.currentStock <= 0;
                  const isAlert = item.currentStock <= item.minStock && !isDepleted;

                  return (
                    <div 
                      key={item.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 rounded-2xl px-2 transition-colors"
                    >
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                            {item.name}
                          </h4>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${status.color}`}>
                            {status.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>Mínimo requerido: <strong className="text-gray-700">{item.minStock} {item.unit}</strong></span>
                          {item.notes && (
                            <span className="text-gray-400 truncate max-w-xs italic">
                              • {item.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Quantity & Controls */}
                      <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                        {/* Current Stock Display */}
                        <div className="text-left md:text-right min-w-[100px]">
                          <div className={`text-xl sm:text-2xl font-black ${
                            isDepleted ? 'text-red-600' : isAlert ? 'text-amber-600' : 'text-gray-900'
                          }`}>
                            {item.currentStock}{' '}
                            <span className="text-xs font-bold text-gray-400 uppercase">{item.unit}</span>
                          </div>
                        </div>

                        {/* Quick +/- Buttons */}
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => adjustInsumoStock(item.id, -1)}
                            disabled={item.currentStock <= 0}
                            title="Restar 1"
                            className="w-8 h-8 rounded-lg bg-white text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center font-bold shadow-xs transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustInsumoStock(item.id, 1)}
                            title="Sumar 1"
                            className="w-8 h-8 rounded-lg bg-white text-gray-700 hover:bg-gray-200 flex items-center justify-center font-bold shadow-xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Reabastecer Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setReabastecerItem(item);
                            setReabastecerQty('');
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                          title="Registrar reabastecimiento o compra"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Ingresar</span>
                        </button>

                        {/* Edit & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar insumo"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar "${item.name}" del inventario de insumos?`)) {
                                deleteInsumo(item.id);
                              }
                            }}
                            className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar insumo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
            <Boxes className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-gray-700">No se encontraron insumos</h4>
            <p className="text-xs text-gray-400 mt-1">
              Prueba cambiando los filtros de categoría, estado o tu búsqueda.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#5a0606] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Nuevo Insumo
            </button>
          </div>
        )}
      </div>

      {/* MODAL: AGREGAR O EDITAR INSUMO */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="font-black text-xl text-gray-900">
                {editingItem ? 'Editar Insumo' : 'Nuevo Insumo de Producción'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:bg-gray-100 hover:text-gray-900 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Nombre del Insumo / Materia Prima *
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Fundas para empanadas, Queso manaba..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5a0606]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as InsumoCategory })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5a0606]"
                >
                  <option value="descartables">📦 Descartables & Empaques</option>
                  <option value="materia_prima">🥩 Materia Prima & Producción</option>
                  <option value="bebidas">🥤 Bebidas & Consumibles</option>
                  <option value="otros">🏷️ Otros Insumos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Stock Actual *
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    min="0"
                    value={formData.currentStock}
                    onChange={e => setFormData({ ...formData, currentStock: e.target.value })}
                    placeholder="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5a0606]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Stock Mínimo (Alerta) *
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    min="0"
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                    placeholder="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-black text-amber-700 focus:outline-none focus:ring-2 focus:ring-[#5a0606]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Unidad de Medida *
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5a0606]"
                  >
                    {COMMON_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Notas u Observaciones (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej. Comprar en mercado central, proveedor Don Juan..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5a0606]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-black text-white bg-[#5a0606] hover:bg-black rounded-xl transition-colors uppercase tracking-wider shadow-md"
                >
                  {editingItem ? 'Guardar Cambios' : 'Crear Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REABASTECER RÁPIDO */}
      {reabastecerItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Ingreso de Mercadería
                </span>
                <h3 className="font-black text-lg text-gray-900 mt-1">{reabastecerItem.name}</h3>
              </div>
              <button 
                onClick={() => setReabastecerItem(null)}
                className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyReabastecer} className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold">Stock Actual:</span>
                <span className="text-sm font-black text-gray-800">
                  {reabastecerItem.currentStock} {reabastecerItem.unit}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block">
                  Cantidad a Sumar (+ {reabastecerItem.unit})
                </label>
                <input
                  autoFocus
                  required
                  type="number"
                  step="any"
                  min="0.01"
                  value={reabastecerQty}
                  onChange={e => setReabastecerQty(e.target.value)}
                  placeholder={`Ej. 10`}
                  className="w-full bg-emerald-50/50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-3 text-lg font-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {reabastecerQty && !isNaN(parseFloat(reabastecerQty)) && (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg text-center">
                  Nuevo stock resultante: {(reabastecerItem.currentStock + parseFloat(reabastecerQty)).toFixed(1)} {reabastecerItem.unit}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setReabastecerItem(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors uppercase tracking-wider shadow-md"
                >
                  Sumar al Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
