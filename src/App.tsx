/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Home from "./pages/Home";
import Cocina from "./pages/Cocina";
import Inventario from "./pages/Inventario";
import StaffLogin from "./pages/StaffLogin";
import Caja from "./pages/Caja";
import Mesa from "./pages/Mesa";


export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.location.pathname !== '/' && !['/mesa', '/caja', '/cocina', '/personal', '/inventario'].includes(window.location.pathname)) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setCurrentPath('');
    }
  }, []);

  useEffect(() => {
    // Add loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleHashChange);
    return () => window.removeEventListener("popstate", handleHashChange);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [currentPath, isLoading]);

  const isStaffRoute = ["/mesa", "/caja", "/cocina", "/inventario"].includes(currentPath);
  if (isStaffRoute) {
    if (localStorage.getItem('empatuca_staff_auth') !== 'true' && sessionStorage.getItem('empatuca_staff_auth') !== 'true') {
      window.history.pushState(null, '', '/personal'); window.dispatchEvent(new Event('popstate'));
      return null;
    }
    if (currentPath === "/mesa") return <Mesa />;
    if (currentPath === "/caja") return <Caja />;
    if (currentPath === "/cocina") return <Cocina />;
    if (currentPath === "/inventario") return <Inventario />;
  }
  
  if (currentPath === "/personal") {
    return <StaffLogin />;
  }

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-[#0D0D0D] flex flex-col items-center justify-center"
          >
            <motion.img 
              src="/logo_M.svg" 
              alt="Loading" 
              className="w-32 h-32 md:w-48 md:h-48 opacity-20"
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Home />
    </>
  );
}
