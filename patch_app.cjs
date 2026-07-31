const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldRouting = `  if (currentHash === "#personal") {
    return <StaffLogin />;
  }
  if (currentHash === "#mesa") {
    return <Mesa />;
  }
  if (currentHash === "#caja") {
    return <Caja />;
  }
  if (currentHash === "#cocina") {
    return <Cocina />;
  }`;

const newRouting = `  const isStaffRoute = ["#mesa", "#caja", "#cocina"].includes(currentHash);
  if (isStaffRoute) {
    if (localStorage.getItem('empatuca_staff_auth') !== 'true') {
      window.location.hash = '#personal';
      return null;
    }
    if (currentHash === "#mesa") return <Mesa />;
    if (currentHash === "#caja") return <Caja />;
    if (currentHash === "#cocina") return <Cocina />;
  }
  
  if (currentHash === "#personal") {
    return <StaffLogin />;
  }`;

code = code.replace(oldRouting, newRouting);
fs.writeFileSync('src/App.tsx', code);
