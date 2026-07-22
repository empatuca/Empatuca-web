import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";

export function LogoRain({ active }: { active: boolean }) {
  const [drops, setDrops] = useState<any[]>([]);

  useEffect(() => {
    if (active) {
      // Create a bunch of drops
      const newDrops = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage x position
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 1.5, // 1 to 2.5 seconds
        size: 20 + Math.random() * 30, // 20px to 50px
        rotation: -20 + Math.random() * 40
      }));
      setDrops(newDrops);
    } else {
      setDrops([]);
    }
  }, [active]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {drops.map(drop => (
          <motion.img
            key={drop.id}
            src="/logo_M.svg"
            initial={{ 
              y: "-10vh", 
              x: `${drop.x}vw`, 
              opacity: 1, 
              rotate: drop.rotation,
              scale: drop.size / 30 
            }}
            animate={{ 
              y: "110vh",
              rotate: drop.rotation + (Math.random() > 0.5 ? 180 : -180)
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: drop.duration, 
              delay: drop.delay, 
              ease: "easeIn" 
            }}
            className="absolute w-12 h-12"
            style={{ 
              left: `${drop.x}vw`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
