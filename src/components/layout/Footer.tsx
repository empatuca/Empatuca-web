import { siteConfig } from "../../../siteConfig";
import { Instagram, Facebook, MessageCircle } from "lucide-react"; // using MessageCircle for TikTok approx

export function Footer() {
  return (
    <footer className="bg-[#0D0D0D] text-white py-12 md:py-16 border-t border-white/5 shrink-0">
      <div className="container mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.svg" alt="Empatuca Logo" className="h-[40px] w-auto" />
          </div>
          <p className="text-white/60 mb-6 max-w-sm">
            La receta familiar de 22 años que conquistó Santo Domingo.
          </p>
          <div className="flex gap-4">
            <a href={`https://instagram.com/${siteConfig.instagram}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#fac124] transition-colors">
              <Instagram className="h-6 w-6" />
            </a>
            <a href={`https://facebook.com/${siteConfig.facebook}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#fac124] transition-colors">
              <Facebook className="h-6 w-6" />
            </a>
            <a href={`https://tiktok.com/@${siteConfig.tiktok}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#fac124] transition-colors">
              <MessageCircle className="h-6 w-6" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-black text-sm mb-4 text-[#fac124] uppercase tracking-widest">Enlaces</h4>
          <ul className="space-y-2 text-white/60 font-medium">
            <li><a href="#inicio" className="hover:text-white transition-colors">Inicio</a></li>
            <li><a href="#menu" className="hover:text-white transition-colors">Nuestro Menú</a></li>
            <li><a href="#nosotros" className="hover:text-white transition-colors">Historia</a></li>
            <li><a href="#cocina" className="hover:text-white transition-colors">Acceso Cocina</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-sm mb-4 text-[#fac124] uppercase tracking-widest">Contacto</h4>
          <ul className="space-y-2 text-white/60 font-medium text-sm leading-relaxed mb-6">
            <li>{siteConfig.address}</li>
            <li>{siteConfig.hours}</li>
            <li>{siteConfig.email}</li>
          </ul>
          <img src="/slogan.png" alt={siteConfig.tagline} className="h-6 w-auto max-h-[24px]" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-12 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-white/40 gap-4 uppercase tracking-widest">
        <p>© {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.</p>
        <p>Desarrollado por <a href="https://aevo.placeholder" className="text-[#fac124] hover:text-white transition-colors font-bold">AEVO</a></p>
      </div>
    </footer>
  );
}
