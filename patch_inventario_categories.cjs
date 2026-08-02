const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventario.tsx', 'utf8');

const targetStr = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {inventory.map(item => {
               const percentage = item.initialStock > 0 ? (item.currentStock / item.initialStock) * 100 : 0;
               const isLow = percentage > 0 && percentage < 20;
               const isOut = item.initialStock > 0 && item.currentStock <= 0;
               return (
                 <div key={item.id} className={\`p-4 rounded-xl border-2 \${isOut ? 'border-red-200 bg-red-50' : isLow ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}\`}>
                   <p className="font-bold text-gray-800 mb-3">{item.name}</p>
                   
                   <div className="flex items-center gap-4 mb-3">
                     <div className="flex-1">
                       <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Producción</label>
                       <Input 
                         type="number" 
                         value={item.initialStock} 
                         onChange={(e) => handleUpdateInitial(item.id, parseInt(e.target.value) || 0)}
                         className="h-10 text-lg font-black"
                         min="0"
                       />
                     </div>
                     <div className="flex-1 text-center">
                       <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Disponible</label>
                       <span className={\`text-2xl font-black \${isOut ? 'text-red-600' : 'text-[#fac124]'}\`}>{item.currentStock}</span>
                     </div>
                   </div>
                   {item.initialStock > 0 && (
                     <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={\`h-2 rounded-full \${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'}\`} style={{ width: \`\${percentage}%\` }}></div>
                     </div>
                   )}
                 </div>
               );
             })}
           </div>`;

const replaceStr = `{Array.from(new Set(siteConfig.menu.map(i => i.category))).map(cat => {
             const catItems = inventory.filter(item => {
               const product = siteConfig.menu.find(p => item.id.startsWith(p.id));
               return product?.category === cat;
             });

             if (catItems.length === 0) return null;

             return (
               <div key={cat} className="mb-8 last:mb-0">
                 <h3 className="text-lg font-bold text-gray-700 uppercase tracking-widest mb-4 border-b pb-2">{cat}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {catItems.map(item => {
                     const percentage = item.initialStock > 0 ? (item.currentStock / item.initialStock) * 100 : 0;
                     const isLow = percentage > 0 && percentage < 20;
                     const isOut = item.initialStock > 0 && item.currentStock <= 0;
                     return (
                       <div key={item.id} className={\`p-4 rounded-xl border-2 \${isOut ? 'border-red-200 bg-red-50' : isLow ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}\`}>
                         <p className="font-bold text-gray-800 mb-3">{item.name}</p>
                         
                         <div className="flex items-center gap-4 mb-3">
                           <div className="flex-1">
                             <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Producción</label>
                             <Input 
                               type="number" 
                               value={item.initialStock} 
                               onChange={(e) => handleUpdateInitial(item.id, parseInt(e.target.value) || 0)}
                               className="h-10 text-lg font-black"
                               min="0"
                             />
                           </div>
                           <div className="flex-1 text-center">
                             <label className="text-xs text-gray-500 font-bold uppercase block mb-1">Disponible</label>
                             <span className={\`text-2xl font-black \${isOut ? 'text-red-600' : 'text-[#fac124]'}\`}>{item.currentStock}</span>
                           </div>
                         </div>
                         {item.initialStock > 0 && (
                           <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={\`h-2 rounded-full \${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'}\`} style={{ width: \`\${percentage}%\` }}></div>
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               </div>
             );
           })}`;
           
// I will just use regex to replace the content of that grid div.
let regex = /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

let newContent = code.replace(regex, replaceStr + '\n        </div>\n      </div>\n    </div>');

fs.writeFileSync('src/pages/Inventario.tsx', newContent);
