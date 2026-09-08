const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

// Add new state variables
const stateTarget = `  // Date filter for UI
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);`;
const stateReplacement = `  // Date filter for UI
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [ingresosDelDia, setIngresosDelDia] = useState(0);
  const [globalBalance, setGlobalBalance] = useState(0);`;
code = code.replace(stateTarget, stateReplacement);

// Replace fetchGastos with fetchData
const fetchGastosTarget = `      const fetchGastos = async () => {
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
          .order('created_at', { ascending: false });
        if (!error && data) {
          setGastos(data);
        }
      };
      fetchGastos();`;

const fetchGastosReplacement = `      const fetchData = async () => {
        const startOfDay = new Date(selectedDate);
        // Correct timezone offset issues for local date
        startOfDay.setMinutes(startOfDay.getMinutes() + startOfDay.getTimezoneOffset());
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);

        // 1. Fetch Gastos for selected date
        const { data: gastosData, error } = await supabase
          .from('gastos_diarios')
          .select('*')
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .order('created_at', { ascending: false });
        if (!error && gastosData) {
          setGastos(gastosData);
        }

        // 2. Fetch Ingresos for selected date
        const { data: ingresosData } = await supabase
          .from('pedidos')
          .select('total')
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .not('estado', 'in', '("cancelado","rechazado","archivado")');
        const sumIngresos = (ingresosData || []).reduce((sum, o) => sum + Number(o.total || 0), 0);
        setIngresosDelDia(sumIngresos);

        // 3. Fetch Global Balance (from Sept 1 + 336.25 base)
        const septStart = '2026-09-01T00:00:00Z';
        const { data: globalPedidos } = await supabase
          .from('pedidos')
          .select('total')
          .gte('created_at', septStart)
          .not('estado', 'in', '("cancelado","rechazado","archivado")');
        const sumGlobalPedidos = (globalPedidos || []).reduce((sum, o) => sum + Number(o.total || 0), 0);

        const { data: globalGastos } = await supabase
          .from('gastos_diarios')
          .select('monto')
          .gte('created_at', septStart);
        const sumGlobalGastos = (globalGastos || []).reduce((sum, o) => sum + Number(o.monto || 0), 0);
        
        setGlobalBalance(336.25 + sumGlobalPedidos - sumGlobalGastos);
      };
      fetchData();`;
code = code.replace(fetchGastosTarget, fetchGastosReplacement);

// Replace totalsTarget
const totalsTarget = `  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
  
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

const totalsReplacement = `  const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
  const saldoNeto = ingresosDelDia - totalGastos;`;
code = code.replace(totalsTarget, totalsReplacement);


// Update the UI to render ingresosDelDia and also add the Global Balance card
const uiTarget = `                 {/* BALANCE CARD */}
                 <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Balance: {selectedDate}</h3>
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
                 </div>`;

const uiReplacement = `                 {/* GLOBAL BALANCE CARD */}
                 <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-xl border border-gray-700 text-white">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> Saldo General Acumulado
                    </h3>
                    <p className="text-[10px] text-gray-400 mb-4 leading-tight">Calculado desde Sept 1, incluyendo base de $336.25</p>
                    <div className="flex items-center gap-3">
                       <span className={\`font-black text-4xl \${globalBalance >= 0 ? 'text-green-400' : 'text-red-400'}\`}>
                         \${globalBalance.toFixed(2)}
                       </span>
                    </div>
                 </div>

                 {/* BALANCE CARD */}
                 <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Balance del día: {selectedDate}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Ingresos (Ventas)</span>
                        <span className="text-green-600 font-black text-xl">+\${ingresosDelDia.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Egresos (Gastos)</span>
                        <span className="text-red-500 font-black text-xl">-\${totalGastos.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-800 font-black uppercase">Saldo Diario</span>
                        <span className={\`font-black text-3xl \${saldoNeto >= 0 ? 'text-green-700' : 'text-red-600'}\`}>
                          \${saldoNeto.toFixed(2)}
                        </span>
                      </div>
                    </div>
                 </div>`;

code = code.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/pages/Caja.tsx', code);
console.log("Patched Caja.tsx for specific issues.");
