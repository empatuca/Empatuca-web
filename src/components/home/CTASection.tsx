import { siteConfig } from "../../../siteConfig";
import { Button } from "@/components/ui/button";

export function CTASection() {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappMsg)}`, '_blank');
  };

  return (
    <section className="py-24 md:py-32 bg-[#5a0606] text-white relative overflow-hidden border-t border-white/5 reveal-on-scroll">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-[40%] h-full bg-[#0D0D0D]/20 rounded-full blur-[100px] -z-10 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[40%] h-[50%] bg-[#fac124]/10 rounded-full blur-[100px] -z-10 -translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 md:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter max-w-3xl uppercase">
            Tu antojo no puede esperar
          </h2>
          <div className="h-[3px] w-[60px] bg-[#fac124] mt-2 mb-8 mx-auto lg:mx-0"></div>
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto lg:mx-0">
            Pedido en segundos. Sin filas ni esperas. Pídela por WhatsApp o desde nuestro menú digital.
          </p>
          
          <div className="flex flex-col items-center lg:items-start gap-6">
            <Button onClick={handleWhatsApp} size="lg" className="bg-[#fac124] hover:bg-[#d6a51d] text-[#5a0606] rounded-xl px-10 h-16 text-lg font-black shadow-xl uppercase tracking-widest">
              Hacer pedido por WhatsApp
            </Button>
            <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">
              Abiertos hoy: {siteConfig.hours.split(',')[1]}
            </p>
          </div>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end w-full max-w-[400px] lg:max-w-none">
          <div className="relative">
            <div className="aspect-square bg-[#0D0D0D] rounded-[2rem] md:rounded-[4rem] transform -rotate-3 overflow-hidden shadow-2xl border-4 border-[#fac124]/20 w-[300px] md:w-[450px]">
              <img 
                src="/empanadas%20de%20verde.png" 
                alt="Empanadas de verde" 
                className="object-cover w-full h-full rotate-3 scale-110"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
