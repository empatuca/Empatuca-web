import { siteConfig } from "../../../siteConfig";

export function SloganStrip() {
  return (
    <div className="bg-[#0D0D0D] border-b border-t border-white/5 py-4 shrink-0 reveal-on-scroll">
      <div className="container mx-auto px-4 md:px-12 flex justify-center items-center">
        <img src="/slogan.png" alt={siteConfig.tagline} className="h-6 md:h-8 w-auto" />
      </div>
    </div>
  );
}
