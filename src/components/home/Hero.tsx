import { siteConfig } from "../../../siteConfig";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export function Hero() {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappMsg)}`, '_blank');
  };

  return (
    <section id="inicio" className="relative w-full min-h-[85vh] flex items-center bg-[#0D0D0D] overflow-hidden reveal-on-scroll">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="/logo_M.svg" alt="" className="absolute -top-20 -left-20 md:-top-32 md:-left-32 w-[300px] md:w-[500px] opacity-20 animate-spin-slow" />
        <img src="/logo_M.svg" alt="" className="absolute top-1/4 -right-20 md:-right-40 w-[250px] md:w-[400px] opacity-20 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '35s' }} />
        <img src="/logo_M.svg" alt="" className="absolute -bottom-20 left-1/4 md:-bottom-40 md:left-1/3 w-[300px] md:w-[450px] opacity-20 animate-spin-slow" style={{ animationDuration: '45s' }} />
      </div>
      
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
          
          <motion.h1 
            className="text-4xl md:text-5xl xl:text-6xl font-black leading-[0.95] mb-6 tracking-tighter text-white uppercase"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            <motion.span variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }} className="inline-block">¿Antojo</motion.span>{" "}
            <motion.span variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }} className="inline-block">de</motion.span>{" "}
            <motion.span variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }} className="inline-block">algo</motion.span>
            <br/>
            <motion.span variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }} className="inline-block text-[#fac124]">rico</motion.span>{" "}
            <motion.span variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }} className="inline-block text-[#fac124]">y</motion.span>{" "}
            <motion.span variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }} className="inline-block text-[#fac124]">grande,</motion.span>
            <br/>
            <motion.span variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }} className="inline-block">ahora</motion.span>{" "}
            <motion.span variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }} className="inline-block">mismo?</motion.span>
          </motion.h1>
          <p className="text-lg md:text-xl text-white/60 mb-8 max-w-md leading-snug">
            Las empanadas pequeñas ya no llenan. Empatuca es la respuesta inmediata al hambre de verdad. Receta familiar desde hace 22 años.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={handleWhatsApp} size="lg" className="bg-[#25D366] hover:bg-[#20b858] text-white rounded-xl px-8 h-14 text-base md:text-lg font-black shadow-xl uppercase w-full sm:w-auto">
                Quiero mi Tuca ahora
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#0D0D0D] rounded-xl px-8 h-14 text-base md:text-lg font-bold transition-all duration-200 uppercase w-full sm:w-auto" asChild>
                <a href="#menu">Ver el menú</a>
              </Button>
            </motion.div>
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
              src="/empanada%20de%20harina.png" 
              alt="Empanadas doradas y crujientes Empatuca" 
              className="object-cover w-full h-full -rotate-3 scale-110"
            />
          </div>
          
          {/* Floating badge over image */}
          <motion.div 
            className="absolute -bottom-6 -left-2 md:-left-6 bg-[#fac124] text-[#5a0606] p-4 md:p-6 rounded-2xl shadow-2xl z-20 origin-bottom-left"
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
            whileHover={{ scale: 1.1, rotate: 0 }}
          >
            <motion.p 
              className="font-black text-2xl md:text-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              $0.75
            </motion.p>
            <p className="text-[10px] uppercase font-bold tracking-widest">Empatuca de Harina</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
