const fs = require('fs');
let code = fs.readFileSync('src/pages/StaffLogin.tsx', 'utf8');

// Remove the auto-redirect useEffect
code = code.replace(
  '  // Check if already remembered\n  useEffect(() => {\n    const rememberedRole = localStorage.getItem("empatuca_staff_role");\n    if (rememberedRole && localStorage.getItem("empatuca_staff_auth") === "true") {\n      window.location.hash = `#${rememberedRole}`;\n    }\n  }, []);',
  ''
);

// Modify handleRoleSelect to skip login if already authenticated
code = code.replace(
  'onClick={() => setSelectedRole(\'cocina\')}',
  `onClick={() => {
              if (localStorage.getItem('empatuca_staff_auth') === 'true' || sessionStorage.getItem('empatuca_staff_auth') === 'true') {
                window.location.hash = '#cocina';
              } else {
                setSelectedRole('cocina');
              }
            }}`
);

code = code.replace(
  'onClick={() => setSelectedRole(\'mesa\')}',
  `onClick={() => {
              if (localStorage.getItem('empatuca_staff_auth') === 'true' || sessionStorage.getItem('empatuca_staff_auth') === 'true') {
                window.location.hash = '#mesa';
              } else {
                setSelectedRole('mesa');
              }
            }}`
);

code = code.replace(
  'onClick={() => setSelectedRole(\'caja\')}',
  `onClick={() => {
              if (localStorage.getItem('empatuca_staff_auth') === 'true' || sessionStorage.getItem('empatuca_staff_auth') === 'true') {
                window.location.hash = '#caja';
              } else {
                setSelectedRole('caja');
              }
            }}`
);

fs.writeFileSync('src/pages/StaffLogin.tsx', code);
