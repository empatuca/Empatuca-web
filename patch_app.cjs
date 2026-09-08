const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const isStaffRoute = ["/mesa", "/caja", "/cocina", "/inventario"].includes(currentPath);
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
}`;

const replacement = `  const isStaffRoute = ["/mesa", "/caja", "/cocina", "/inventario"].includes(currentPath);

  if (isStaffRoute) {
    if (localStorage.getItem('empatuca_staff_auth') !== 'true' && sessionStorage.getItem('empatuca_staff_auth') !== 'true') {
      window.history.pushState(null, '', '/personal'); window.dispatchEvent(new Event('popstate'));
      return null;
    }
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
      
      {!isLoading && isStaffRoute && currentPath === "/mesa" && <Mesa />}
      {!isLoading && isStaffRoute && currentPath === "/caja" && <Caja />}
      {!isLoading && isStaffRoute && currentPath === "/cocina" && <Cocina />}
      {!isLoading && isStaffRoute && currentPath === "/inventario" && <Inventario />}
      {!isLoading && currentPath === "/personal" && <StaffLogin />}
      {!isLoading && !isStaffRoute && currentPath !== "/personal" && <Home />}
    </>
  );
}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success");
} else {
  // Let's just find the start and end indices
  const startIdx = code.indexOf('const isStaffRoute = ["/mesa",');
  const endIdx = code.indexOf('<Home />\n    </>\n  );\n}');
  if (startIdx !== -1 && endIdx !== -1) {
    const startStr = code.substring(0, startIdx);
    const endStr = '  );\n}';
    
    code = startStr + replacement + endStr;
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success via fallback");
  } else {
    console.log("Failed completely.");
  }
}
