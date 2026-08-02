const fs = require('fs');
let code = fs.readFileSync('src/pages/Cocina.tsx', 'utf8');

// Add a state for view mode
code = code.replace(
  'const [loading, setLoading] = useState(true);',
  'const [loading, setLoading] = useState(true);\n  const [viewMode, setViewMode] = useState<"activos" | "completados">("activos");'
);

// Filter sortedOrders based on view mode
// 'activos' = nuevo, en_preparacion, pendiente_caja
// 'completados' = listo, entregado
code = code.replace(
  'const sortedOrders = [...orders].sort((a, b) => {',
  `const filteredOrders = orders.filter(o => viewMode === "activos" ? (o.estado !== 'listo' && o.estado !== 'entregado') : (o.estado === 'listo' || o.estado === 'entregado'));
  const sortedOrders = [...filteredOrders].sort((a, b) => {`
);

// Add the button to toggle views in the header
code = code.replace(
  '<h1 className="text-xl font-black uppercase tracking-tight">Vista de Cocina</h1>\n          </div>',
  `<h1 className="text-xl font-black uppercase tracking-tight">Vista de Cocina</h1>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setViewMode("activos")} className={\`px-4 py-2 rounded-lg text-sm font-bold transition-colors \${viewMode === 'activos' ? 'bg-[#fac124] text-black' : 'bg-white/10 text-white hover:bg-white/20'}\`}>Activos</button>
             <button onClick={() => setViewMode("completados")} className={\`px-4 py-2 rounded-lg text-sm font-bold transition-colors \${viewMode === 'completados' ? 'bg-[#fac124] text-black' : 'bg-white/10 text-white hover:bg-white/20'}\`}>Completados</button>
          </div>`
);

fs.writeFileSync('src/pages/Cocina.tsx', code);
