const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const mesaButtonStr = `
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {isAdmin && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOrderType('mesa')}
                    className={\`h-24 flex flex-col gap-2 rounded-xl border-2 transition-all \${orderType === 'mesa' ? 'border-[#5a0606] bg-[#5a0606]/5 text-[#5a0606]' : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'}\`}
                  >
                    <Utensils className="h-6 w-6" />
                    <span>En Mesa</span>
                  </Button>
                )}
`;

code = code.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-3">', mesaButtonStr);

const mesaInputStr = `
              {orderType === 'mesa' && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <Label htmlFor="table" className="text-base font-semibold">Número de Mesa</Label>
                  <Input 
                    id="table" 
                    type="number"
                    placeholder="Ej. 1, 2, 3..." 
                    className="h-14 text-lg rounded-xl"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
              )}
`;

code = code.replace("{orderType === 'delivery' && (", mesaInputStr + "\n              {orderType === 'delivery' && (");

const summaryMesaStr = `Modalidad: {orderType === 'mesa' ? \`Mesa \${tableNumber}\` : orderType === 'delivery' ? \`Delivery\` : 'Para llevar'}`;
code = code.replace("Modalidad: {orderType === 'delivery' ? `Delivery` : 'Para llevar'}", summaryMesaStr);

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
