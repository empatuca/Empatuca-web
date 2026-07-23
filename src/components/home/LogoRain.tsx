import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";

export function LogoRain({ active }: { active: boolean }) {
  const [drops, setDrops] = useState<any[]>([]);

  useEffect(() => {
    if (active) {
      // Create drops with distributed positions to prevent overlap
      const totalDrops = 35;
      const newDrops = Array.from({ length: totalDrops }).map((_, i) => {
        // Distribute X positions evenly across screen, with a little random jitter
        const segment = 100 / totalDrops;
        const xPos = (i * segment) + (Math.random() * segment);
        
        return {
          id: i,
          x: xPos,
          // Stagger delays widely (0 to 1.5 seconds) so they don't fall all at once
          delay: Math.random() * 1.5,
          // Vary duration (speed) significantly (1.5 to 3.5 seconds)
          duration: 1.5 + Math.random() * 2,
          // Vary size significantly (15px to 80px)
          size: 15 + Math.random() * 65,
          // Random rotation
          rotation: -45 + Math.random() * 90
        };
      });
      // Shuffle array so they don't fall sequentially left-to-right
      setDrops(newDrops.sort(() => Math.random() - 0.5));
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
