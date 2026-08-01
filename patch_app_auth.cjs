const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(
  "if (localStorage.getItem('empatuca_staff_auth') !== 'true') {",
  "if (localStorage.getItem('empatuca_staff_auth') !== 'true' && sessionStorage.getItem('empatuca_staff_auth') !== 'true') {"
);

fs.writeFileSync('src/App.tsx', appCode);

let staffCode = fs.readFileSync('src/pages/StaffLogin.tsx', 'utf8');
staffCode = staffCode.replace(
  'const [pin, setPin] = useState("");',
  'const [pin, setPin] = useState("");\n  const [rememberMe, setRememberMe] = useState(false);\n\n  // Check if already remembered\n  useEffect(() => {\n    const rememberedRole = localStorage.getItem("empatuca_staff_role");\n    if (rememberedRole && localStorage.getItem("empatuca_staff_auth") === "true") {\n      window.location.hash = `#${rememberedRole}`;\n    }\n  }, []);'
);

staffCode = staffCode.replace(
  'localStorage.setItem(\'empatuca_staff_auth\', \'true\');\n      window.location.hash = `#${selectedRole}`;',
  'if (rememberMe) {\n        localStorage.setItem(\'empatuca_staff_auth\', \'true\');\n        localStorage.setItem(\'empatuca_staff_role\', selectedRole || \'\');\n      } else {\n        sessionStorage.setItem(\'empatuca_staff_auth\', \'true\');\n      }\n      window.location.hash = `#${selectedRole}`;'
);

staffCode = staffCode.replace(
  '<button type="submit" className="w-full h-14 bg-[#5a0606] hover:bg-[#4a0505] text-white font-bold text-lg rounded-xl">',
  `<label className="flex items-center space-x-2 cursor-pointer mt-2">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#5a0606] rounded border-gray-300 focus:ring-[#5a0606]"
              />
              <span className="text-sm text-gray-600">Mantener sesión iniciada</span>
            </label>
            <button type="submit" className="w-full h-14 bg-[#5a0606] hover:bg-[#4a0505] text-white font-bold text-lg rounded-xl">`
);

fs.writeFileSync('src/pages/StaffLogin.tsx', staffCode);
