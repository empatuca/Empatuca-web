const fs = require('fs');
let code = fs.readFileSync('src/pages/StaffLogin.tsx', 'utf8');

const isAuthenticatedStr = "const isAuthenticated = localStorage.getItem('empatuca_staff_auth') === 'true' || sessionStorage.getItem('empatuca_staff_auth') === 'true';";

code = code.replace(
  'export default function StaffLogin() {\n  const [selectedRole, setSelectedRole] = useState<string | null>(null);',
  `export default function StaffLogin() {\n  const [selectedRole, setSelectedRole] = useState<string | null>(null);\n  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('empatuca_staff_auth') === 'true' || sessionStorage.getItem('empatuca_staff_auth') === 'true');`
);

code = code.replace(
  '<div className="mt-12 text-center">\n          <a href="#" className="text-white/40 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">\n            ← Volver al sitio principal\n          </a>\n        </div>',
  `<div className="mt-12 text-center flex flex-col items-center gap-4">
          <a href="#" className="text-white/40 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors">
            ← Volver al sitio principal
          </a>
          {isAuthenticated && (
            <button 
              onClick={() => {
                localStorage.removeItem('empatuca_staff_auth');
                localStorage.removeItem('empatuca_staff_role');
                sessionStorage.removeItem('empatuca_staff_auth');
                setIsAuthenticated(false);
              }}
              className="text-red-400 hover:text-red-300 uppercase tracking-widest text-xs font-bold transition-colors"
            >
              Cerrar Sesión
            </button>
          )}
        </div>`
);

fs.writeFileSync('src/pages/StaffLogin.tsx', code);
