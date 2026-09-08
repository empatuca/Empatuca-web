const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

const submitLogicTarget = `  return (`;
const submitLogicReplacement = `
  const handleAddGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gastoForm.descripcion || !gastoForm.monto) return;
    
    setIsUploading(true);
    let comprobante_url = '';
    
    try {
      if (comprobanteFile && supabase) {
        const fileExt = comprobanteFile.name.split('.').pop();
        const fileName = \`\${Math.random()}.\${fileExt}\`;
        const filePath = \`gastos/\${fileName}\`;
        
        const { error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(filePath, comprobanteFile);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('comprobantes')
          .getPublicUrl(filePath);
          
        comprobante_url = urlData.publicUrl;
      }
      
      const payload = {
        descripcion: gastoForm.descripcion,
        monto: parseFloat(gastoForm.monto),
        categoria: gastoForm.categoria === 'Pago Socios' ? \`Pago Socios (\${gastoForm.socio})\` : gastoForm.categoria,
        comprobante_url
      };
      
      if (supabase) {
        const { data, error } = await supabase.from('gastos_diarios').insert([payload]).select();
        if (error) throw error;
        if (data) setGastos([data[0], ...gastos]);
      } else {
         // Local fallback
         setGastos([{...payload, id: Math.random().toString(), created_at: new Date().toISOString()}, ...gastos]);
      }
      
      setIsAddingGasto(false);
      setGastoForm({ descripcion: '', monto: '', categoria: 'Operativo', socio: 'Socio 1' });
      setComprobanteFile(null);
    } catch (err: any) {
      alert("Error al guardar gasto. Es posible que debas crear la tabla 'gastos_diarios' en Supabase. Detalles: " + err.message);
    }
    setIsUploading(false);
  };

  const getCategoryColor = (cat: string) => {
    if (cat.includes('Operativo')) return 'bg-slate-100 text-slate-700 border-slate-300';
    if (cat.includes('Servicios Básicos')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (cat.includes('Producción')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (cat.includes('Socios')) return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300';
    return 'bg-gray-100 text-gray-700';
  };

  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
  const totalIngresos = orders.filter(o => o.estado !== 'cancelado' && o.estado !== 'rechazado' && o.estado !== 'archivado').reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const saldoNeto = totalIngresos - totalGastos;

  return (`;

code = code.replace(submitLogicTarget, submitLogicReplacement);

const uiTarget = `{/* GASTOS UI HERE */}`;
const uiReplacement = `
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                 {/* BALANCE CARD */}
                 <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Resumen de Hoy</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Ingresos (Ventas)</span>
                        <span className="text-green-600 font-black text-xl">+\${totalIngresos.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Egresos (Gastos)</span>
                        <span className="text-red-500 font-black text-xl">-\${totalGastos.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-800 font-black uppercase">Saldo Neto</span>
                        <span className={\`font-black text-3xl \${saldoNeto >= 0 ? 'text-green-700' : 'text-red-600'}\`}>
                          \${saldoNeto.toFixed(2)}
                        </span>
                      </div>
                    </div>
                 </div>

                 {/* ADD GASTO FORM */}
                 <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-red-500" /> Registrar Gasto
                      </h3>
                    </div>

                    <form onSubmit={handleAddGasto} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Descripción</label>
                        <input 
                          required
                          value={gastoForm.descripcion}
                          onChange={e => setGastoForm({...gastoForm, descripcion: e.target.value})}
                          placeholder="Ej. Compra de harina"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Monto ($)</label>
                        <input 
                          required
                          type="number"
                          step="0.01"
                          min="0"
                          value={gastoForm.monto}
                          onChange={e => setGastoForm({...gastoForm, monto: e.target.value})}
                          placeholder="0.00"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-black text-red-600 text-xl"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Categoría</label>
                        <select 
                          value={gastoForm.categoria}
                          onChange={e => setGastoForm({...gastoForm, categoria: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="Operativo">Gasto Operativo (Normal)</option>
                          <option value="Producción">Producción e Insumos</option>
                          <option value="Servicios Básicos">Servicios Básicos</option>
                          <option value="Pago Socios">Pago a Socios</option>
                        </select>
                      </div>

                      {gastoForm.categoria === 'Pago Socios' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Seleccionar Socio</label>
                          <select 
                            value={gastoForm.socio}
                            onChange={e => setGastoForm({...gastoForm, socio: e.target.value})}
                            className="w-full bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-900 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                          >
                            <option value="Socio 1">Socio 1</option>
                            <option value="Socio 2">Socio 2</option>
                            <option value="Socio 3">Socio 3</option>
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Comprobante / Factura (Opcional)</label>
                        <label className="flex items-center justify-center gap-2 w-full bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl px-4 py-4 text-sm font-bold text-gray-500 cursor-pointer transition-colors">
                           <Upload className="w-5 h-5" />
                           {comprobanteFile ? comprobanteFile.name : 'Subir imagen o PDF'}
                           <input 
                             type="file" 
                             accept="image/*,.pdf"
                             onChange={e => setComprobanteFile(e.target.files?.[0] || null)}
                             className="hidden"
                           />
                        </label>
                      </div>

                      <Button 
                        type="submit"
                        disabled={isUploading}
                        className="w-full h-12 mt-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-md flex items-center justify-center"
                      >
                        {isUploading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : 'Guardar Gasto'}
                      </Button>
                    </form>
                 </div>
              </div>

              <div className="lg:col-span-2">
                 <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 h-full">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Historial de Gastos de Hoy</h3>
                    
                    {gastos.length === 0 ? (
                      <div className="text-center py-20">
                        <Wallet className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-gray-400 uppercase">Sin Gastos</h4>
                        <p className="text-gray-400 text-sm mt-2">Aún no has registrado egresos el día de hoy.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {gastos.map(gasto => (
                          <div key={gasto.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow bg-gray-50">
                            <div className="flex flex-col gap-2">
                               <div className="flex items-center gap-3">
                                 <span className={\`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border \${getCategoryColor(gasto.categoria)}\`}>
                                   {gasto.categoria}
                                 </span>
                                 <span className="text-xs text-gray-400 font-bold">
                                   {new Date(gasto.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </span>
                               </div>
                               <p className="font-bold text-gray-800 text-lg leading-tight">{gasto.descripcion}</p>
                               {gasto.comprobante_url && (
                                 <a href={gasto.comprobante_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 w-fit">
                                   <Receipt className="w-3 h-3" /> Ver comprobante
                                 </a>
                               )}
                            </div>
                            <div className="text-right pl-4">
                               <span className="font-black text-2xl text-red-600 block">-\${Number(gasto.monto).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
              </div>
            </div>`;

code = code.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/pages/Caja.tsx', code);
console.log("Patched UI logic");
