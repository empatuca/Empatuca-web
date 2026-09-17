const fs = require('fs');

let content = fs.readFileSync('src/pages/Caja.tsx', 'utf8');

const editTarget = `                                {editGastoForm.categoria === 'Pago Socios' ? (
                                  <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Socio</label>
                                    <select 
                                      value={editGastoForm.socio} 
                                      onChange={e => setEditGastoForm({...editGastoForm, socio: e.target.value})} 
                                      className="w-full bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-900 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-fuchsia-500"
                                    >
                                      <option value="Chris">Chris</option>
                                      <option value="Evelyn">Evelyn</option>
                                      <option value="María">María</option>
                                    </select>
                                  </div>
                                ) : (
                                  <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Descripción</label>
                                    <input 
                                      type="text" 
                                      value={editGastoForm.descripcion} 
                                      onChange={e => setEditGastoForm({...editGastoForm, descripcion: e.target.value})} 
                                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-red-500"
                                    />
                                  </div>
                                )}`;

const editReplacement = `                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Descripción</label>
                                  <input 
                                    type="text" 
                                    value={editGastoForm.descripcion} 
                                    onChange={e => setEditGastoForm({...editGastoForm, descripcion: e.target.value})} 
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-red-500"
                                  />
                                </div>
                                {editGastoForm.categoria === 'Pago Socios' && (
                                  <div className="mt-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Socio</label>
                                    <select 
                                      value={editGastoForm.socio} 
                                      onChange={e => setEditGastoForm({...editGastoForm, socio: e.target.value})} 
                                      className="w-full bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-900 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-fuchsia-500"
                                    >
                                      <option value="Chris">Chris</option>
                                      <option value="Evelyn">Evelyn</option>
                                      <option value="María">María</option>
                                    </select>
                                  </div>
                                )}`;

content = content.replace(editTarget, editReplacement);
fs.writeFileSync('src/pages/Caja.tsx', content, 'utf8');
console.log('done edit form fix');
