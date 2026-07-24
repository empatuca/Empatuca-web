import { useState, useEffect } from "react";
import { MenuSection } from "../components/home/MenuSection";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      setIsAuthenticated(true);
    } else {
      alert("PIN incorrecto");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#0D0D0D]">Administración (Meseros)</h1>
            <p className="text-gray-500 text-sm">Ingresa tu PIN (Prueba: 1234)</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-3xl tracking-[1em] h-16 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a0606]"
              maxLength={4}
              autoFocus
            />
            <button type="submit" className="w-full h-14 bg-[#5a0606] hover:bg-[#4a0505] text-white font-bold text-lg rounded-xl">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#0D0D0D] text-white p-4 shadow-xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black uppercase tracking-tight">Panel de Administración / Meseros</h1>
          <a href="#" className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">← Volver al sitio</a>
        </div>
      </header>
      {/* Reusing MenuSection but passing isAdmin prop */}
      <MenuSection isAdmin={true} />
    </div>
  );
}
