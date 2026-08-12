const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

// 1. Add handleDeleteClosure function
const deleteFn = `  const handleDeleteClosure = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cierre? Esta acción no se puede deshacer.')) return;
    if (!isSupabaseConfigured || !supabase) {
      alert('Se necesita conectar a Supabase para realizar esta acción.');
      return;
    }
    try {
      const { error } = await supabase.from('cierres_diarios').delete().eq('id', id);
      if (error) throw error;
      setClosures(prev => prev.filter(c => c.id !== id));
      alert('Cierre eliminado correctamente.');
    } catch (err: any) {
      alert('Error al eliminar el cierre: ' + err.message);
    }
  };

  // Recalculate current stock based on orders`;
code = code.replace('  // Recalculate current stock based on orders', deleteFn);


// 2. Change invDetails logic
const invDetailsTarget = `                         const invDetails = Array.isArray(closure.inventario) 
                           ? closure.inventario.map((item: any) => ({
                               ...item,
                               sold: soldMap[item.id] || 0
                             })).filter((i: any) => i.initialStock > 0 || i.sold > 0)
                           : [];
                         return (
                           <>`;

const invDetailsReplace = `                         const invDetailsMap = new Map();
                         if (Array.isArray(closure.inventario)) {
                           closure.inventario.forEach((item: any) => {
                             invDetailsMap.set(item.id, { ...item, sold: soldMap[item.id] || 0 });
                           });
                         }
                         Object.keys(soldMap).forEach(id => {
                           if (!invDetailsMap.has(id)) {
                              const invItem = inventory.find(i => i.id === id);
                              invDetailsMap.set(id, {
                                 id,
                                 name: invItem ? invItem.name : id,
                                 initialStock: 0,
                                 currentStock: 0,
                                 sold: soldMap[id]
                              });
                           }
                         });
                         const invDetails = Array.from(invDetailsMap.values()).filter((i: any) => i.initialStock > 0 || i.sold > 0);
                         return (
                           <>`;

code = code.replace(invDetailsTarget, invDetailsReplace);


// 3. Add Delete Button in Header
const headerTarget = `                      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                        <h3 className="text-2xl font-black">{closure.fecha}</h3>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-500 uppercase">Total Ventas</p>
                          <p className="text-3xl font-black text-green-700">$\\{Number(closure.total_ventas).toFixed(2)\\}</p>
                        </div>
                      </div>`.replace(/\\/g, '');

const headerReplace = `                      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                        <div className="flex flex-col gap-2">
                           <h3 className="text-2xl font-black">{closure.fecha}</h3>
                           <button onClick={() => handleDeleteClosure(closure.id)} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md self-start transition-colors">
                             Eliminar Cierre
                           </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-500 uppercase">Total Ventas</p>
                          <p className="text-3xl font-black text-green-700">$\\{Number(closure.total_ventas).toFixed(2)\\}</p>
                        </div>
                      </div>`.replace(/\\/g, '');

code = code.replace(headerTarget, headerReplace);

fs.writeFileSync('src/pages/Inventario.tsx', code);
