import { motion } from "motion/react";
import { UtensilsCrossed, ArrowDown, Utensils, Smartphone, Flame, PackageCheck, ArrowRight } from "lucide-react";

export function ProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Elige tu Tuca",
      description: "Revisa nuestro menú y decide con qué vas a calmar tu antojo hoy.",
      icon: Utensils,
      stepBadge: "Paso 1"
    },
    {
      number: "02",
      title: "Haz tu pedido",
      description: "Pídelo rápido desde tu celular: para mesa, llevar o delivery.",
      icon: Smartphone,
      stepBadge: "Paso 2"
    },
    {
      number: "03",
      title: "Lo preparamos",
      description: "Tu pedido llega a cocina al instante y lo freímos doradito al momento.",
      icon: Flame,
      stepBadge: "Paso 3"
    },
    {
      number: "04",
      title: "Lo recibes o retiras",
      description: "Disfruta de tu Empatuca calientita y dorada, lista para saborear.",
      icon: PackageCheck,
      stepBadge: "Paso 4"
    }
  ];

  return (
    <section id="proceso" className="py-16 md:py-28 bg-[#F9F6F0] relative overflow-hidden reveal-on-scroll border-t border-white/5">
      
      {/* Architectural stripes accent based on the physical store */}
      <div className="absolute top-0 right-0 w-[60%] md:w-[40%] h-full pointer-events-none opacity-30 md:opacity-100 flex items-start justify-end">
        <div 
          className="w-full h-full transform skew-x-12 translate-x-16"
          style={{ 
            backgroundImage: 'repeating-linear-gradient(90deg, #5a0606 0px, #5a0606 80px, #ffffff 80px, #ffffff 160px)',
            boxShadow: 'inset 20px 0 50px rgba(249, 246, 240, 1)'
          }}
        ></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#F9F6F0] via-[#F9F6F0]/90 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <div className="text-center md:text-left max-w-3xl mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#5a0606] text-[#fac124] rounded-full text-[11px] font-black uppercase tracking-wider mb-3 shadow-sm">
            <span>⚡ Proceso Rápido y Sencillo</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-tighter uppercase">
            Tan fácil como sabroso
          </h2>
          <div className="h-[4px] w-[80px] bg-[#fac124] mb-4 mx-auto md:mx-0"></div>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-xl font-medium">
            Olvídate de las filas largas y de esperar a que te atiendan. Modernizamos la tradición de tu zona.
          </p>
        </div>

        {/* Cuadrícula responsiva: 2 columnas compactas en móvil y 4 columnas en escritorio */}
        <div className="relative">
          {/* Connector line for large screens */}
          <div className="hidden lg:block absolute top-[52px] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-[#fac124] via-gray-300 to-[#fac124] -z-0 border-t-2 border-dashed border-gray-400"></div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 relative z-10">
            {steps.map((step, i) => {
              const IconComponent = step.icon;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ scale: 1.03, y: -6 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 120 }}
                  className="flex flex-col items-center text-center p-3.5 sm:p-5 md:p-6 lg:p-7 relative bg-[#0D0D0D] rounded-2xl sm:rounded-3xl shadow-xl border border-white/10 border-b-4 border-b-[#fac124] transition-all h-full group"
                >
                  {/* Step Pill Header */}
                  <div className="w-full flex items-center justify-between gap-1 mb-2 sm:mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-amber-200 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                      {step.stepBadge}
                    </span>
                    {i < steps.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-[#fac124] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all hidden sm:block lg:hidden" />
                    )}
                  </div>

                  {/* Icon & Number Badge */}
                  <div className="relative mb-2.5 sm:mb-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-xl sm:rounded-2xl bg-[#fac124] flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-[#5a0606]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-black text-[#fac124] border border-[#fac124]/60 text-[10px] sm:text-xs font-black px-1.5 py-0.2 rounded-md shadow-sm">
                      {step.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xs sm:text-base md:text-lg font-black text-white uppercase tracking-tight mb-1 sm:mb-2 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-white/70 text-[11px] sm:text-xs md:text-sm font-medium leading-snug sm:leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Botón de llamado a la acción para hacer el pedido y elegir del menú */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-10 md:mt-14 flex flex-col items-center justify-center text-center space-y-2.5"
        >
          <button
            id="btn-ordenar-desde-proceso"
            onClick={() => {
              const menuSection = document.getElementById('menu');
              if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group inline-flex items-center justify-center gap-2.5 sm:gap-3 bg-[#fac124] hover:bg-[#eab31b] text-[#5a0606] px-6 py-3.5 sm:px-10 sm:py-4.5 rounded-2xl font-black text-sm sm:text-lg md:text-xl tracking-tight uppercase shadow-2xl shadow-[#fac124]/30 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer border-2 border-[#5a0606]/15"
          >
            <UtensilsCrossed className="w-4 h-4 sm:w-6 sm:h-6 transition-transform group-hover:rotate-12" />
            <span>¡Haz tu pedido ahora y elige del Menú!</span>
            <ArrowDown className="w-4 h-4 sm:w-6 sm:h-6 transition-transform group-hover:translate-y-1" />
          </button>
          <p className="text-[11px] sm:text-sm text-gray-600 font-bold uppercase tracking-wider">
            Revisa nuestras variedades, combos y bebidas frescas preparadas al instante
          </p>
        </motion.div>
      </div>
    </section>
  );
}
