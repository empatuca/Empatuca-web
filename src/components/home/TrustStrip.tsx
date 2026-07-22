import { siteConfig } from "../../../siteConfig";
import { motion } from "motion/react";

export function TrustStrip() {
  return (
    <section className="bg-[#5a0606] h-auto md:h-24 flex items-center shrink-0 border-t border-white/10 py-8 md:py-0 relative reveal-on-scroll">
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 0l10 10-10 10L0 10z\' fill=\'%23ffffff\' fill-opacity=\'0.06\'/%3E%3C/svg%3E")' }}
      ></div>
      <div className="container mx-auto px-4 md:px-8 w-full relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/10 text-center">
          {siteConfig.stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center justify-center px-4"
            >
              <span className="text-3xl font-black text-[#fac124]">
                {stat.value}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white mt-1 font-bold">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
