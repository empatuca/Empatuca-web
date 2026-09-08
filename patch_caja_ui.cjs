const fs = require('fs');
let code = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

const tabTarget = `<div className="container mx-auto p-4 md:p-8">`;
const tabReplacement = `<div className="container mx-auto p-4 md:p-8">
        {/* TABS COMPONENT */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('ingresos')}
            className={\`flex-1 py-4 px-6 rounded-2xl font-black text-lg tracking-wide uppercase transition-all \${activeTab === 'ingresos' ? 'bg-green-600 text-white shadow-xl shadow-green-200' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}\`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowUpCircle className="w-6 h-6" /> Ingresos (Pedidos)
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('gastos')}
            className={\`flex-1 py-4 px-6 rounded-2xl font-black text-lg tracking-wide uppercase transition-all \${activeTab === 'gastos' ? 'bg-red-500 text-white shadow-xl shadow-red-200' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}\`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowDownCircle className="w-6 h-6" /> Egresos (Gastos)
            </div>
          </button>
        </div>

        {activeTab === 'ingresos' && (
          <div>`;
          
code = code.replace(tabTarget, tabReplacement);

// Close the activeTab === 'ingresos' block and add the 'gastos' block.
const endOfIngresosTarget = `      {showAllOrders && (`;
const endOfIngresosReplacement = `      </div>
        )}

        {activeTab === 'gastos' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* GASTOS UI HERE */}
          </div>
        )}

      {showAllOrders && (`;

code = code.replace(endOfIngresosTarget, endOfIngresosReplacement);

fs.writeFileSync('src/pages/Caja.tsx', code);
console.log("Patched tabs wrapper");
