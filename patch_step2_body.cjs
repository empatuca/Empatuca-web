const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const oldMapBodyStart = `                      const drinkQuantity = drink.variants 
                        ? items.filter(i => i.baseId === drink.id).reduce((sum, i) => sum + i.quantity, 0)
                        : (items.find(i => i.id === \`\${drink.id}-estandar\`)?.quantity || 0);`;

const newMapBodyStart = `
                      if (isInitialDrink) {
                        return (
                          <div key={drink.id} className="flex flex-col gap-2 p-3 border rounded-xl bg-gray-50">
                            <span className="font-bold text-gray-800">{drink.name}</span>
                            {drink.prices.empatuca && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Empatuca - $\{drink.prices.empatuca.toFixed(2)}</span>
                                <div className="flex items-center gap-3">
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(\`\${drink.id}-empatuca\`, -1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-bold text-lg w-4 text-center">{items.find(i => i.id === \`\${drink.id}-empatuca\`)?.quantity || 0}</span>
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(\`\${drink.id}-empatuca\`, 1)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            {drink.prices.empanita && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Empanita - $\{drink.prices.empanita.toFixed(2)}</span>
                                <div className="flex items-center gap-3">
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(\`\${drink.id}-empanita\`, -1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-bold text-lg w-4 text-center">{items.find(i => i.id === \`\${drink.id}-empanita\`)?.quantity || 0}</span>
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(\`\${drink.id}-empanita\`, 1)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      const drinkQuantity = drink.variants 
                        ? items.filter(i => i.baseId === drink.id).reduce((sum, i) => sum + i.quantity, 0)
                        : (items.find(i => i.id === \`\${drink.id}-estandar\`)?.quantity || 0);`;

code = code.replace(oldMapBodyStart, newMapBodyStart);
fs.writeFileSync('src/components/home/OrderModal.tsx', code);
