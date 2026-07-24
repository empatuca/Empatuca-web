import { motion } from "motion/react";
import { siteConfig } from "../../../siteConfig";
import { MessageCircle } from "lucide-react";

export function FloatingButtons() {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappMsg)}`, '_blank');
  };

  return (
    <>
      {/* AEVO AI ASSISTANT — integrar API aquí
          Conectar con: Google AI Studio (Gemini)
          Variables: API_KEY, SYSTEM_PROMPT, BUSINESS_DATA
          Este componente está listo para recibir la integración */}
      <button 
        className="fixed bottom-20 left-4 z-50 h-12 w-12 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center shadow-lg opacity-50 hover:opacity-100 transition-opacity"
        title="Asistente Empatuca"
      >
        <span className="font-bold text-xs">AI</span>
      </button>

      {/* Floating WhatsApp */}
      <motion.button 
        onClick={handleWhatsApp}
        className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl"
        title="Pedir por WhatsApp"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}>
          <MessageCircle className="h-7 w-7" />
        </motion.div>
      </motion.button>
    </>
  );
}
