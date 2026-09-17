const fs = require('fs');

let content = fs.readFileSync('src/components/caja/CajaDashboard.tsx', 'utf8');

const target = `          {/* 3. PAGO A SOCIOS (TOTAL CONSOLIDADO) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-fuchsia-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-fuchsia-50 rounded-full pointer-events-none opacity-60" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-fuchsia-800 bg-fuchsia-50 px-3 py-1 rounded-xl">
                  Total Pago a Socios
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {expenseBreakdown.totalSocios.count} retiros
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-fuchsia-900">
                \${expenseBreakdown.totalSocios.total.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Representa el <strong className="text-fuchsia-800">{expenseBreakdown.totalSocios.pct.toFixed(1)}%</strong> del total de egresos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
              Retiros y anticipos de utilidades distribuidos entre socios.
            </div>
          </div>
        </div>`;

const replacement = `          {/* 3. PAGO A SOCIOS (TOTAL CONSOLIDADO) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-fuchsia-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-fuchsia-50 rounded-full pointer-events-none opacity-60" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-fuchsia-800 bg-fuchsia-50 px-3 py-1 rounded-xl">
                  Total Pago a Socios
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {expenseBreakdown.totalSocios.count} retiros
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-fuchsia-900">
                \${expenseBreakdown.totalSocios.total.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Representa el <strong className="text-fuchsia-800">{expenseBreakdown.totalSocios.pct.toFixed(1)}%</strong> del total de egresos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
              Retiros y anticipos de utilidades distribuidos entre socios.
            </div>
          </div>

          {/* 4. CONSUMO FAMILIAR */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-50 rounded-full pointer-events-none opacity-60" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-3 py-1 rounded-xl">
                  Consumo Familiar
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {expenseBreakdown.consumo.count} consumos
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-orange-900">
                \${expenseBreakdown.consumo.total.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Representa el <strong className="text-orange-800">{expenseBreakdown.consumo.pct.toFixed(1)}%</strong> del total de egresos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
              Consumo interno para personal o familiares.
            </div>
          </div>

          {/* 5. INVERSIÓN / EQUIPAMIENTO */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-cyan-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-50 rounded-full pointer-events-none opacity-60" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-700 bg-cyan-50 px-3 py-1 rounded-xl">
                  Inversión / Equipos
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {expenseBreakdown.inversion.count} inversiones
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-cyan-900">
                \${expenseBreakdown.inversion.total.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Representa el <strong className="text-cyan-800">{expenseBreakdown.inversion.pct.toFixed(1)}%</strong> del total de egresos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
              Compra de activos o equipos para el local.
            </div>
          </div>
        </div>`;

content = content.replace(target, replacement);

const subtitleTarget = `Desglose exacto de los valores totales destinados a Gasto Operativo, Insumos/Producción y Pago a Socios (Chris, Evelyn, María).`;
const subtitleReplacement = `Desglose exacto de los valores destinados a Operación, Insumos, Socios, Consumo e Inversiones.`;
content = content.replace(subtitleTarget, subtitleReplacement);

fs.writeFileSync('src/components/caja/CajaDashboard.tsx', content, 'utf8');
console.log('done adding cards');
