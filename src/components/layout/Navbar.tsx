import { siteConfig } from "../../../siteConfig";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappMsg)}`, '_blank');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0D0D0D] shrink-0">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5a0606] text-[#fac124]">
            <span className="font-bold text-xl leading-none mt-1">M</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white uppercase">{siteConfig.name}</span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-white/70">
          <a href="#inicio" className="transition-colors hover:text-[#fac124]">Inicio</a>
          <a href="#menu" className="transition-colors hover:text-[#fac124]">Menú</a>
          <a href="#nosotros" className="transition-colors hover:text-[#fac124]">Nosotros</a>
          <a href="#proceso" className="transition-colors hover:text-[#fac124]">Pedidos</a>
          <a href="#contacto" className="transition-colors hover:text-[#fac124]">Contacto</a>
        </div>

        <Button onClick={handleWhatsApp} className="bg-[#25D366] hover:bg-[#20b858] text-white font-bold rounded-full px-5 py-2.5 h-auto text-sm shadow-lg shadow-green-900/20 flex items-center gap-2">
          <svg className="w-5 h-5 hidden sm:block" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.591-3.849-1.591-5.946 0-6.556 5.332-11.888 11.887-11.888 3.178 0 6.164 1.24 8.406 3.483 2.242 2.242 3.481 5.226 3.481 8.401 0 6.557-5.332 11.89-11.887 11.89-2.01 0-3.991-.51-5.744-1.478l-6.24 1.635zm6.348-4.485c1.62.962 3.377 1.47 5.19 1.47 5.482 0 9.944-4.461 9.944-9.945 0-2.653-1.033-5.147-2.908-7.022-1.875-1.875-4.37-2.908-7.022-2.908-5.485 0-9.946 4.461-9.946 9.945 0 1.933.565 3.818 1.635 5.426l-1.069 3.903 4.024-1.054a9.905 9.905 0 0 0 5.152 1.433z"/></svg>
          Pedir por WhatsApp
        </Button>
      </div>
    </nav>
  );
}
