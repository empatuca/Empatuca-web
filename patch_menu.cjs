const fs = require('fs');
let code = fs.readFileSync('src/components/home/MenuSection.tsx', 'utf8');

const oldCode = `            <TabsList className="bg-gray-100 p-1 rounded-lg h-auto flex flex-wrap justify-start">
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="px-4 py-2 rounded-md text-xs font-bold shadow-none data-[state=active]:bg-white data-[state=active]:text-[#0D0D0D] data-[state=active]:shadow-sm text-gray-400 transition-all uppercase tracking-wider"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>`;

const newCode = `            <TabsList className="bg-gray-100 p-1.5 rounded-xl h-auto flex flex-wrap justify-start gap-1">
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="px-5 py-2.5 rounded-lg text-sm md:text-base font-black shadow-none data-[state=active]:bg-[#fac124] data-[state=active]:text-[#0D0D0D] data-[state=active]:shadow-md text-gray-500 hover:text-gray-900 transition-all uppercase tracking-wider"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/home/MenuSection.tsx', code);
