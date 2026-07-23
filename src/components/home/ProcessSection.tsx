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
    <section id="proceso" className="py-20 md:py-32 bg-[#F9F6F0] relative overflow-hidden reveal-on-scroll border-t border-white/5">
      
      {/* Tasteful architectural stripes accent based on the physical store */}
      <div className="absolute top-0 right-0 w-[60%] md:w-[40%] h-full pointer-events-none opacity-40 md:opacity-100 flex items-start justify-end">
        <div 
          className="w-full h-full transform skew-x-12 translate-x-16"
          style={{ 
            backgroundImage: 'repeating-linear-gradient(90deg, #5a0606 0px, #5a0606 80px, #ffffff 80px, #ffffff 160px)',
            boxShadow: 'inset 20px 0 50px rgba(249, 246, 240, 1)'
          }}
        ></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#F9F6F0] via-[#F9F6F0]/90 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div className="text-center md:text-left max-w-3xl mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-[#0D0D0D] mb-6 tracking-tighter uppercase">Tan fácil como sabroso</h2>
          <div className="h-[4px] w-[80px] bg-[#fac124] mt-2 mb-6 mx-auto md:mx-0"></div>
          <p className="text-lg text-gray-700 max-w-xl font-medium">
            Olvídate de las filas largas y de esperar a que te atiendan. Modernizamos la tradición de tu zona.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-gray-300 -z-10 border-t border-dashed border-gray-400"></div>
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center space-y-4 relative bg-[#0D0D0D] p-8 rounded-[2rem] shadow-2xl border border-white/5 border-b-4 border-b-transparent hover:border-b-[#fac124] hover:-translate-y-2 transition-all duration-300 h-full group"
            >
              <div className="w-20 h-20 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform bg-[#fac124] flex items-center justify-center text-3xl font-black text-[#5a0606] shadow-sm mb-2 shrink-0">
                {step.number}
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{step.title}</h3>
              <p className="text-white/70 text-sm font-medium leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
