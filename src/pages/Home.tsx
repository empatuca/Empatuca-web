import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Hero } from "../components/home/Hero";
import { TrustStrip } from "../components/home/TrustStrip";
import { SloganStrip } from "../components/home/SloganStrip";
import { MenuSection } from "../components/home/MenuSection";
import { AboutSection } from "../components/home/AboutSection";
import { ProcessSection } from "../components/home/ProcessSection";
import { ContactSection } from "../components/home/ContactSection";
import { CTASection } from "../components/home/CTASection";
import { FloatingButtons } from "../components/home/FloatingButtons";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <SloganStrip />
        <MenuSection />
        <AboutSection />
        <ProcessSection />
        <ContactSection />
        <CTASection />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
