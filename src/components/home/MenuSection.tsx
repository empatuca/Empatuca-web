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
              <motion.h2 
                className="text-3xl md:text-4xl font-black tracking-tight uppercase mb-2 flex flex-wrap"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
              >
                {"Nuestro Menú".split("").map((char, index) => (
                  <motion.span 
                    key={index} 
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className={char === " " ? "w-2" : ""}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h2>
              <div className="h-[3px] w-[60px] bg-[#fac124] mt-2 mb-4"></div>
              <p className="text-sm text-gray-500">
                Fritas al momento, siempre fresquitas
              </p>
            </div>

            <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
              <TabsList className="bg-gray-100 p-1.5 rounded-2xl h-auto flex flex-nowrap md:flex-wrap justify-start gap-1.5 w-max md:w-auto">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm md:text-base font-black shadow-none data-[state=active]:bg-[#fac124] data-[state=active]:text-[#0D0D0D] data-[state=active]:shadow-md text-gray-600 hover:text-gray-900 transition-all uppercase tracking-wider shrink-0 whitespace-nowrap"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-0 outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6">
                {siteConfig.menu.filter(item => item.category === category).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -4 }} 
                      className="border border-gray-200/80 rounded-2xl p-4 sm:p-5 border-b-4 border-b-transparent hover:border-b-[#fac124] hover:shadow-xl transition-all duration-200 h-full flex flex-col justify-between group cursor-pointer bg-white" 
                      onClick={() => handleOrder(product)}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h3 className="font-black text-base sm:text-lg leading-tight uppercase text-gray-900 group-hover:text-[#5a0606] transition-colors">
                            {product.name}
                          </h3>
                          {product.prices.empatuca && (
                            <span className="bg-[#fac124] text-[#5a0606] text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase shrink-0 shadow-sm">
                              TOP
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-auto">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Precio</span>
                          <span className="font-black text-lg sm:text-xl text-[#0D0D0D] tracking-tight">
                            ${product.prices.empanita ? product.prices.empanita.toFixed(2) : (product.prices.estandar || 0).toFixed(2)} 
                            {product.prices.empatuca ? ` - $${product.prices.empatuca.toFixed(2)}` : ''}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOrder(product); }}
                          aria-label={`Pedir ${product.name}`}
                          className="bg-[#5a0606] hover:bg-[#430404] text-[#fac124] h-10 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all font-black text-xs uppercase tracking-wider shadow-sm group-hover:shadow group-hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <span className="text-base leading-none font-bold">+</span>
                          <span>Pedir</span>
                        </button>
                      </div>
                    </motion.div>
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
