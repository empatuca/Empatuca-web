import { motion } from "motion/react";

export function AboutSection() {
  return (
    <section id="nosotros" className="py-20 md:py-32 bg-gradient-to-b from-[#5a0606] to-[#0D0D0D] border-t border-white/5 reveal-on-scroll relative">
      <div className="container mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50, rotate: -5 }}
          whileInView={{ opacity: 1, x: 0, rotate: 0 }}
          whileHover={{ scale: 1.05, rotate: 2 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative h-[400px] md:h-[600px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
        >
          <img 
            src="/historia.png" 
            alt="Ambiente de nuestro restaurante Empatuca" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-white font-black text-3xl tracking-tight uppercase">De nuestra familia,<br/><span className="text-[#fac124]">a la tuya.</span></p>
          </div>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } }
          }}
          className="space-y-6 max-w-lg"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center rounded-sm bg-[#fac124] px-3 py-1 text-[10px] font-black text-[#5a0606] uppercase tracking-widest">
            Nuestra Historia
          </motion.div>
          <motion.h2 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
            22 años amasando la tradición
          </motion.h2>
          <motion.div variants={{ hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }} className="h-[3px] w-[60px] bg-[#fac124] mt-2 mb-6"></motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-4 text-lg text-white/60 leading-relaxed">
            <p>
              Todo empezó hace más de dos décadas con una receta familiar que rápidamente se convirtió en el secreto mejor guardado de la zona. La gente no venía por empanadas, venía por "las tucas".
            </p>
            <p>
              Hoy, una nueva generación ha tomado esa misma masa, ese mismo sazón, y lo ha convertido en una marca propia. <strong className="text-white">Empatuca</strong> nace para darte lo que siempre has querido: una empanada que de verdad te llene, doradita por fuera, llena de sabor por dentro, y servida rápido.
            </p>
            <p>
              No somos comida rápida corporativa. Somos la comida de tu zona, evolucionada.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
