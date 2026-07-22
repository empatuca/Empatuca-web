import { siteConfig } from "../../../siteConfig";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export function Hero() {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappMsg)}`, '_blank');
  };

  return (
    <section id="inicio" className="relative w-full min-h-[85vh] flex items-center bg-[#0D0D0D] overflow-hidden reveal-on-scroll">
      <img src="/logo_M.svg" alt="" className="absolute top-1/2 left-1/2 w-[450px] opacity-5 pointer-events-none animate-spin-slow" />
      <div className="container mx-auto px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 py-12">
        {/* Text Column (55%) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center"
        >
          <span className="inline-block px-3 py-1 bg-[#fac124] text-[#5a0606] text-[10px] font-black uppercase tracking-widest rounded-sm mb-4 w-fit">
            22 años de receta familiar
          </span>
          
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-black leading-[0.95] mb-6 tracking-tighter text-white uppercase">
            ¿Antojo de algo<br/><span className="text-[#fac124]">rico y grande</span>,<br/>ahora mismo?
          </h1>
          <img src="/slogan.svg" alt="¿Antojo de algo rico y grande, ahora mismo?" className="h-9 w-auto mb-6 max-h-[36px] animate-fade-in opacity-0" />
          <p className="text-lg md:text-xl text-white/60 mb-8 max-w-md leading-snug">
            Las empanadas pequeñas ya no llenan. Empatuca es la respuesta inmediata al hambre de verdad. Receta familiar desde hace 22 años.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleWhatsApp} size="lg" className="bg-[#25D366] hover:bg-[#20b858] text-white rounded-xl px-8 h-14 text-base md:text-lg font-black shadow-xl uppercase">
              Quiero mi Tuca ahora
            </Button>
            <Button variant="outline" size="lg" className="border border-white/20 bg-transparent text-white hover:bg-white/5 hover:text-white rounded-xl px-8 h-14 text-base md:text-lg font-bold transition-all uppercase text-[#0D0D0D]" asChild>
              <a href="#menu">Ver el menú</a>
            </Button>
          </div>
        </motion.div>

        {/* Image Column (45%) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-6 xl:col-span-5 relative mt-12 lg:mt-0 w-full max-w-[500px] mx-auto lg:mx-0"
        >
          <div className="aspect-square bg-[#5a0606] rounded-[2rem] md:rounded-[4rem] transform rotate-3 overflow-hidden shadow-2xl border-4 border-[#fac124]/20 relative">
            <img 
              src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80" 
              alt="Empanadas doradas y crujientes Empatuca" 
              className="object-cover w-full h-full -rotate-3 scale-110"
            />
          </div>
          
          {/* Floating badge over image */}
          <div className="absolute -bottom-6 -left-2 md:-left-6 bg-[#fac124] text-[#5a0606] p-4 md:p-6 rounded-2xl shadow-2xl rotate-[-4deg] z-20">
            <p className="font-black text-2xl md:text-3xl">$1.25</p>
            <p className="text-[10px] uppercase font-bold tracking-widest">La Empatuca Grande</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
