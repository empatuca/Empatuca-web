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
    <section id="proceso" className="py-20 md:py-32 bg-[#111111] border-t border-white/5">
      <div className="container mx-auto px-4 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase">Tan fácil como sabroso</h2>
          <p className="text-lg text-white/60">
            Olvídate de las filas largas y de esperar a que te atiendan. Modernizamos la tradición.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-px bg-white/10 -z-10"></div>
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center space-y-4 relative bg-[#111111]"
            >
              <div className="w-24 h-24 rounded-full bg-[#0D0D0D] border border-white/10 flex items-center justify-center text-2xl font-black text-[#fac124] shadow-xl mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">{step.title}</h3>
              <p className="text-white/60 text-sm max-w-[200px] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
