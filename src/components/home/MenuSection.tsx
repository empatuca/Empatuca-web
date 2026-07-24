import { useState } from "react";
import { siteConfig } from "../../../siteConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { motion } from "motion/react";
import { OrderModal } from "./OrderModal";
import { LogoRain } from "./LogoRain";

export function MenuSection({ isAdmin = false }: { isAdmin?: boolean }) {
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const categories = Array.from(new Set(siteConfig.menu.map(item => item.category)));

  const handleOrder = (product: any) => {
    setSelectedProduct(product);
    setOrderModalOpen(true);
  };

  return (
    <section id="menu" className="py-20 md:py-24 bg-white flex flex-col shrink-0 text-[#0D0D0D] reveal-on-scroll">
      <div className="container mx-auto px-4 md:px-12">
        <Tabs defaultValue={categories[0]} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase mb-2">Nuestro Menú</h2>
              <div className="h-[3px] w-[60px] bg-[#fac124] mt-2 mb-4"></div>
              <p className="text-sm text-gray-500">
                Fritas al momento, siempre fresquitas
              </p>
            </div>

            <TabsList className="bg-gray-100 p-1 rounded-lg h-auto flex flex-wrap justify-start">
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="px-4 py-2 rounded-md text-xs font-bold shadow-none data-[state=active]:bg-white data-[state=active]:text-[#0D0D0D] data-[state=active]:shadow-sm text-gray-400 transition-all uppercase tracking-wider"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-0 outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {siteConfig.menu.filter(item => item.category === category).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <div className="border border-gray-100 rounded-2xl p-4 border-b-4 border-b-transparent hover:border-b-[#fac124] hover:shadow-lg transition-all duration-200 h-full flex flex-col group cursor-pointer bg-white" onClick={() => handleOrder(product)}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-lg leading-tight uppercase">{product.name}</h3>
                        {product.prices.empatuca && (
                           <span className="bg-[#fac124] text-[#5a0606] text-[10px] font-black px-2 py-1 rounded tracking-wider uppercase shrink-0 ml-2">TOP</span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-6 flex-grow">{product.description}</p>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <span className="font-black text-xl text-[#fac124]">
                           ${product.prices.empanita ? product.prices.empanita.toFixed(2) : (product.prices.estandar || 0).toFixed(2)} 
                           {product.prices.empatuca ? ` - $${product.prices.empatuca.toFixed(2)}` : ''}
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOrder(product); }}
                          className="bg-[#5a0606] text-[#fac124] w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#4a0505] transition-colors font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <LogoRain active={orderModalOpen} />
      <OrderModal 
        isOpen={orderModalOpen} 
        onClose={() => { setOrderModalOpen(false); setSelectedProduct(null); }} 
        initialProduct={selectedProduct}
        isAdmin={isAdmin}
      />
    </section>
  );
}
