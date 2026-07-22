import { motion } from "motion/react";

export function ProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Elige tu Tuca",
      description: "Revisa nuestro menú y decide con qué vas a calmar tu antojo hoy."
    },
    {
      number: "02",
      title: "Haz tu pedido",
      description: "Pídelo rápido desde tu celular, ya sea para mesa, llevar o delivery."
    },
    {
      number: "03",
      title: "Lo preparamos fresquito",
      description: "Tu pedido llega a cocina al instante y lo freímos al momento."
    },
    {
      number: "04",
      title: "Lo recibes o retiras",
      description: "Disfruta de tu Empatuca calientita y dorada, lista para comer."
    }
  ];

  return (
    <section id="proceso" className="py-20 md:py-32 border-t border-white/5 reveal-on-scroll relative overflow-hidden bg-[#5a0606]">
      {/* Tone-on-tone red stripes background to respect the physical store identity tastefully */}
      <div 
        className="absolute inset-0 z-0 opacity-100"
        style={{ 
          backgroundImage: 'repeating-linear-gradient(90deg, #5a0606 0px, #5a0606 80px, #4d0505 80px, #4d0505 160px)' 
        }}
      ></div>
      {/* Subtle vignette for depth */}
      <div className="absolute inset-0 z-0 bg-black/20 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase drop-shadow-md">Tan fácil como sabroso</h2>
          <div className="h-[3px] w-[60px] bg-[#fac124] mt-2 mb-6 mx-auto"></div>
          <p className="text-lg text-white/90 max-w-xl mx-auto drop-shadow-sm font-medium">
            Olvídate de las filas largas y de esperar a que te atiendan. Modernizamos la tradición.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[3px] bg-white/20 -z-10 border-t border-dashed border-white/40"></div>
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center space-y-4 relative bg-white p-8 rounded-[2rem] shadow-xl border-b-4 border-b-transparent hover:border-b-[#fac124] hover:-translate-y-2 transition-all duration-300 h-full group"
            >
              <div className="w-20 h-20 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform bg-[#fac124] flex items-center justify-center text-2xl font-black text-[#5a0606] shadow-lg mb-2 shrink-0">
                {step.number}
              </div>
              <h3 className="text-xl font-black text-[#0D0D0D] uppercase tracking-tight">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
