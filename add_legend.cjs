const fs = require('fs');
let content = fs.readFileSync('src/components/caja/CajaDashboard.tsx', 'utf8');

const target = `              {expenseBreakdown.servicios.total > 0 && (
                <div className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-bold text-gray-700">Servicios Básicos</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-gray-900">\${expenseBreakdown.servicios.total.toFixed(2)}</span>
                    <span className="text-gray-400 text-[10px] ml-1.5">({expenseBreakdown.servicios.pct.toFixed(1)}%)</span>
                  </div>
                </div>
              )}`;

const replacement = `              {expenseBreakdown.servicios.total > 0 && (
                <div className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-bold text-gray-700">Servicios Básicos</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-gray-900">\${expenseBreakdown.servicios.total.toFixed(2)}</span>
                    <span className="text-gray-400 text-[10px] ml-1.5">({expenseBreakdown.servicios.pct.toFixed(1)}%)</span>
                  </div>
                </div>
              )}

              {expenseBreakdown.consumo.total > 0 && (
                <div className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                    <span className="font-bold text-gray-700">Consumo Familiar</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-gray-900">\${expenseBreakdown.consumo.total.toFixed(2)}</span>
                    <span className="text-gray-400 text-[10px] ml-1.5">({expenseBreakdown.consumo.pct.toFixed(1)}%)</span>
                  </div>
                </div>
              )}

              {expenseBreakdown.inversion.total > 0 && (
                <div className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
                    <span className="font-bold text-gray-700">Inversión / Equipos</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-gray-900">\${expenseBreakdown.inversion.total.toFixed(2)}</span>
                    <span className="text-gray-400 text-[10px] ml-1.5">({expenseBreakdown.inversion.pct.toFixed(1)}%)</span>
                  </div>
                </div>
              )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/caja/CajaDashboard.tsx', content, 'utf8');
console.log('done legend update');
