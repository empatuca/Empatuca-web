import React, { useState, useEffect } from "react";
import { UtensilsCrossed, MonitorCheck, DollarSign } from "lucide-react";

export default function StaffLogin() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1718737099CBSC1997") {
      localStorage.setItem('empatuca_staff_auth', 'true');
      window.location.hash = `#${selectedRole}`;
    } else {
      alert("PIN incorrecto");
    }
  };

  if (selectedRole) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 space-y-6 relative">
          <button 
            onClick={() => { setSelectedRole(null); setPin(""); }}
            className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            ← Volver
          </button>
          
          <div className="text-center space-y-2 pt-4">
            <h1 className="text-2xl font-bold text-[#0D0D0D] capitalize">Acceso {selectedRole}</h1>
            <p className="text-gray-500 text-sm">Ingresa tu PIN de acceso</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-white text-gray-900 text-center text-xl tracking-widest h-16 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a0606]"
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
    <div className="min-h-screen bg-[#0D0D0D] p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <img src="/logo_M.svg" alt="Empatuca" className="h-16 mx-auto mb-6 brightness-0 invert" />
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Acceso del Personal</h1>
          <p className="text-white/50 mt-2">Selecciona tu rol para continuar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => setSelectedRole('cocina')}
            className="bg-white hover:bg-gray-50 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="bg-[#5a0606]/10 p-4 rounded-full group-hover:bg-[#5a0606] transition-colors">
              <UtensilsCrossed className="h-8 w-8 text-[#5a0606] group-hover:text-white" />
            </div>
            <h2 className="text-xl font-black text-black uppercase tracking-wider">Cocina</h2>
          </button>

          <button 
            onClick={() => setSelectedRole('mesa')}
            className="bg-white hover:bg-gray-50 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="bg-[#fac124]/20 p-4 rounded-full group-hover:bg-[#fac124] transition-colors">
              <MonitorCheck className="h-8 w-8 text-amber-600 group-hover:text-black" />
            </div>
            <h2 className="text-xl font-black text-black uppercase tracking-wider">Mesa</h2>
          </button>

          <button 
            onClick={() => setSelectedRole('caja')}
            className="bg-white hover:bg-gray-50 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-500 transition-colors">
              <DollarSign className="h-8 w-8 text-green-700 group-hover:text-white" />
            </div>
            <h2 className="text-xl font-black text-black uppercase tracking-wider">Caja</h2>
          </button>
        </div>
        
        <div className="mt-12 text-center">
          <a href="#" className="text-white/40 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
            ← Volver al sitio principal
          </a>
        </div>
      </div>
    </div>
  );
}
