const fs = require('fs');
let code = fs.readFileSync('src/pages/Cocina.tsx', 'utf8');

// Remove: const [isAuthenticated, setIsAuthenticated] = useState(false);
code = code.replace(/  const \[isAuthenticated, setIsAuthenticated\] = useState\(false\);\n/, "");
// Remove: const [pin, setPin] = useState("");
code = code.replace(/  const \[pin, setPin\] = useState\(""\);\n/, "");

// Remove handleLogin
code = code.replace(/  const handleLogin = \(e: React\.FormEvent\) => {[\s\S]*?  };\n/, "");

// Remove if (!isAuthenticated) return; from useEffect
code = code.replace(/    if \(!isAuthenticated\) return;\n/, "");

// Remove isAuthenticated from useEffect dependencies
code = code.replace(/  }, \[isAuthenticated\]\);/g, "  }, []);");

// Remove the login form UI
const loginFormStr = `  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm rounded-3xl overflow-hidden border-none shadow-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="bg-[#5a0606]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="h-8 w-8 text-[#5a0606]" />
              </div>
              <h1 className="text-2xl font-bold text-[#0D0D0D]">Acceso Cocina</h1>
              <p className="text-gray-500 text-sm">Ingresa tu PIN de 4 dígitos (Prueba: 1234)</p>
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
              <Button type="submit" className="w-full h-14 bg-[#5a0606] hover:bg-[#4a0505] text-white font-bold text-lg rounded-xl">
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }`;

// Find start and end of that if block safely
code = code.replace(/  if \(!isAuthenticated\) \{[\s\S]*?    \);\n  \}/, "");

fs.writeFileSync('src/pages/Cocina.tsx', code);
