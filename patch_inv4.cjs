const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const t = `                  </div>\n                ))}\n             </div>\n          </div>\n        )}\n\n      </div>\n    </div>\n  );\n}`;
const r = `                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mt-8 text-center text-gray-500 font-bold">No hay cierres registrados.</div>
        )
      )}
      </div>
    </div>
  );
}`;

code = code.replace(t, r);
fs.writeFileSync('src/pages/Inventario.tsx', code);
