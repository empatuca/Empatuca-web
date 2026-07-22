/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Cocina from "./pages/Cocina";

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
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
  }, [currentHash]);

  if (currentHash === "#cocina") {
    return <Cocina />;
  }

  return <Home />;
}
