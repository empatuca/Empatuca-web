const fs = require('fs');

const fixNotif = (file, role) => {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    'const [prevOrdersCount, setPrevOrdersCount] = useState(0);',
    'const [prevOrdersCount, setPrevOrdersCount] = useState(0);\n  const isInitialLoad = React.useRef(true);'
  );

  code = code.replace(
    `if (pendingOrders > prevOrdersCount && prevOrdersCount > 0) {`,
    `if (pendingOrders > prevOrdersCount && !isInitialLoad.current) {`
  );
  
  code = code.replace(
    `setPrevOrdersCount(pendingOrders);\n  }, [orders]);`,
    `setPrevOrdersCount(pendingOrders);\n    if (orders.length > 0) isInitialLoad.current = false;\n  }, [orders]);`
  );

  fs.writeFileSync(file, code);
}

fixNotif('src/pages/Caja.tsx', 'caja');
fixNotif('src/pages/Cocina.tsx', 'cocina');
