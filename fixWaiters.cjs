const fs = require('fs');
let code = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

const target = `{product.variants ? (
                    product.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center justify-between border-t border-dashed pt-2">
                        <span className="text-sm font-semibold text-gray-600 truncate mr-2">{variant.name} (\${(product.prices.estandar || 0).toFixed(2)})</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 border-none" onClick={() => updateQuantity(\`\${product.id}-estandar-\${variant.id}\`, \`\${product.name}\`, variant.name, product.prices.estandar || 0, -1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-bold text-lg w-6 text-center text-black">{items.find(i => i.id === \`\${product.id}-estandar-\${variant.id}\`)?.quantity || 0}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#fac124] text-black border-none" onClick={() => updateQuantity(\`\${product.id}-estandar-\${variant.id}\`, \`\${product.name}\`, variant.name, product.prices.estandar || 0, 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : product.prices.estandar !== undefined && (
                    <div className="flex items-center justify-between border-t border-dashed pt-2">
                      <span className="text-sm font-semibold text-gray-600">Unidad (\${product.prices.estandar.toFixed(2)})</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 border-none" onClick={() => updateQuantity(\`\${product.id}-estandar\`, \`\${product.name} \`, "Unidad", product.prices.estandar, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-lg w-6 text-center text-black">{items.find(i => i.id === \`\${product.id}-estandar\`)?.quantity || 0}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#fac124] text-black border-none" onClick={() => updateQuantity(\`\${product.id}-estandar\`, \`\${product.name} \`, "Unidad", product.prices.estandar, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}</span>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 border-none" onClick={() => updateQuantity(\`\${product.id}-estandar\`, \`\${product.name} (\${product.category.replace('Empanadas de ', '')})\`, "Unidad", product.prices.estandar, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-lg w-6 text-center text-black">{items.find(i => i.id === \`\${product.id}-estandar\`)?.quantity || 0}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#fac124] text-black border-none" onClick={() => updateQuantity(\`\${product.id}-estandar\`, \`\${product.name} (\${product.category.replace('Empanadas de ', '')})\`, "Unidad", product.prices.estandar, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}`;

const replacement = `{product.variants ? (
                    product.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center justify-between border-t border-dashed pt-2">
                        <span className="text-sm font-semibold text-gray-600 truncate mr-2">{variant.name} (\${(product.prices.estandar || 0).toFixed(2)})</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 border-none" onClick={() => updateQuantity(\`\${product.id}-estandar-\${variant.id}\`, \`\${product.name}\`, variant.name, product.prices.estandar || 0, -1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-bold text-lg w-6 text-center text-black">{items.find(i => i.id === \`\${product.id}-estandar-\${variant.id}\`)?.quantity || 0}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#fac124] text-black border-none" onClick={() => updateQuantity(\`\${product.id}-estandar-\${variant.id}\`, \`\${product.name}\`, variant.name, product.prices.estandar || 0, 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : product.prices.estandar !== undefined && (
                    <div className="flex items-center justify-between border-t border-dashed pt-2">
                      <span className="text-sm font-semibold text-gray-600">Unidad (\${product.prices.estandar.toFixed(2)})</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 border-none" onClick={() => updateQuantity(\`\${product.id}-estandar\`, \`\${product.name} \`, "Unidad", product.prices.estandar, -1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold text-lg w-6 text-center text-black">{items.find(i => i.id === \`\${product.id}-estandar\`)?.quantity || 0}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-[#fac124] text-black border-none" onClick={() => updateQuantity(\`\${product.id}-estandar\`, \`\${product.name} \`, "Unidad", product.prices.estandar, 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/home/WaitersPOS.tsx', code);
