import { motion } from "motion/react";
import { UtensilsCrossed, ArrowDown } from "lucide-react";

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
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
              className="flex flex-col items-center text-center space-y-4 relative bg-[#0D0D0D] p-8 rounded-[2rem] shadow-2xl border border-white/5 border-b-4 border-b-[#fac124] transition-colors h-full group"
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

        {/* Botón de llamado a la acción para hacer el pedido y elegir del menú */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-12 md:mt-16 flex flex-col items-center justify-center text-center space-y-3"
        >
          <button
            id="btn-ordenar-desde-proceso"
            onClick={() => {
              const menuSection = document.getElementById('menu');
              if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group inline-flex items-center justify-center gap-3 bg-[#fac124] hover:bg-[#eab31b] text-[#5a0606] px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-black text-base sm:text-xl tracking-tight uppercase shadow-2xl shadow-[#fac124]/30 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer border-2 border-[#5a0606]/10"
          >
            <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-12" />
            <span>¡Haz tu pedido ahora y elige del Menú!</span>
            <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-y-1" />
          </button>
          <p className="text-xs sm:text-sm text-gray-600 font-bold uppercase tracking-wider">
            Revisa nuestras variedades, combos y bebidas frescas preparadas al instante
          </p>
        </motion.div>
      </div>
    </section>
  );
}
