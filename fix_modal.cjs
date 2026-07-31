const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const prefix = '{wantsDrink === true && (';
const suffix = '{/* STEP 3: Tipo de Pedido */}';

const before = code.split(prefix)[0];
const after = code.split(suffix)[1];

const step2Middle = `
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    {!extraCategory ? (
                      <div className="grid grid-cols-1 gap-3">
                        {['Empanadas de Verde', 'Empanadas de Harina', 'Bebidas'].map(cat => (
                          <Button key={cat} variant="outline" onClick={() => setExtraCategory(cat)} className="h-16 justify-between font-bold text-lg rounded-xl border-2 hover:border-[#fac124] hover:bg-[#fac124]/10 transition-colors bg-white">
                            {cat} <ArrowRight className="h-5 w-5 text-gray-400" />
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in slide-in-from-right-2">
                        <Button variant="ghost" onClick={() => setExtraCategory(null)} className="mb-2 -ml-4 text-gray-500 font-bold uppercase tracking-wider text-xs hover:text-black">
                          ← Volver a categorías
                        </Button>
                        {siteConfig.menu.filter(item => item.id !== initialProduct?.id && item.category === extraCategory).map((drink) => {
                      if (drink.category.includes('Empanadas')) {
                        return (
                          <div key={drink.id} className="flex flex-col gap-2 p-3 border rounded-xl bg-gray-50">
                            <span className="font-bold text-gray-800">{drink.name} {drink.category.includes('Verde') ? '(Verde)' : '(Harina)'}</span>
                            {drink.prices.empatuca && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Empatuca - \${drink.prices.empatuca.toFixed(2)}</span>
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
                                <span className="text-sm text-gray-500">Empanita - \${drink.prices.empanita.toFixed(2)}</span>
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
                        : (items.find(i => i.id === \`\${drink.id}-estandar\`)?.quantity || 0);

                      const selectedVariants = drink.variants ? items.filter(i => i.baseId === drink.id && i.quantity > 0) : [];

                      return (
                        <div key={drink.id} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-gray-800">{drink.name}</span>
                              <p className="text-sm text-gray-500">\${drink.prices.estandar?.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {drink.variants ? (
                                 <Button variant="outline" className="h-8 rounded-full bg-[#FAFAFA] px-4 font-bold" onClick={() => setActiveVariantProduct(drink)}>
                                   Elegir <Plus className="h-3 w-3 ml-2" />
                                 </Button>
                              ) : (
                                <>
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(\`\${drink.id}-estandar\`, -1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-bold text-lg w-4 text-center">{drinkQuantity}</span>
                                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(\`\${drink.id}-estandar\`, 1)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          {selectedVariants.map(variant => (
                            <div key={variant.id} className="flex items-center justify-between pl-6 py-1 border-t border-dashed border-gray-200">
                               <span className="text-sm font-medium text-gray-600">↳ {variant.name.split('- ')[1] || variant.name}</span>
                               <div className="flex items-center gap-3">
                                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full" onClick={() => updateQuantity(variant.id, -1)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-bold text-sm w-4 text-center">{variant.quantity}</span>
                                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full bg-[#FAFAFA]" onClick={() => updateQuantity(variant.id, 1)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                               </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-500 font-medium">Subtotal:</span>
                  <span className="text-2xl font-bold text-[#5a0606]">\${total.toFixed(2)}</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-14 flex-1 rounded-xl font-semibold">
                    Volver
                  </Button>
                  {wantsDrink !== null && (
                    <Button 
                      onClick={() => setStep(3)} 
                      className="h-14 flex-[2] rounded-xl bg-[#fac124] hover:bg-[#eab308] text-[#0D0D0D] font-bold text-lg"
                    >
                      Siguiente <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          `;

const newCode = before + prefix + step2Middle + suffix + after;
fs.writeFileSync('src/components/home/OrderModal.tsx', newCode);
