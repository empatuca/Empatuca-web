const fs = require('fs');
let code = fs.readFileSync('src/pages/StaffLogin.tsx', 'utf8');

const oldHandleLogin = `  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      window.location.hash = \`#\${selectedRole}\`;
    } else {
      alert("PIN incorrecto");
    }
  };`;

const newHandleLogin = `  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1718737099CBSC1997") {
      localStorage.setItem('empatuca_staff_auth', 'true');
      window.location.hash = \`#\${selectedRole}\`;
    } else {
      alert("PIN incorrecto");
    }
  };`;
code = code.replace(oldHandleLogin, newHandleLogin);

const oldInput = `            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-3xl tracking-[1em] h-16 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a0606]"
              maxLength={4}
              autoFocus
            />`;

const newInput = `            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-xl tracking-widest h-16 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a0606]"
              autoFocus
            />`;
code = code.replace(oldInput, newInput);

fs.writeFileSync('src/pages/StaffLogin.tsx', code);
