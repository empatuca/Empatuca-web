const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

// 1. Add `fecha` to `gastoForm`
const stateTarget = `  const [gastoForm, setGastoForm] = useState({
    descripcion: '',
    monto: '',
    categoria: 'Operativo',
    socio: 'Socio 1'
  });`;
const stateReplacement = `  const [gastoForm, setGastoForm] = useState({
    descripcion: '',
    monto: '',
    categoria: 'Operativo',
    socio: 'Socio 1',
    fecha: new Date().toISOString().split('T')[0]
  });
  
  // Date filter for UI
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);`;
code = code.replace(stateTarget, stateReplacement);

// 2. Modify fetchGastos to listen to `selectedDate`
const fetchGastosTarget = `      const fetchGastos = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data, error } = await supabase
          .from('gastos_diarios')
          .select('*')
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false });`;
const fetchGastosReplacement = `      const fetchGastos = async () => {
        const startOfDay = new Date(selectedDate);
        // Correct timezone offset issues for local date
        startOfDay.setMinutes(startOfDay.getMinutes() + startOfDay.getTimezoneOffset());
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from('gastos_diarios')
          .select('*')
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });`;
code = code.replace(fetchGastosTarget, fetchGastosReplacement);

// We need to make `fetchGastos` depend on `selectedDate`. So we will extract it out of the `useEffect` or just add `selectedDate` to the dependency array.
const useEffectTarget = `  }, [isSupabaseConfigured]);`;
const useEffectReplacement = `  }, [isSupabaseConfigured, selectedDate]);`;
code = code.replace(useEffectTarget, useEffectReplacement);

// 3. Fix payload in handleAddGasto
const payloadTarget = `      const payload = {
        descripcion: gastoForm.descripcion,
        monto: parseFloat(gastoForm.monto),
        categoria: gastoForm.categoria === 'Pago Socios' ? \`Pago Socios (\${gastoForm.socio})\` : gastoForm.categoria,
        comprobante_url
      };`;
const payloadReplacement = `
      // Build a correct date based on selected date + current time to avoid timezone offset shifts to the wrong day
      const now = new Date();
      const expenseDate = new Date(gastoForm.fecha);
      expenseDate.setMinutes(expenseDate.getMinutes() + expenseDate.getTimezoneOffset());
      expenseDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

      const payload = {
        descripcion: gastoForm.descripcion,
        monto: parseFloat(gastoForm.monto),
        categoria: gastoForm.categoria === 'Pago Socios' ? \`Pago Socios (\${gastoForm.socio})\` : gastoForm.categoria,
        comprobante_url,
        created_at: expenseDate.toISOString()
      };`;
code = code.replace(payloadTarget, payloadReplacement);

// 4. Reset form properly
const resetTarget = `      setGastoForm({ descripcion: '', monto: '', categoria: 'Operativo', socio: 'Socio 1' });`;
const resetReplacement = `      setGastoForm({ descripcion: '', monto: '', categoria: 'Operativo', socio: 'Socio 1', fecha: new Date().toISOString().split('T')[0] });`;
code = code.replace(resetTarget, resetReplacement);

// 5. Fix $81.00 bug - Filter totalIngresos strictly by the `selectedDate`
const totalsTarget = `  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
  const totalIngresos = orders.filter(o => o.estado !== 'cancelado' && o.estado !== 'rechazado' && o.estado !== 'archivado').reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const saldoNeto = totalIngresos - totalGastos;`;

const totalsReplacement = `  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
  
  const totalIngresos = orders.filter(o => {
    if (o.estado === 'cancelado' || o.estado === 'rechazado' || o.estado === 'archivado') return false;
    // Check if the order belongs to the selectedDate
    try {
      const orderDate = new Date(o.created_at);
      const orderDateString = new Date(orderDate.getTime() - (orderDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      return orderDateString === selectedDate;
    } catch(e) { return false; }
  }).reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  
  const saldoNeto = totalIngresos - totalGastos;`;
code = code.replace(totalsTarget, totalsReplacement);


// 6. Add Date input in the UI form
const formCategoryTarget = `                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Categoría</label>`;
const formCategoryReplacement = `                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Fecha del Gasto</label>
                        <input required type="date" value={gastoForm.fecha} onChange={e => setGastoForm({...gastoForm, fecha: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-gray-700" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Categoría</label>`;
code = code.replace(formCategoryTarget, formCategoryReplacement);

// 7. Add Date filter in the history section
const historyTitleTarget = `                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Historial de Gastos de Hoy</h3>`;
const historyTitleReplacement = `                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Historial de Gastos</h3>
                      <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none" />
                    </div>`;
code = code.replace(historyTitleTarget, historyTitleReplacement);

const balanceTitleTarget = `<h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Resumen de Hoy</h3>`;
const balanceTitleReplacement = `<h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Balance: {selectedDate}</h3>`;
code = code.replace(balanceTitleTarget, balanceTitleReplacement);


fs.writeFileSync('src/pages/Caja.tsx', code);
console.log("Patched fixes successfully!");
