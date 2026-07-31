const fs = require('fs');
let code = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

// Replace standard imports to add ChevronUp
code = code.replace(
  'import { Plus, Minus, CheckCircle2, ShoppingCart, Info, Check, Trash2, X } from "lucide-react";',
  'import { Plus, Minus, CheckCircle2, ShoppingCart, Info, Check, Trash2, X, ChevronUp } from "lucide-react";'
);

// Add isCartOpen state
code = code.replace(
  'const [success, setSuccess] = useState(false);',
  'const [success, setSuccess] = useState(false);\n  const [isCartOpen, setIsCartOpen] = useState(false);'
);

// Fix minus buttons (three of them)
const minusBtnMatch = /<Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick=\{\(\) => updateQuantity\([^,]+, product\.name, "[^"]+", product\.prices\.[^,]+, -1\)\}>\s*<Minus className="h-4 w-4" \/>\s*<\/Button>/g;
code = code.replace(minusBtnMatch, (match) => {
  return match.replace(
    'className="h-8 w-8 rounded-full"',
    'className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 border-none"'
  );
});

// Update cart layout
const cartStart = `{/* CART */}
      <div className="flex-1 bg-white rounded-3xl shadow-xl border-2 border-gray-100 flex flex-col overflow-hidden max-w-sm shrink-0">
        <div className="bg-[#5a0606] text-white p-4 font-black uppercase flex items-center justify-between">
           <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Orden</span>
           <span>\${total.toFixed(2)}</span>
        </div>`;

const newCartStart = `      {/* MOBILE CART OVERLAY */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* CART */}
      <div className={\`fixed md:relative bottom-0 left-0 right-0 z-50 md:z-auto w-full md:w-[350px] bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-xl border-t-2 md:border-2 border-gray-100 flex flex-col shrink-0 transition-transform duration-300 \${isCartOpen ? 'translate-y-0 h-[85vh]' : 'translate-y-[calc(100%-72px)]'} md:translate-y-0 md:h-auto\`}>
        <div 
          className="bg-[#5a0606] text-white p-4 h-[72px] font-black uppercase flex items-center justify-between cursor-pointer md:cursor-default shrink-0"
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
           <div className="flex items-center gap-3">
             <ShoppingCart className="h-6 w-6" />
             <div className="flex flex-col leading-tight">
               <span>Orden</span>
               <span className="text-[10px] text-white/70 md:hidden normal-case">{items.length} productos</span>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <span className="text-xl">\${total.toFixed(2)}</span>
             <ChevronUp className={\`h-5 w-5 md:hidden transition-transform \${isCartOpen ? 'rotate-180' : ''}\`} />
           </div>
        </div>`;

code = code.replace(cartStart, newCartStart);

fs.writeFileSync('src/components/home/WaitersPOS.tsx', code);
