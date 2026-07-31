const fs = require('fs');
let code = fs.readFileSync('src/components/home/OrderModal.tsx', 'utf8');

const stateHook = `  const [wantsDrink, setWantsDrink] = useState<boolean | null>(null);
  const [extraCategory, setExtraCategory] = useState<string | null>(null);`;
code = code.replace(/  const \[wantsDrink, setWantsDrink\] = useState<boolean \| null>\(null\);/, stateHook);

const useEff = `    if (isOpen && initialProduct) {
      setStep(1);
      setWantsDrink(null);
      setExtraCategory(null);`;
code = code.replace(/    if \(isOpen && initialProduct\) \{\n      setStep\(1\);/, useEff);

const renderCode = `                {wantsDrink === true && (
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
                        {siteConfig.menu.filter(item => item.id !== initialProduct?.id && item.category === extraCategory).map((drink) => {`;

code = code.replace(/                \{wantsDrink === true && \(\n                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">\n                    \{siteConfig\.menu\.filter\(item => item\.id !== initialProduct\?\.id\)\.map\(\(drink\) => \{/, renderCode);

const closeDiv = `                        </div>
                      );
                    })}
                  </div>
                )}`;
const newCloseDiv = `                        </div>
                      );
                    })}
                      </div>
                    )}
                  </div>
                )}`;
code = code.replace(/                        <\/div>\n                      \);\n                    \}\)\}\n                  <\/div>\n                \}\)/, newCloseDiv);

fs.writeFileSync('src/components/home/OrderModal.tsx', code);
