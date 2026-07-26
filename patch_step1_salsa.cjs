const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

// The initial state has been partially modified? No, in step 4 summary I modified the patch earlier but I haven't removed it from Step 1 rendering.
const checkboxToRemove = `                    <label className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox checked={aderezos.salsa_pina} onCheckedChange={(c) => setAderezos({...aderezos, salsa_pina: !!c})} />
                      <span className="text-sm font-medium">Salsa de Piña</span>
                    </label>`;

code = code.replace(checkboxToRemove, '');
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
