import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronRight, HelpCircle, Send, MessageSquare } from 'lucide-react';
import { CANALES_ORIGEN, registrarEncuestaOrigen } from '../../lib/encuestaService';

export function VisitorSourceSurvey() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedCanal, setSelectedCanal] = useState<string | null>(null);
  const [customDetail, setCustomDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya respondió previamente
    const alreadyAnswered = localStorage.getItem('empatuca_origen_respondido');
    const dismissedThisSession = sessionStorage.getItem('empatuca_origen_dismissed');

    if (!alreadyAnswered && !dismissedThisSession) {
      // Mostrar la tarjeta amablemente después de 2.5 segundos de navegación
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelectOption = async (canalLabel: string) => {
    if (canalLabel === 'Otro') {
      setSelectedCanal('Otro');
      return;
    }

    setIsSubmitting(true);
    await registrarEncuestaOrigen(canalLabel);
    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      setIsVisible(false);
    }, 3200);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCanal) return;

    setIsSubmitting(true);
    await registrarEncuestaOrigen(selectedCanal, customDetail);
    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      setIsVisible(false);
    }, 3200);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('empatuca_origen_dismissed', 'true');
  };

  return (
    <div className="fixed bottom-24 left-4 z-40 max-w-sm pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="pointer-events-auto bg-[#0D0D0D] text-white rounded-3xl p-5 shadow-2xl border-2 border-[#fac124]/40 w-[92vw] sm:w-[380px] overflow-hidden relative"
          >
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#fac124] via-[#5a0606] to-[#fac124]" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🥟</span>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-tight text-[#fac124] leading-tight">
                    ¿Cómo conociste Empatuca?
                  </h4>
                  <p className="text-[11px] text-gray-300 font-medium leading-tight">
                    Nos ayuda a saber cómo llegaste a nosotros
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                title="Cerrar pregunta"
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-2"
              >
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h5 className="font-black text-base text-white">¡Muchas gracias! 🙌</h5>
                <p className="text-xs text-gray-300 max-w-xs mx-auto">
                  Tu respuesta quedó registrada. ¡Que disfrutes de tus Tucas calientitas y doradas!
                </p>
              </motion.div>
            ) : selectedCanal === 'Otro' ? (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleCustomSubmit}
                className="space-y-3 pt-1"
              >
                <p className="text-xs text-amber-200 font-medium">
                  Cuéntanos un poco más cómo nos encontraste:
                </p>
                <input
                  type="text"
                  required
                  autoFocus
                  value={customDetail}
                  onChange={(e) => setCustomDetail(e.target.value)}
                  placeholder="Ej: Un vecino, anuncio, evento..."
                  className="w-full h-11 px-3.5 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs font-bold focus:border-[#fac124] outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCanal(null)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-700 text-xs font-bold text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !customDetail.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-[#fac124] hover:bg-[#e6b11e] text-[#5a0606] text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Enviando...' : 'Enviar'}</span>
                  </button>
                </div>
              </motion.form>
            ) : (
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-1.5">
                  {CANALES_ORIGEN.map((canal) => (
                    <button
                      key={canal.id}
                      onClick={() => handleSelectOption(canal.label)}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 p-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-800 hover:border-[#fac124]/60 text-left transition-all group active:scale-95 disabled:opacity-50 text-xs"
                    >
                      <span className="text-base shrink-0 group-hover:scale-110 transition-transform">
                        {canal.icon}
                      </span>
                      <span className="font-semibold text-gray-200 group-hover:text-[#fac124] leading-tight text-[11px] line-clamp-1">
                        {canal.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
