const fs = require('fs');
let code = fs.readFileSync('src/components/home/WaitersPOS.tsx', 'utf8');

code = code.replace(
  `<div className="flex-1 flex flex-wrap items-center gap-1">\n                      <span className="font-black text-[#5a0606] mr-2">{item.quantity}x</span>\n                      <span className="text-gray-800 break-words">{item.name}</span> \n                      <span className="text-xs text-gray-400 whitespace-nowrap">({item.size})</span>\n                    </div>`,
  `<div>\n                      <span className="font-black text-[#5a0606] mr-2">{item.quantity}x</span>\n                      {item.name} <span className="text-xs text-gray-400">({item.size})</span>\n                    </div>`
);

fs.writeFileSync('src/components/home/WaitersPOS.tsx', code);
