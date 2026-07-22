import { siteConfig } from "../../../siteConfig";
import { MapPin, Clock, Mail } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contacto" className="py-20 md:py-32 bg-[#0D0D0D] border-t border-white/5 reveal-on-scroll relative">
      {/* Pattern watermark background */}
      <div 
        className="absolute inset-0 z-0 opacity-10" 
        style={{ backgroundImage: 'url(/patron_m.png)', backgroundSize: '150px' }}
      ></div>
      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase">Encuéntranos</h2>
          <div className="h-[3px] w-[60px] bg-[#fac124] mt-2 mb-6 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-[#111111] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="p-8 md:p-12 space-y-8 flex flex-col justify-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-[#fac124]/10 p-3 rounded-xl text-[#fac124]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white uppercase">Ubicación</h4>
                  <p className="text-white/60 mt-1 leading-relaxed">{siteConfig.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-[#fac124]/10 p-3 rounded-xl text-[#fac124]">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white uppercase">Horarios de Atención</h4>
                  <p className="text-white/60 mt-1 leading-relaxed">{siteConfig.hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#fac124]/10 p-3 rounded-xl text-[#fac124]">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white uppercase">Contacto</h4>
                  <p className="text-white/60 mt-1 leading-relaxed">{siteConfig.email}</p>
                  <p className="text-white/60 leading-relaxed">+ {siteConfig.whatsapp}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] lg:h-auto w-full bg-gray-900 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7891392659617!2d-79.1673896!3d-0.2520775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x904d4d12c1450a8b%3A0xc31fa55e8cc7432b!2sAv.%20Bomboli%20%26%20Ing.%20Carlos%20Brown%2C%20Santo%20Domingo!5e0!3m2!1ses!2sec!4v1700000000000!5m2!1ses!2sec" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Empatuca en Google Maps"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
