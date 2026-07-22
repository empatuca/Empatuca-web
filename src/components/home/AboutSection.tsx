import { motion } from "motion/react";

export function AboutSection() {
  return (
    <section id="nosotros" className="py-20 md:py-32 bg-[#0D0D0D] border-t border-white/5">
      <div className="container mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[400px] md:h-[600px] rounded-[2rem] overflow-hidden border border-white/10"
        >
          <img 
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80" 
            alt="Ambiente de nuestro restaurante Empatuca" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-white font-black text-3xl tracking-tight uppercase">De nuestra familia,<br/><span className="text-[#fac124]">a la tuya.</span></p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6 max-w-lg"
        >
          <div className="inline-flex items-center rounded-sm bg-[#fac124] px-3 py-1 text-[10px] font-black text-[#5a0606] uppercase tracking-widest">
            Nuestra Historia
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
            22 años amasando la tradición
          </h2>
          <div className="space-y-4 text-lg text-white/60 leading-relaxed">
            <p>
              Todo empezó hace más de dos décadas con una receta familiar que rápidamente se convirtió en el secreto mejor guardado del barrio. La gente no venía por empanadas, venía por "las tucas".
            </p>
            <p>
              Hoy, una nueva generación ha tomado esa misma masa, ese mismo sazón, y lo ha convertido en una marca propia. <strong className="text-white">Empatuca</strong> nace para darte lo que siempre has querido: una empanada que de verdad te llene, doradita por fuera, llena de sabor por dentro, y servida rápido.
            </p>
            <p>
              No somos comida rápida corporativa. Somos la comida de tu barrio, evolucionada.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
